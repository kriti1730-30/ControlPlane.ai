"""
STAGE 2 — Risk Profiling & Plan/Build Routing
"""

from typing import Optional

from app.contracts import CheckResult, Envelope, RiskTags
from app.llm.client import LLMUnavailable, structured_call

HIGH_STAKES_KEYWORDS = ["refund", "delete", "confidential", "acquisition", "payment",
                        "transfer", "production", "deploy", "restart"]

RISK_SCHEMA = {
    "type": "object",
    "properties": {
        "impact_tier": {"type": "string", "enum": ["low", "medium", "high"]},
        "sensitivity": {"type": "string", "enum": ["standard", "high"]},
        "reasons": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["impact_tier", "sensitivity", "reasons"],
}


async def risk_profile(envelope: Envelope, provider: Optional[str]) -> tuple[CheckResult, RiskTags]:
    # Fix: `mode` (plan/build) used to be an LLM output here, which meant
    # the model's own risk judgment could silently decide "plan" for an
    # ordinary question — and the pipeline then skipped calling the model
    # at all. mode is now purely an external execution policy (set by the
    # caller via mode_hint, defaulting to "build") — never something Stage 2
    # infers. This function only ever assesses RISK, never execution mode.
    if provider:
        try:
            result = await structured_call(
                system_prompt=(
                    "Classify the business risk of this AI task request. impact_tier reflects "
                    "how much damage a wrong or hijacked action could cause. "
                    "sensitivity is 'high' if it touches confidential, financial, or regulated data."
                ),
                user_prompt=envelope.task, json_schema=RISK_SCHEMA, provider=provider,
            )
            tags = RiskTags(
                impact_tier=result["impact_tier"], mode="build",
                sensitivity=result["sensitivity"], reasons=result["reasons"],
                score={"low": 10, "medium": 40, "high": 70}[result["impact_tier"]],
            )
            return _build_result(tags, live=True), tags
        except LLMUnavailable:
            pass

    lowered = envelope.task.lower()
    hits = [kw for kw in HIGH_STAKES_KEYWORDS if kw in lowered]
    tier = "high" if len(hits) >= 2 else "medium" if hits else "low"
    tags = RiskTags(impact_tier=tier, score={"low": 10, "medium": 40, "high": 70}[tier],
                     mode="build", sensitivity="high" if hits else "standard", reasons=hits)
    return _build_result(tags, live=False), tags


def _build_result(tags: RiskTags, live: bool) -> CheckResult:
    return CheckResult(
        check_id="risk_profile", stage=2, mechanism="llm" if live else "function", action="allow",
        title="Risk profile created",
        description="The request has been classified before deeper execution begins.",
        metric=f"impact · {tags.impact_tier.upper()}", live=live,
        detail={"mode": tags.mode, "sensitivity": tags.sensitivity, "reasons": tags.reasons},
    )