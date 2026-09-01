from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.event_bus import bus

router = APIRouter()


@router.websocket("/ws/runs/{run_id}")
async def run_socket(websocket: WebSocket, run_id: str) -> None:
    await websocket.accept()

    # replay first — covers both "connected after the run already started"
    # and "reconnected after a drop"
    for event in bus.get_history(run_id):
        await websocket.send_json(event.model_dump())

    queue = bus.subscribe(run_id)
    try:
        while True:
            event = await queue.get()
            await websocket.send_json(event.model_dump())
    except WebSocketDisconnect:
        pass
    finally:
        bus.unsubscribe(run_id, queue)
