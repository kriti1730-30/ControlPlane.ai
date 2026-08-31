"""
BIAS SENTINEL — audits whether ControlPlane's OWN checks are biased,
not whether the underlying model is.

This is a different, harder-to-answer question than "does the LLM have
training bias" (which we structurally cannot answer — we consume a
foundation model via API and never see its training data, exactly the
constraint the brief calls out directly). What we CAN answer without any
training-data access is purely behavioral: across many runs, does a given
check (the injection scanner, the risk profiler, the impact gate) fire
more often for inputs sharing some incidental characteristic — a name
pattern, a phrasing style, a job title — that has nothing to do with
actual risk?

Two independent methods, deliberately not just one:
  1. Statistical (chi-square / effect size) - catches disparities in
     categorical outcome rates across a tagged group variable.
  2. LLM-as-judge - reviews a sample of (input, check, decision) triples
     and is explicitly asked to name any spurious correlation a
     statistical test alone might not surface (e.g. subtler stylistic
     patterns a chi-square over coarse categories would miss).

Both need accumulated volume - this is a Stage 7 (periodic) audit, not a
per-request check.
"""

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional

from scipy.stats import chi2_contingency

from app.llm.client import LLMUnavailable, resolve_check_provider, structured_call

JUDGE_SCHEMA = {
    "type": "object",
    "properties": {
        "spurious_pattern_found": {"type": "boolean"},
        "description": {"type": "string"},
        "affected_check": {"type": "string"},
    },
    "required": ["spurious_pattern_found", "description", "affected_check"],
}


@dataclass
class DecisionLogEntry:
    check_id: str
    action: str                      # allow | fix | escalate | block
    group_tag: Optional[str] = None  # a coarse, non-sensitive proxy tag set by the caller for audit purposes only


class BiasSentinelLog:
    def __init__(self) -> None:
        self.entries: list[DecisionLogEntry] = []

    def record(self, check_id: str, action: str, group_tag: Optional[str] = None) -> None:
        self.entries.append(DecisionLogEntry(check_id, action, group_tag))

    def seed_synthetic_history(self) -> None:
        """A fresh deployment has no accumulated volume yet — this seeds a
        small illustrative batch so the audit has something real to run
        against on day one. Clearly synthetic, not disguised as live data."""
        import random
        random.seed(7)
        for _ in range(200):
            group = random.choice(["group_a", "group_b"])
            # deliberately inject a mild synthetic skew for group_b on one check,
            # so the demo has something genuine to detect
            bias_chance = 0.35 if group == "group_b" else 0.15
            action = "escalate" if random.random() < bias_chance else "allow"
            self.record("impact_gate", action, group_tag=group)


sentinel_log = BiasSentinelLog()


def statistical_audit(check_id: str) -> Optional[dict]:
    """Returns None if there isn't enough tagged data yet to test."""
    relevant = [e for e in sentinel_log.entries if e.check_id == check_id and e.group_tag]
    groups = sorted(set(e.group_tag for e in relevant))
    if len(groups) < 2 or len(relevant) < 20:
        return None

    actions = sorted(set(e.action for e in relevant))
    table = [[sum(1 for e in relevant if e.group_tag == g and e.action == a) for a in actions] for g in groups]

    chi2, p, dof, _ = chi2_contingency(table)
    n = len(relevant)
    cramers_v = (chi2 / (n * (min(len(groups), len(actions)) - 1))) ** 0.5

    return {
        "check_id": check_id, "groups": groups, "statistic": round(float(chi2), 2),
        "p_value": round(float(p), 4), "effect_size": round(float(cramers_v), 3),
        "significant": bool(p < 0.05 and cramers_v > 0.1),
    }


async def llm_judge_audit(sample: list[DecisionLogEntry]) -> Optional[dict]:
    provider = resolve_check_provider()
    if not provider or not sample:
        return None
    summary = "\n".join(f"- check={e.check_id}, group_tag={e.group_tag}, action={e.action}" for e in sample[:40])
    try:
        result = await structured_call(
            system_prompt=(
                "You are auditing an AI oversight system's own decision logs for bias — not the "
                "underlying model's bias, the CHECKS' bias. You cannot see the original training "
                "data, only these logged decisions. Look for any pattern where a check's action "
                "(allow/fix/escalate/block) correlates with group_tag in a way that isn't "
                "explained by legitimate risk factors."
            ),
            user_prompt=summary,
            json_schema=JUDGE_SCHEMA, provider=provider,
        )
        return result
    except LLMUnavailable:
        return None


async def run_full_audit(check_id: str = "impact_gate") -> dict:
    stats = statistical_audit(check_id)
    judged = await llm_judge_audit(sentinel_log.entries)
    return {
        "statistical": stats,
        "llm_judge": judged,
        "note": "Audits ControlPlane's own check behavior across tagged groups — "
                "not the underlying model's training data, which is inaccessible via API.",
    }
