import asyncio
import random

from fastapi import APIRouter, HTTPException

from app.contracts import CreateRunRequest, InterventionRequest
from app.db.memory_store import store
from app.orchestrator.pipeline import run_pipeline, resume_after_intervention

router = APIRouter(prefix="/v1/runs", tags=["runs"])

_background_tasks: set[asyncio.Task] = set()


def _spawn(coro) -> None:
    task = asyncio.create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


@router.post("")
async def create_run(payload: CreateRunRequest) -> dict:
    # matches the frontend's own `CP-${5-digit-number}` id generator exactly
    run_id = f"CP-{random.randint(10000, 99999)}"
    store.create(run_id, payload.message, payload.model)
    _spawn(run_pipeline(run_id, payload.message))
    return {"run_id": run_id}


@router.post("/{run_id}/intervene")
async def intervene(run_id: str, payload: InterventionRequest) -> dict:
    record = store.get(run_id)
    if not record:
        raise HTTPException(404, "run not found")
    if record.state != "waiting":
        raise HTTPException(409, "no pending intervention on this run")
    _spawn(resume_after_intervention(run_id, payload.decision))
    return {"status": "accepted"}
