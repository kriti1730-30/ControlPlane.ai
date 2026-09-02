import asyncio
import uuid
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.sql_store import store
from app.db import database
from app.event_bus import bus
from app.orchestrator.pipeline import run_pipeline, resolve_intervention
from app.checks.bias_sentinel import sentinel_log

router = APIRouter(prefix="/v1", tags=["runs"])
sentinel_log.seed_synthetic_history()  # so /v1/bias-audit has real data to show before live volume accumulates

# strong references so background tasks aren't garbage-collected mid-run
_background_tasks: set[asyncio.Task] = set()


def _spawn(coro) -> None:
    task = asyncio.create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


class RunRequest(BaseModel):
    message: str
    model: str = "gemini"  # default to the provider we have a live key for, if any
    mode: Optional[Literal["plan", "build"]] = None
    workflow: Optional[str] = None  # e.g. "production_change" — see orchestrator/pipeline.py


class RunCreatedResponse(BaseModel):
    run_id: str


class InterventionRequest(BaseModel):
    decision: Literal["approve", "deny"]


@router.post("/runs", response_model=RunCreatedResponse)
async def create_run(payload: RunRequest) -> RunCreatedResponse:
    """Returns immediately with run_id. Connect to /ws/runs/{run_id} to
    watch the pipeline execute — this call does NOT wait for it to finish."""
    run_id = f"CP-{uuid.uuid4().hex[:5]}"
    await store.create(run_id, actor_type="employee", task=payload.message, model_label=payload.model)
    _spawn(run_pipeline(run_id, "employee", payload.message, payload.model,
                         mode_hint=payload.mode, workflow=payload.workflow))
    return RunCreatedResponse(run_id=run_id)


@router.get("/runs")
async def list_runs(actor_type: str = "employee") -> list[dict]:
    """Real, persisted history — reads directly from SQLite, not the
    in-memory cache SQLStore uses for fast escalation polling. This is
    what makes History survive a server restart instead of only showing
    runs created since the process last booted."""
    rows = await database.list_runs_by_actor(actor_type)
    return [
        {
            "run_id": row["run_id"],
            "task": row["task"],
            "model_label": row["model_label"],
            "state": row["state"],
            "final_output": row["final_output"],
            "created_at": row["created_at"],  # UTC ISO string — frontend converts to local display time
        }
        for row in rows
    ]


@router.get("/runs/{run_id}")
async def get_run(run_id: str) -> dict:
    record = store.get(run_id)
    if not record:
        raise HTTPException(404, "run not found")
    return {
        "run_id": record.run_id, "state": record.state, "final_output": record.final_output,
        "pending_intervention": record.pending_intervention,
    }


@router.get("/runs/{run_id}/events")
async def get_run_events(run_id: str) -> list:
    """Replay path — used for loading a past run's full trace AND for a
    reconnecting WebSocket catching up on what it missed."""
    return [e.model_dump() for e in bus.get_history(run_id)]


@router.post("/runs/{run_id}/intervene")
async def intervene(run_id: str, payload: InterventionRequest) -> dict:
    record = store.get(run_id)
    if not record:
        raise HTTPException(404, "run not found")
    if record.state != "waiting":
        raise HTTPException(409, "no pending intervention on this run")
    await resolve_intervention(run_id, payload.decision)
    return {"status": "accepted"}


@router.get("/bias-audit")
async def bias_audit(check_id: str = "impact_gate") -> dict:
    """Stage 7's Bias Sentinel — audits whether ControlPlane's OWN checks
    (not the underlying model) show a statistically meaningful disparity
    across a tagged group, using chi-square/Cramer's V plus an LLM judge."""
    from app.checks.bias_sentinel import run_full_audit
    return await run_full_audit(check_id)


@router.get("/recalibration")
async def recalibration() -> dict:
    """Real, DB-backed continuous learning — actual action-rate
    distribution per check, computed from persisted history."""
    from app.checks.recalibration import compute_check_stats
    return await compute_check_stats()