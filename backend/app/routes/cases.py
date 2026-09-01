"""
Customer Operations, symmetrically: a "case" is a Run tagged
actor_type='customer_support' with a few extra display fields. It uses the
exact same pipeline, the exact same event stream, and the exact same
/intervene endpoint as Employee runs — only the operator persona and the
queue-of-many-cases view are different, not the underlying mechanism.
Multiple cases run concurrently for free, since each is just its own
background task and its own run_id/event-bus channel.
"""

import asyncio
import uuid
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.sql_store import store
from app.orchestrator.pipeline import run_pipeline

router = APIRouter(prefix="/v1/cases", tags=["cases"])

_background_tasks: set[asyncio.Task] = set()


def _spawn(coro) -> None:
    task = asyncio.create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


class CreateCaseRequest(BaseModel):
    customer_label: str          # anonymized display label, e.g. "Customer A" — never a real name
    issue_summary: str
    message: str                 # the actual query the support agent is handling
    model: str = "Claude"
    priority: Literal["low", "medium", "high"] = "low"


class CaseCreatedResponse(BaseModel):
    run_id: str


@router.post("", response_model=CaseCreatedResponse)
async def create_case(payload: CreateCaseRequest) -> CaseCreatedResponse:
    run_id = f"CP-{uuid.uuid4().hex[:5]}"
    await store.create(
        run_id, actor_type="customer_support", task=payload.message, model_label=payload.model,
        customer_label=payload.customer_label, issue_summary=payload.issue_summary, priority=payload.priority,
    )
    _spawn(run_pipeline(run_id, "customer_support", payload.message, payload.model))
    return CaseCreatedResponse(run_id=run_id)


@router.get("")
async def list_cases() -> list[dict]:
    """The operator's queue view — every active/recent case with its
    current pipeline state, ordered by priority then recency."""
    cases = store.list_by_actor("customer_support")
    priority_rank = {"high": 0, "medium": 1, "low": 2}
    cases.sort(key=lambda c: priority_rank.get(c.priority, 3))
    return [
        {
            "run_id": c.run_id, "customer_label": c.customer_label, "issue_summary": c.issue_summary,
            "priority": c.priority, "state": c.state, "final_output": c.final_output,
            "needs_review": c.state == "waiting",
        }
        for c in cases
    ]


@router.get("/{run_id}")
async def get_case(run_id: str) -> dict:
    record = store.get(run_id)
    if not record or record.actor_type != "customer_support":
        raise HTTPException(404, "case not found")
    return {
        "run_id": record.run_id, "customer_label": record.customer_label,
        "issue_summary": record.issue_summary, "priority": record.priority,
        "state": record.state, "final_output": record.final_output,
        "pending_intervention": record.pending_intervention,
    }
