"""
The real, corrected pipeline. Fixes applied from review:
  - run_id generated ONCE here, threaded through every event and the store
    (never re-derived from an event's own id)
  - runs as a background task, streaming events via the event bus as each
    stage completes — POST /v1/runs returns run_id immediately
  - the model call is a single structured_call producing {answer,
    proposed_actions} together, so Stage 5's impact gate has real data
  - PII redaction actually replaces the context text used downstream
  - an unsupported-claim finding actually triggers regeneration, and the
    regenerated text actually replaces envelope.draft_output
  - the frontend's model selector actually selects the provider/model,
    via resolve_model()
  - actor_type distinguishes Employee runs from Customer Operations cases —
    same pipeline, same checks, just a tag and a couple of display fields
"""

import asyncio
import uuid
from typing import Any, Literal, Optional

from app.checks import stage1_identity, stage2_risk, stage3_retrieval, stage4_assembly, \
    stage5_agentic, stage6_output, stage7_learning
from app.checks.bias_sentinel import sentinel_log
from app.contracts import CheckResult, ControlEvent, Envelope, to_control_event
from app.db.sql_store import store
from app.event_bus import bus
from app.llm.client import LLMUnavailable, ProviderRateLimited, resolve_check_model, resolve_check_provider, resolve_model, structured_call

GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "answer": {"type": "string"},
        "proposed_actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "tool": {"type": "string", "enum": [
                        "none", "issue_refund", "update_address", "delete_file", "deploy_production"]},
                    "amount": {"type": "number"},
                    "target": {"type": "string"},
                },
                "required": ["tool"],
            },
        },
    },
    "required": ["answer", "proposed_actions"],
}

GENERATION_SYSTEM_PROMPT = (
    "You are an enterprise assistant. Answer the task using only the provided context if relevant. "
    "If completing this task genuinely requires taking a real action (issuing a refund, changing an "
    "address, deleting a file, deploying to production), list it in proposed_actions with the tool "
    "name and relevant parameters (amount for refunds, target for addresses/files/deployments). "
    "If no action is needed, return an empty proposed_actions list."
)

MOCK_DOCUMENTS: dict[str, dict[str, Any]] = {
    "acquisition targets": {
        "source": "Q3_acquisition_targets.pdf", "source_governance": "governed",
        "text": "Target: Meridian Labs. Contact: jane.doe@meridian.com, phone 555-0142. "
                "Estimated valuation $40M.",
    },
    "confidential": {
        "source": "Q3_acquisition_targets.pdf", "source_governance": "governed",
        "text": "Target: Meridian Labs. Contact: jane.doe@meridian.com, phone 555-0142. "
                "Estimated valuation $40M.",
    },
    "order": {
        "source": "order_db", "source_governance": "governed",
        "text": "Order #1842, status: delivered 2 days ago.",
    },
    "refund": {
        "source": "order_db", "source_governance": "governed",
        "text": "Order #8842, customer B, value 42000, status: in transit.",
    },
}


def _retrieve(task: str) -> list[dict[str, Any]]:
    lowered = task.lower()
    return [doc for key, doc in MOCK_DOCUMENTS.items() if key in lowered]


async def _emit(run_id: str, result: CheckResult) -> ControlEvent:
    event = to_control_event(result, event_id=f"{run_id}-{uuid.uuid4().hex[:6]}")
    await bus.publish(run_id, event, check_id=result.check_id)
    sentinel_log.record(result.check_id, result.action)
    return event


async def _await_human(run_id: str, timeout: float = 180.0) -> str:
    elapsed, interval = 0.0, 0.5
    while elapsed < timeout:
        record = store.get(run_id)
        if record and record.state == "running":  # resolved by routes/runs.py's /intervene handler
            return record.pending_intervention_decision  # type: ignore[attr-defined]
        await asyncio.sleep(interval)
        elapsed += interval
    return "deny"  # fail-safe: unresolved escalation times out to deny, never to allow


class _StageTracker:
    """Lets the outer exception wrapper report the stage that was ACTUALLY
    executing when something failed, instead of always saying 'Stage 1' —
    updated at each stage transition inside _run_pipeline_inner."""
    def __init__(self) -> None:
        self.stage = 1


async def run_pipeline(
    run_id: str,
    actor_type: Literal["employee", "customer_support"],
    task: str,
    model_label: str,
    mode_hint: Optional[str] = None,
    workflow: Optional[str] = None,
) -> None:
    """Thin safety wrapper: catches anything _run_pipeline_inner doesn't
    handle itself, so a bug in any stage becomes a visible blocked run
    instead of a silently-dead background task. This is the direct fix for
    'backend errors are structured and visible, not swallowed' — no
    LangGraph required, just not letting exceptions fall through
    fire-and-forget asyncio.create_task()."""
    tracker = _StageTracker()
    try:
        await _run_pipeline_inner(run_id, actor_type, task, model_label, mode_hint, tracker, workflow)
    except ProviderRateLimited as exc:
        retry_note = f"Retry after {int(exc.retry_after)}s" if exc.retry_after else "Retry shortly"
        await _emit(run_id, CheckResult(
            check_id="provider_rate_limit", stage=tracker.stage, mechanism="llm", action="escalate",
            title="Provider rate-limited",
            description=f"The '{exc.provider}' API returned a rate-limit response at Stage {tracker.stage}.",
            metric=retry_note,
        ))
        await store.update_state(run_id, state="blocked",
                                  final_output=f"Provider rate-limited ({exc.provider}). {retry_note}.")
    except Exception as exc:
        await _emit(run_id, CheckResult(
            check_id="pipeline_error", stage=tracker.stage, mechanism="function", action="block",
            title="Pipeline error",
            description=f"Unhandled {type(exc).__name__} at Stage {tracker.stage}: {exc}",
        ))
        await store.update_state(run_id, state="blocked",
                                  final_output=f"Internal error: {type(exc).__name__}: {exc}")


async def _run_pipeline_inner(
    run_id: str,
    actor_type: Literal["employee", "customer_support"],
    task: str,
    model_label: str,
    mode_hint: Optional[str] = None,
    tracker: Optional[_StageTracker] = None,
    workflow: Optional[str] = None,
) -> None:
    """The background task. Publishes events as it goes; the caller has
    already returned run_id to the client before this even starts."""
    record = store.get(run_id)
    provider, model = resolve_model(model_label)
    check_provider = resolve_check_provider()
    check_model = resolve_check_model(check_provider) if check_provider else None
    # check_provider/model may differ from the generation provider/model —
    # checks use whatever key IS configured, even if the user picked a
    # model for generation we can't reach
    envelope = Envelope(run_id=run_id, task=task, model_label=model_label)

    async def emit_and_check_block(result: CheckResult) -> bool:
        await _emit(run_id, result)
        if result.action == "block":
            await store.update_state(run_id, state="blocked", final_output=f"Blocked: {result.description}")
            return True
        return False

    async def emit_and_check_escalate(result: CheckResult) -> Optional[str]:
        """Returns the human decision if escalated, or None if not escalated."""
        event = await _emit(run_id, result)
        if result.action != "escalate":
            return None
        await store.update_state(run_id, state="waiting")
        record.pending_intervention = event
        decision = await _await_human(run_id)
        await store.update_state(run_id, state="running")
        return decision

    # --- Stage 1 ---
    if tracker: tracker.stage = 1
    if await emit_and_check_block(stage1_identity.tenant_identity(envelope)):
        return
    if await emit_and_check_block(stage1_identity.platform_and_jurisdiction(envelope)):
        return
    if await emit_and_check_block(await stage1_identity.injection_scan(envelope, check_provider)):
        return

    # --- Stage 2 ---
    if tracker: tracker.stage = 2
    risk_result, envelope.risk = await stage2_risk.risk_profile(envelope, check_provider)
    if mode_hint:
        envelope.risk.mode = mode_hint
    if await emit_and_check_block(risk_result):
        return
    # --- Stage 3 ---
    if tracker: tracker.stage = 3
    envelope.retrieved_context = _retrieve(task)
    if await emit_and_check_block(stage3_retrieval.acl_check(envelope)):
        return
    pii_result, redacted_context = await stage3_retrieval.pii_scan_context(envelope, check_provider)
    envelope.retrieved_context = redacted_context  # THE actual fix — downstream uses redacted text
    if await emit_and_check_block(pii_result):
        return

    # --- Stage 4 ---
    if tracker: tracker.stage = 4
    if await emit_and_check_block(stage4_assembly.extraction_attempt_check(envelope)):
        return
    await _emit(run_id, stage4_assembly.temporal_check(envelope))
    await _emit(run_id, stage4_assembly.context_assembly(envelope))

    # --- The real model call: BOTH plan and build modes call the model.
    # `mode` no longer decides whether generation happens — it only decides,
    # after generation, whether any proposed_actions are allowed to survive
    # into Stage 5's impact gate. A "plan" request still gets a real,
    # LLM-generated plan back; it just can never trigger a real action.
    if tracker: tracker.stage = 5
    context_text = "\n".join(c["text"] for c in envelope.retrieved_context)
    try:
        gen = await structured_call(
            system_prompt=f"{GENERATION_SYSTEM_PROMPT}\n\nCONTEXT:\n{context_text}",
            user_prompt=task, json_schema=GENERATION_SCHEMA, provider=provider, model=model,
        )
        envelope.draft_output = gen["answer"]
        if envelope.risk.mode == "plan":
            envelope.proposed_actions = []  # plan mode: never let a proposed action through
        else:
            envelope.proposed_actions = [a for a in gen["proposed_actions"] if a.get("tool") != "none"]

        # Deterministic, not model-inferred: this specific workflow entry
        # point already tells us what kind of request this is — a real
        # enterprise "deploy" button doesn't ask an LLM to re-guess that.
        # The model's own text answer is untouched; only the action flag
        # is guaranteed here rather than left to whether it chose to
        # mention it in proposed_actions.
        if workflow == "production_change" and envelope.risk.mode != "plan":
            already_flagged = any(a.get("tool") == "deploy_production" for a in envelope.proposed_actions)
            if not already_flagged:
                envelope.proposed_actions.append({"tool": "deploy_production", "target": task})
    except LLMUnavailable:
        # Fix (checklist item 8): this used to fabricate a sentence that
        # LOOKED like an assistant answer even though no model ever ran.
        # ControlPlane should never pretend a model answered when it didn't.
        await _emit(run_id, CheckResult(
            check_id="model_call", stage=5, mechanism="function", action="block",
            title="No model provider configured",
            description=f"No API key is configured for '{provider}' — no model call was made.",
        ))
        await store.update_state(run_id, state="blocked",
                                  final_output=f"No response generated: no '{provider}' API key is configured.")
        return
    except ProviderRateLimited as exc:
        # Fix: a 429 is a provider/quota condition, not a ControlPlane
        # policy decision — it gets `escalate` (retry-worthy), never `block`
        # (which implies content was disallowed), and it's tagged with the
        # stage that actually failed, not a generic "Stage 1 pipeline error".
        retry_note = f"Retry after {int(exc.retry_after)}s" if exc.retry_after else "Retry shortly"
        await _emit(run_id, CheckResult(
            check_id="model_call", stage=5, mechanism="llm", action="escalate",
            title="Provider rate-limited",
            description=f"The '{provider}' API returned a rate-limit response during generation.",
            metric=retry_note,
        ))
        await store.update_state(run_id, state="blocked",
                                  final_output=f"Provider rate-limited ({provider}). {retry_note}.")
        return
    except Exception as exc:
        # Any other real, unexpected provider/API error (bad key, rejected
        # schema, region block) — still a provider-side failure, not a
        # ControlPlane content decision, so it's labeled as such.
        await _emit(run_id, CheckResult(
            check_id="model_call", stage=5, mechanism="llm", action="block",
            title="Provider error",
            description=f"The '{provider}' API call raised {type(exc).__name__}: {exc}",
        ))
        await store.update_state(run_id, state="blocked",
                                  final_output=f"Provider error: {type(exc).__name__}: {exc}")
        return

    # --- Stage 5 ---
    entailment_result = await stage5_agentic.entailment_gate(envelope, check_provider)
    flagged = entailment_result.action != "allow"
    await _emit(run_id, entailment_result)

    if flagged:
        regenerated = await stage5_agentic.regenerate_grounded(envelope, provider, model)
        if regenerated:
            envelope.draft_output = regenerated  # THE actual fix — really replaces the draft
        consistency_result = await stage5_agentic.self_consistency(envelope, check_provider, check_model)
        consistency_decision = await emit_and_check_escalate(consistency_result)
        if consistency_decision == "deny":
            await store.update_state(run_id, state="blocked", final_output="Denied after low-consistency review.")
            return
        if consistency_result.action == "block":
            await store.update_state(run_id, state="blocked", final_output=f"Blocked: {consistency_result.description}")
            return

    impact_result = stage5_agentic.impact_reversibility_gate(envelope)
    decision = await emit_and_check_escalate(impact_result)
    if decision == "deny":
        await store.update_state(run_id, state="blocked", final_output="Action denied by reviewer.")
        return

    # --- Stage 6 ---
    if tracker: tracker.stage = 6
    if await emit_and_check_block(await stage6_output.toxicity_check(envelope.draft_output, check_provider)):
        return
    if await emit_and_check_block(await stage6_output.pii_scan_output(envelope.draft_output)):
        return
    cf_result = await stage6_output.counterfactual_fairness(envelope.draft_output, envelope, check_provider)
    if cf_result:
        await _emit(run_id, cf_result)

    # --- Stage 7 (post-hoc, never blocks) ---
    if tracker: tracker.stage = 7
    # Fix: final_output is now persisted BEFORE the Stage 7 event is emitted.
    # The old order emitted the event (triggering the frontend's WebSocket
    # handler to immediately GET the run) before final_output was actually
    # saved — a real race, not just a frontend timing issue. A GET made
    # well after the run finishes will never expose this, since the race
    # window has already closed by then.
    await store.update_state(run_id, state="completed", final_output=envelope.draft_output)
    await _emit(run_id, stage7_learning.record_outcome(envelope))


async def resolve_intervention(run_id: str, decision: Literal["approve", "deny"]) -> None:
    record = store.get(run_id)
    record.pending_intervention_decision = decision  # type: ignore[attr-defined]
    await store.update_state(run_id, state="running")  # signals _await_human's poll loop