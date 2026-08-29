"""
Mirrors the frontend's own state shape on purpose: run_state and
pending_intervention exist here for exactly the same reason
EmployeeWorkspace.tsx keeps runState/interventionEvent client-side -
this is the server's copy of the same truth, so a page reload or a
second device can recover it.
"""

from typing import Optional

from app.contracts import ControlEvent


class RunRecord:
    def __init__(self, run_id: str, task: str, model: str) -> None:
        self.run_id = run_id
        self.task = task
        self.model = model
        self.state: str = "running"  # running | completed | blocked
        self.pending_intervention: Optional[ControlEvent] = None


class MemoryStore:
    def __init__(self) -> None:
        self.runs: dict[str, RunRecord] = {}

    def create(self, run_id: str, task: str, model: str) -> RunRecord:
        record = RunRecord(run_id, task, model)
        self.runs[run_id] = record
        return record

    def get(self, run_id: str) -> Optional[RunRecord]:
        return self.runs.get(run_id)


store = MemoryStore()
