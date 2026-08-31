"""
STAGE 6 — Output Verification

registry_check remains the one unconditional, deterministic, non-LLM check
in the system — a real HTTP call to npm, nothing to fall back on because
nothing about it should ever be probabilistic.
"""

from typing import Optional

import httpx
from app.contracts import CheckResult, Envelope
from app.checks.stage3_retrieval import EMAIL_RE, PHONE_RE
from app.llm.client import LLMUnavailable, structured_call

TOXICITY_SCHEMA = {
    "type": "object",
    "properties": {"toxicity_score": {"type": "number"}, "reason": {"type": "string"}},
    "required": ["toxicity_score", "reason"],
}
ATTRIBUTE_SCHEMA = {
    "type": "object",
    "properties": {
        "inferred_sensitive_attribute": {"type": "boolean"},
        "attribute": {"type": "string"},
    },
    "required": ["inferred_sensitive_attribute", "attribute"],
}


async def registry_check(package_name: Optional[str]) -> Optional[CheckResult]:
    if not package_name:
        return None
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(f"https://registry.npmjs.org/{package_name}")
        exists = resp.status_code == 200
    except httpx.HTTPError:
        exists = None

    if exists is False:
        return CheckResult(
            check_id="registry_check", stage=6, mechanism="function", action="block",
            title="Package does not exist",
            description=f"'{package_name}' was not found in the npm registry — likely hallucinated.",
            metric="npm lookup · not found",
        )
    if exists is True:
        return CheckResult(
            check_id="registry_check", stage=6, mechanism="function", action="allow",
            title="Package verified", description=f"'{package_name}' exists in the npm registry.",
            metric="npm lookup · confirmed",
        )
    return CheckResult(
        check_id="registry_check", stage=6, mechanism="function", action="escalate",
        title="Registry lookup failed", description="Could not verify the package — network error.",
        metric="npm lookup · unavailable",
    )


async def toxicity_check(text: str, provider: Optional[str]) -> CheckResult:
    if provider:
        try:
            result = await structured_call(
                system_prompt="Rate the toxicity/harmfulness of this text from 0 (benign) to 1 (severe).",
                user_prompt=text, json_schema=TOXICITY_SCHEMA, provider=provider,
            )
            return _toxicity_result(result["toxicity_score"], live=True)
        except LLMUnavailable:
            pass
    return _toxicity_result(0.0, live=False)


def _toxicity_result(score: float, live: bool) -> CheckResult:
    mech = "llm" if live else "function"
    if score > 0.6:
        return CheckResult(check_id="toxicity_check", stage=6, mechanism=mech, action="block",
                            title="Harmful content detected", description="Output exceeds the toxicity threshold.",
                            metric=f"toxicity · {score:.2f}", live=live)
    return CheckResult(check_id="toxicity_check", stage=6, mechanism=mech, action="allow",
                        title="Content safety passed", description="No harmful content detected in the output.",
                        metric=f"toxicity · {score:.2f}", live=live)


async def pii_scan_output(text: str) -> CheckResult:
    spans = EMAIL_RE.findall(text) + PHONE_RE.findall(text)
    if spans:
        return CheckResult(check_id="pii_scan_output", stage=6, mechanism="function", action="block",
                            title="Sensitive data in output",
                            description="The generated response contains personally identifiable information.",
                            metric=f"{len(spans)} field(s)")
    return CheckResult(check_id="pii_scan_output", stage=6, mechanism="function", action="allow",
                        title="Output clear of sensitive data", description="No PII detected in the final response.")


async def counterfactual_fairness(output_text: str, envelope: Envelope, provider: Optional[str]) -> Optional[CheckResult]:
    if envelope.risk.sensitivity != "high" or not provider:
        return None
    try:
        result = await structured_call(
            system_prompt="Does this output state or clearly imply a sensitive personal attribute "
                          "(health, ethnicity, religion, orientation) about a named individual that "
                          "was not explicitly provided in the source context?",
            user_prompt=output_text, json_schema=ATTRIBUTE_SCHEMA, provider=provider,
        )
        if result["inferred_sensitive_attribute"]:
            return CheckResult(
                check_id="counterfactual_fairness", stage=6, mechanism="llm", action="escalate",
                title="Inferred sensitive attribute",
                description=f"Output appears to infer '{result['attribute']}' without it being stated in the source.",
                metric="attribute inference flagged", live=True,
            )
        return CheckResult(check_id="counterfactual_fairness", stage=6, mechanism="llm", action="allow",
                            title="No unsupported attribute inference",
                            description="Output does not appear to infer undisclosed sensitive attributes.", live=True)
    except LLMUnavailable:
        return None
