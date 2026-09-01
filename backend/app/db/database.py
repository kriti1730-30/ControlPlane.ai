"""
Real persistent storage — SQLite, chosen deliberately over Postgres for
this build: zero external setup (no Docker, no hosted DB), a genuine SQL
database, and enough for a two-week prototype's actual data volume. The
schema is what makes Stage 7 real rather than a stub: every event from
every run is persisted here, and recalibration.py reads directly from it.
"""

import json
import os
from datetime import datetime, timezone

import aiosqlite

DB_PATH = os.environ.get("CONTROLPLANE_DB_PATH", "controlplane.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    run_id TEXT PRIMARY KEY,
    actor_type TEXT NOT NULL,
    task TEXT NOT NULL,
    model_label TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'running',
    final_output TEXT DEFAULT '',
    customer_label TEXT,
    issue_summary TEXT,
    priority TEXT DEFAULT 'low',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    run_id TEXT NOT NULL,
    stage INTEGER NOT NULL,
    check_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    decision TEXT,
    metric TEXT,
    action TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

CREATE INDEX IF NOT EXISTS idx_events_run ON events(run_id);
CREATE INDEX IF NOT EXISTS idx_events_stage ON events(stage);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE TABLE IF NOT EXISTS bias_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    check_id TEXT NOT NULL,
    action TEXT NOT NULL,
    group_tag TEXT,
    created_at TEXT NOT NULL
);
"""

_connection: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    global _connection
    if _connection is None:
        _connection = await aiosqlite.connect(DB_PATH)
        _connection.row_factory = aiosqlite.Row
        await _connection.executescript(SCHEMA)
        await _connection.commit()
    return _connection


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


async def insert_run(run_id: str, actor_type: str, task: str, model_label: str,
                      customer_label: str | None, issue_summary: str | None, priority: str) -> None:
    db = await get_db()
    await db.execute(
        "INSERT INTO runs (run_id, actor_type, task, model_label, customer_label, issue_summary, priority, created_at) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (run_id, actor_type, task, model_label, customer_label, issue_summary, priority, _now()),
    )
    await db.commit()


async def update_run(run_id: str, state: str | None = None, final_output: str | None = None) -> None:
    db = await get_db()
    if state is not None:
        await db.execute("UPDATE runs SET state = ? WHERE run_id = ?", (state, run_id))
    if final_output is not None:
        await db.execute("UPDATE runs SET final_output = ? WHERE run_id = ?", (final_output, run_id))
    await db.commit()


async def get_run_row(run_id: str) -> aiosqlite.Row | None:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,))
    return await cursor.fetchone()


async def list_runs_by_actor(actor_type: str) -> list[aiosqlite.Row]:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM runs WHERE actor_type = ? ORDER BY created_at DESC", (actor_type,)
    )
    return await cursor.fetchall()


async def insert_event(event_id: str, run_id: str, stage: int, check_id: str | None, title: str,
                        description: str, status: str, decision: str | None, metric: str | None,
                        action: str | None) -> None:
    db = await get_db()
    await db.execute(
        "INSERT INTO events (event_id, run_id, stage, check_id, title, description, status, decision, "
        "metric, action, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (event_id, run_id, stage, check_id, title, description, status, decision, metric, action, _now()),
    )
    await db.commit()


async def get_events_for_run(run_id: str) -> list[aiosqlite.Row]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM events WHERE run_id = ? ORDER BY id ASC", (run_id,))
    return await cursor.fetchall()


async def get_all_events(check_id: str | None = None, limit: int = 500) -> list[aiosqlite.Row]:
    db = await get_db()
    if check_id:
        cursor = await db.execute(
            "SELECT * FROM events WHERE check_id = ? ORDER BY id DESC LIMIT ?", (check_id, limit))
    else:
        cursor = await db.execute("SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,))
    return await cursor.fetchall()


async def insert_bias_log(check_id: str, action: str, group_tag: str | None) -> None:
    db = await get_db()
    await db.execute(
        "INSERT INTO bias_log (check_id, action, group_tag, created_at) VALUES (?, ?, ?, ?)",
        (check_id, action, group_tag, _now()),
    )
    await db.commit()


async def get_bias_log(check_id: str) -> list[aiosqlite.Row]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM bias_log WHERE check_id = ?", (check_id,))
    return await cursor.fetchall()
