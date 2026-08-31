"""
Publish-once, deliver-twice, now for real: every published event is
persisted to SQLite AND pushed to live WebSocket subscribers, from one
call. This is what makes GET /v1/runs/{id}/events and the Bias Sentinel's
recalibration both read genuine history instead of an in-memory-only list
that vanishes on restart.
"""

import asyncio
from collections import defaultdict

from app.contracts import ControlEvent
from app.db import database


class EventBus:
    def __init__(self) -> None:
        self._history: dict[str, list[ControlEvent]] = defaultdict(list)
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)

    async def publish(self, run_id: str, event: ControlEvent, check_id: str | None = None) -> None:
        self._history[run_id].append(event)
        for queue in self._subscribers[run_id]:
            await queue.put(event)
        await database.insert_event(
            event_id=event.id, run_id=run_id, stage=event.stage, check_id=check_id,
            title=event.title, description=event.description, status=event.status,
            decision=event.decision, metric=event.metric, action=event.action,
        )

    def get_history(self, run_id: str) -> list[ControlEvent]:
        return self._history[run_id]

    def subscribe(self, run_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[run_id].append(queue)
        return queue

    def unsubscribe(self, run_id: str, queue: asyncio.Queue) -> None:
        if queue in self._subscribers[run_id]:
            self._subscribers[run_id].remove(queue)


bus = EventBus()
