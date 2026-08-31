"""
Same publish-once/deliver-twice principle as before, simplified: run_id is
now the plain string ("CP-24081" style) the frontend already generates,
and events are the frontend's own ControlEvent shape directly - no wrapper.
"""

import asyncio
from collections import defaultdict

from app.contracts import ControlEvent


class EventBus:
    def __init__(self) -> None:
        self._history: dict[str, list[ControlEvent]] = defaultdict(list)
        self._subscribers: dict[str, list[asyncio.Queue]] = defaultdict(list)

    async def publish(self, run_id: str, event: ControlEvent) -> None:
        self._history[run_id].append(event)
        for queue in self._subscribers[run_id]:
            await queue.put(event)

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
