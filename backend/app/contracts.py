"""
Two layers of shape here, deliberately:
  - Envelope + CheckResult: the rich internal state every check reads/writes
  - ControlEvent: the simplified shape the real frontend's types.ts expects

to_control_event() is the one place that translates rich internal detail
down into what the UI actually renders. Checks never construct a
ControlEvent themselves — they return a CheckResult, and the orchestrator
does the translation, so the internal richness (scores, reasoning, model
used) never has to be tracked in two places.
"""

from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Frontend-facing shape — mirrors src/features/employee/types.ts exactly
# ---------------------------------------------------------------------------

StageNumber = Literal[1, 2, 3, 4, 5, 6, 7]
StageStatus = Literal["pending", "running", "passed", "fixed", "ask", "blocked"]
ControlDecision = Literal["ALLOW", "FIX", "ASK", "BLOCK", "ESCALATE"]


class ControlEvent(BaseModel):
    id: str
    stage: StageNumber
    title: str
    description: str
    status: StageStatus
    decision: Optional[ControlDecision] = None
    metric: Optional[str] = None
    action: Optional[str] = None


class CreateRunRequest(BaseModel):
    message: str
    model: str = "Claude"


class InterventionRequest(BaseModel):
    decision: Literal["approve", "deny"]


# ---------------------------------------------------------------------------
# Internal shapes — never sent to the frontend directly
# ---------------------------------------------------------------------------

Mechanism = Literal["function", "model", "llm"]
Action = Literal["allow", "fix", "escalate", "block"]


class CheckResult(BaseModel):
    check_id: str
    stage: StageNumber
    mechanism: Mechanism
    action: Action
    title: str
    description: str
    metric: Optional[str] = None
    fix_action: Optional[str] = None
    detail: dict[str, Any] = Field(default_factory=dict)   # rich internal data, not shown raw to the user
    live: bool = True    # False if a heuristic fallback fired instead of a real LLM call


_STATUS_BY_ACTION: dict[Action, StageStatus] = {
    "allow": "passed", "fix": "fixed", "escalate": "ask", "block": "blocked",
}
_DECISION_BY_ACTION: dict[Action, ControlDecision] = {
    "allow": "ALLOW", "fix": "FIX", "escalate": "ASK", "block": "BLOCK",
}


def to_control_event(result: CheckResult, event_id: str) -> ControlEvent:
    return ControlEvent(
        id=event_id,
        stage=result.stage,
        title=result.title,
        description=result.description,
        status=_STATUS_BY_ACTION[result.action],
        decision=_DECISION_BY_ACTION[result.action],
        metric=result.metric,
        action=result.fix_action,
    )


class RiskTags(BaseModel):
    impact_tier: Literal["low", "medium", "high"] = "low"
    score: int = 0
    mode: Literal["plan", "build"] = "build"
    sensitivity: Literal["standard", "high"] = "standard"
    reasons: list[str] = Field(default_factory=list)


class Envelope(BaseModel):
    run_id: str
    parent_task_id: Optional[str] = None
    tenant_id: str = "demo-tenant"
    jurisdiction: str = "US"

    task: str
    model_label: str = "Claude"

    retrieved_context: list[dict[str, Any]] = Field(default_factory=list)
    risk: RiskTags = Field(default_factory=RiskTags)

    draft_output: Optional[str] = None
    proposed_actions: list[dict[str, Any]] = Field(default_factory=list)

    check_results: list[CheckResult] = Field(default_factory=list)
    final_decision: Optional[Action] = None
