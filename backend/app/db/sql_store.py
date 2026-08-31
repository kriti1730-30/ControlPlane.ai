from dataclasses import dataclass
from typing import Literal, Optional

from app.contracts import ControlEvent
from app.db import database

ActorType = Literal["employee", "customer_support"]
RunState = Literal["running", "waiting", "completed", "blocked"]


@dataclass
class RunRecord:
    run_id: str
    actor_type: ActorType
    task: str
    model_label: str
    state: RunState = "running"
    pending_intervention: Optional[ControlEvent] = None
    pending_intervention_decision: Optional[str] = None
    final_output: str = ""
    customer_label: Optional[str] = None
    issue_summary: Optional[str] = None
    priority: str = "low"


class SQLStore:
    """In-memory cache for fast live polling (escalation wait loop), backed
    by real SQLite persistence for history and recalibration."""

    def __init__(self) -> None:
        self._cache: dict[str, RunRecord] = {}

    async def create(self, run_id: str, actor_type: ActorType, task: str, model_label: str,
                      **case_fields) -> RunRecord:
        record = RunRecord(run_id=run_id, actor_type=actor_type, task=task, model_label=model_label, **case_fields)
        self._cache[run_id] = record
        await database.insert_run(
            run_id, actor_type, task, model_label,
            case_fields.get("customer_label"), case_fields.get("issue_summary"),
            case_fields.get("priority", "low"),
        )
        return record

    def get(self, run_id: str) -> Optional[RunRecord]:
        return self._cache.get(run_id)

    def list_by_actor(self, actor_type: ActorType) -> list[RunRecord]:
        return [r for r in self._cache.values() if r.actor_type == actor_type]

    async def update_state(self, run_id: str, state: Optional[str] = None, final_output: Optional[str] = None) -> None:
        record = self._cache.get(run_id)
        if not record:
            return
        if state is not None:
            record.state = state
        if final_output is not None:
            record.final_output = final_output
        await database.update_run(run_id, state=state, final_output=final_output)


store = SQLStore()
