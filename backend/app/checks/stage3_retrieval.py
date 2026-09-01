"""
STAGE 3 — Retrieval / Tool Gate

Fix from review point 3: pii_scan_context previously only COUNTED PII
spans and claimed "sanitized context rebuilt" while the original,
unredacted text still flowed to the model. It now actually returns
redacted text, and the orchestrator is required to use that returned
text going forward — see orchestrator/pipeline.py, which replaces
envelope.retrieved_context with the redacted version before Stage 4
ever touches it.
"""

import re
from typing import Optional

from app.contracts import CheckResult, Envelope
from app.llm.client import LLMUnavailable, structured_call

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_RE = re.compile(r"\b\d{3}-\d{4}\b")

PII_SCHEMA = {
    "type": "object",
    "properties": {
        "spans": {"type": "array", "items": {"type": "string"}},
        "types": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["spans", "types"],
}


def acl_check(envelope: Envelope) -> CheckResult:
    ungoverned = [c for c in envelope.retrieved_context if c.get("source_governance") == "ungoverned"]
    if ungoverned:
        return CheckResult(
            check_id="acl_check", stage=3, mechanism="function", action="fix",
            title="Ungoverned source flagged",
            description="One or more retrieved sources are not on the certified knowledge-base list "
                        "and are being treated as untrusted content.",
            metric=f"{len(ungoverned)} ungoverned source(s)",
        )
    return CheckResult(
        check_id="acl_check", stage=3, mechanism="function", action="allow",
        title="Sources verified", description="All retrieved sources passed provenance and access checks.",
        metric=f"{len(envelope.retrieved_context)} / {len(envelope.retrieved_context)} sources",
    )


def _redact(text: str, spans: list[str]) -> str:
    redacted = text
    for span in spans:
        if span:
            redacted = redacted.replace(span, "[REDACTED]")
    return redacted


async def pii_scan_context(
    envelope: Envelope, provider: Optional[str]
) -> tuple[CheckResult, list[dict]]:
    """Returns (check_result, redacted_context) — the caller MUST use the
    redacted_context going forward, not envelope.retrieved_context as-is."""
    combined_text = " ".join(c.get("text", "") for c in envelope.retrieved_context)
    if not combined_text.strip():
        return CheckResult(check_id="pii_scan_context", stage=3, mechanism="function",
                            action="allow", title="No retrieved content to scan",
                            description="No context was retrieved for this request."), \
               envelope.retrieved_context

    spans: list[str] = []
    live = False
    if provider:
        try:
            result = await structured_call(
                system_prompt="Extract any personally identifiable information (emails, phone "
                              "numbers, full names tied to individuals, addresses) from this text. "
                              "Return the EXACT substrings as they appear in the text.",
                user_prompt=combined_text, json_schema=PII_SCHEMA, provider=provider,
            )
            spans = result["spans"]
            live = True
        except LLMUnavailable:
            pass

    if not live:
        spans = EMAIL_RE.findall(combined_text) + PHONE_RE.findall(combined_text)

    if not spans:
        return CheckResult(
            check_id="pii_scan_context", stage=3, mechanism="llm" if live else "function",
            action="allow", title="Source content clear",
            description="No sensitive fields detected in retrieved context.",
            metric="0 fields flagged", live=live,
        ), envelope.retrieved_context

    # the actual redaction — every retrieved chunk's text gets rewritten
    redacted_context = [
        {**chunk, "text": _redact(chunk.get("text", ""), spans)}
        for chunk in envelope.retrieved_context
    ]
    result = CheckResult(
        check_id="pii_scan_context", stage=3, mechanism="llm" if live else "function",
        action="fix", title="Sensitive fields detected",
        description="Personally identifiable information was found and redacted from the "
                    "retrieved context before it reaches the model.",
        metric=f"{len(spans)} field(s) removed", fix_action="Context redacted and rebuilt", live=live,
    )
    return result, redacted_context
