from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import runs, websocket

app = FastAPI(title="ControlPlane")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runs.router)
app.include_router(websocket.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
