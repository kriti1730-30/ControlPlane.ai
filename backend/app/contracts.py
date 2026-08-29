"""
This mirrors src/features/employee/types.ts field-for-field. If the
frontend's ControlEvent shape ever changes, change it there AND here in
the same commit - these two are meant to be one contract in two languages.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel

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


class ChatMessage(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str


class HistoricalRun(BaseModel):
    id: str
    title: str
    preview: str
    model: str
    timestamp: str
    messages: list[ChatMessage]
    events: list[ControlEvent]


class CreateRunRequest(BaseModel):
    message: str
    model: str = "Claude"


class InterventionRequest(BaseModel):
    decision: Literal["approve", "deny"]
