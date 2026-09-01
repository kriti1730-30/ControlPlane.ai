"""
STAGE 5 — Agentic Execution & Controls

Fix from review point 5: entailment_gate previously flagged an unsupported
claim but never replaced envelope.draft_output — the "repaired" label was
false. regenerate_grounded() below is the actual fix: it re-calls the model
with an explicit corrective instruction and returns new text the
orchestrator is required to substitute in.

Fix from review point 4: impact_reversibility_gate now reads
envelope.proposed_actions, which the orchestrator populates from the
model's own structured output (see orchestrator/pipeline.py) — not an
empty list nothing ever fills.
"""

from typing import Optional

from app.contracts import CheckResult, Envelope
from app.llm.client import LLMUnavailable, ProviderRateLimited, free_text_call, structured_call

ENTAILMENT_SCHEMA = {
    "type": "object",
    "properties": {
        "entailment": {"type": "string", "enum": ["entailed", "neutral", "contradicted"]},
        "confidence": {"type": "number"},
    },
    "required": ["entailment", "confidence"],
}

HIGH_IMPACT_TOOLS = {"issue_refund": 10000, "update_address": 0, "delete_file": 0, "deploy_production": 0}


async def entailment_gate(envelope: Envelope, provider: Optional[str]) -> CheckResult:
    context_text = " ".join(c.get("text", "") for c in envelope.retrieved_context)
    if not context_text.strip() or not envelope.draft_output:
        return CheckResult(check_id="entailment_gate", stage=5, mechanism="function",
                            action="allow", title="No grounding claim to verify",
                            description="No retrieved evidence was available to check the draft against.")

    if provider:
        try:
            result = await structured_call(
                system_prompt="Does the CLAIM follow from the EVIDENCE? Classify as entailed, "
                              "neutral (unsupported but not contradicted), or contradicted.",
                user_prompt=f"EVIDENCE:\n{context_text}\n\nCLAIM:\n{envelope.draft_output}",
                json_schema=ENTAILMENT_SCHEMA, provider=provider,
            )
            entailed = result["entailment"] == "entailed"
            return _entailment_result(entailed, result["confidence"], live=True)
        except LLMUnavailable:
            pass

    overlap = len(set(envelope.draft_output.lower().split()) & set(context_text.lower().split()))
    entailed = overlap >= 3
    return _entailment_result(entailed, 0.5, live=False)


def _entailment_result(entailed: bool, confidence: float, live: bool) -> CheckResult:
    mech = "llm" if live else "function"
    if entailed:
        return CheckResult(check_id="entailment_gate", stage=5, mechanism=mech, action="allow",
                            title="Response grounded in evidence",
                            description="The draft response is supported by retrieved context.",
                            metric=f"confidence · {confidence:.2f}", live=live)
    return CheckResult(check_id="entailment_gate", stage=5, mechanism=mech, action="fix",
                        title="Unsupported claim detected",
                        description="One or more claims in the draft are not supported by the retrieved evidence.",
                        metric=f"confidence · {confidence:.2f}", fix_action="Regenerating with grounding constraint", live=live)


async def regenerate_grounded(envelope: Envelope, provider: Optional[str], model: Optional[str]) -> Optional[str]:
    """The actual fix for review point 5 — really produces a new answer,
    which the orchestrator substitutes for envelope.draft_output. Returns
    None if no provider is available (caller must not silently keep the
    original unsupported draft in that case — see orchestrator handling)."""
    if not provider:
        return None
    context_text = " ".join(c.get("text", "") for c in envelope.retrieved_context)
    try:
        return await free_text_call(
            system_prompt=(
                "Your previous answer included claims not supported by the retrieved context below. "
                "Answer again using ONLY what is stated in the context. If the context doesn't contain "
                "enough information, say so explicitly rather than guessing.\n\nCONTEXT:\n" + context_text
            ),
            user_prompt=envelope.task, provider=provider, model=model,
        )
    except LLMUnavailable:
        return None


def _agrees(a: str, b: str) -> bool:
    """Cheap pairwise agreement check — token-overlap ratio, not exact match."""
    a_tokens, b_tokens = set(a.lower().split()), set(b.lower().split())
    if not a_tokens or not b_tokens:
        return a.strip()[:50] == b.strip()[:50]
    return len(a_tokens & b_tokens) / max(len(a_tokens), len(b_tokens)) > 0.4


async def self_consistency(envelope: Envelope, provider: Optional[str], model: Optional[str]) -> CheckResult:
    """
    llm-call-efficiency: was n=3 up front on every call. Now n=1 for the
    ordinary case (the new sample agrees with the original draft — done,
    one call spent) and only escalates to a second sample (n=2 max) when
    the first one disagrees, which is genuinely the only case where a
    second data point changes the decision.
    """
    if not provider:
        return CheckResult(check_id="self_consistency", stage=5, mechanism="function", action="escalate",
                            title="Consistency check unavailable",
                            description="No live model configured to resample — escalating for human review.",
                            live=False)
    try:
        first_sample = await free_text_call(
            system_prompt="Answer concisely based only on the given context.",
            user_prompt=envelope.task, provider=provider, model=model, max_tokens=200,
        )
        if _agrees(first_sample, envelope.draft_output or ""):
            return CheckResult(check_id="self_consistency", stage=5, mechanism="llm", action="allow",
                                title="Consistent on resample",
                                description="A single resample agreed closely with the original response.",
                                metric="samples · 1", live=True)

        # First resample disagreed with the original — worth exactly one
        # more sample before deciding, never more than that.
        second_sample = await free_text_call(
            system_prompt="Answer concisely based only on the given context.",
            user_prompt=envelope.task, provider=provider, model=model, max_tokens=200,
        )
        resamples_agree = _agrees(first_sample, second_sample)
        return CheckResult(
            check_id="self_consistency", stage=5, mechanism="llm", action="escalate",
            title="Low agreement across resamples" if not resamples_agree else "Original answer diverges from resamples",
            description=(
                "Regenerating the same request produced meaningfully different answers — "
                "genuine model uncertainty, not noise." if not resamples_agree else
                "Two independent resamples agree with each other but differ from the original "
                "answer, suggesting the original may be the outlier."
            ),
            metric="samples · 2", live=True,
        )
    except ProviderRateLimited:
        raise
    except LLMUnavailable:
        return CheckResult(check_id="self_consistency", stage=5, mechanism="function", action="escalate",
                            title="Consistency check unavailable",
                            description="Model call failed — escalating for human review rather than guessing.",
                            live=False)


def impact_reversibility_gate(envelope: Envelope) -> CheckResult:
    for action in envelope.proposed_actions:
        tool = action.get("tool")
        threshold = HIGH_IMPACT_TOOLS.get(tool)
        if threshold is None or tool == "none":
            continue
        if tool == "issue_refund" and action.get("amount", 0) > threshold:
            return CheckResult(
                check_id="impact_gate", stage=5, mechanism="function", action="escalate",
                title="High-impact action proposed",
                description=f"Refund of {action.get('amount')} exceeds the autonomous approval threshold.",
                metric="impact · HIGH", fix_action="Execution paused",
                detail={"proposed_actions": envelope.proposed_actions},
            )
        if tool in ("update_address", "delete_file", "deploy_production"):
            return CheckResult(
                check_id="impact_gate", stage=5, mechanism="function", action="escalate",
                title="Irreversible action proposed",
                description=f"'{tool}' has low reversibility and needs confirmation.",
                metric="reversibility · LOW", fix_action="Execution paused",
                detail={"proposed_actions": envelope.proposed_actions},
            )
    return CheckResult(check_id="impact_gate", stage=5, mechanism="function", action="allow",
                        title="No action exceeds autonomous thresholds",
                        description="All proposed actions are within permitted impact and reversibility limits.")


def cost_ledger(cumulative_cost: float, budget: float) -> CheckResult:
    ratio = cumulative_cost / budget if budget else 0
    if ratio >= 1.0:
        return CheckResult(check_id="cost_ledger", stage=5, mechanism="function", action="block",
                            title="Budget exceeded", description="This task's compute budget has been fully consumed.",
                            metric=f"{cumulative_cost:.2f} / {budget:.2f}")
    if ratio >= 0.8:
        return CheckResult(check_id="cost_ledger", stage=5, mechanism="function", action="escalate",
                            title="Budget nearly exhausted", description="Confirm before continuing.",
                            metric=f"{cumulative_cost:.2f} / {budget:.2f}")
    return CheckResult(check_id="cost_ledger", stage=5, mechanism="function", action="allow",
                        title="Within budget", description="Task cost is within the allocated budget.",
                        metric=f"{cumulative_cost:.2f} / {budget:.2f}")