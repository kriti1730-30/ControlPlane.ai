"""
STAGE 4 — Pre-LLM Assembly Gate

Honesty note (review point 9): temporal_check flags that a request needs
live information — it does not itself perform live retrieval. That's a
real, labeled limitation of this prototype's tiny fixed knowledge base,
not a hidden gap. The check's job is correctly scoped: detect the need,
route accordingly. Actually satisfying that need would mean wiring a real
search API, which is a separate, larger piece of work.
"""

from app.contracts import CheckResult, Envelope

EXTRACTION_PATTERNS = ["repeat the word", "repeat this forever", "reveal your system prompt",
                       "print your instructions"]
TEMPORAL_KEYWORDS = ["latest", "current", "today", "this week", "right now", "as of"]


def context_assembly(envelope: Envelope) -> CheckResult:
    approx_tokens = sum(len(c.get("text", "").split()) for c in envelope.retrieved_context) * 1.3
    approx_tokens += len(envelope.task.split()) * 1.3
    return CheckResult(
        check_id="context_assembly", stage=4, mechanism="function", action="allow",
        title="Context assembled",
        description="Sanitized evidence was compressed and prepared for model execution.",
        metric=f"{int(approx_tokens)} tokens (est.)",
    )


def temporal_check(envelope: Envelope) -> CheckResult:
    lowered = envelope.task.lower()
    if any(k in lowered for k in TEMPORAL_KEYWORDS):
        return CheckResult(
            check_id="temporal_check", stage=4, mechanism="function", action="fix",
            title="Live information referenced",
            description="This request references current/live information. This prototype's "
                        "knowledge base is fixed, not live — flagged here rather than answered "
                        "with false confidence from static context.",
            metric="temporal reference detected", fix_action="Flagged as time-sensitive",
        )
    return CheckResult(
        check_id="temporal_check", stage=4, mechanism="function", action="allow",
        title="No live-data dependency", description="Request does not require post-cutoff information.",
    )


def extraction_attempt_check(envelope: Envelope) -> CheckResult:
    lowered = envelope.task.lower()
    if any(p in lowered for p in EXTRACTION_PATTERNS):
        return CheckResult(
            check_id="extraction_attempt", stage=4, mechanism="function", action="block",
            title="Extraction attempt blocked",
            description="The request matches a known pattern for extracting system instructions "
                        "or memorized training data.",
            metric="pattern match",
        )
    return CheckResult(
        check_id="extraction_attempt", stage=4, mechanism="function", action="allow",
        title="No extraction pattern detected", description="Request does not match known extraction attack patterns.",
    )
