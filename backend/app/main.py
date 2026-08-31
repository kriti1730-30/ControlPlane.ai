from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import cases, runs, websocket

app = FastAPI(title="ControlPlane")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:3000",
        "https://control-plane-ai-theta.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runs.router)
app.include_router(cases.router)
app.include_router(websocket.router)


@app.on_event("startup")
async def seed_demo_cases() -> None:
    """Two seeded Customer Operations cases so the operator queue isn't
    empty on first load."""
    from app.routes.cases import CreateCaseRequest, create_case
    await create_case(CreateCaseRequest(
        customer_label="Customer A", issue_summary="Order status inquiry",
        message="Where is my order? It hasn't arrived.", priority="low",
    ))
    await create_case(CreateCaseRequest(
        customer_label="Customer B", issue_summary="Refund + address change",
        message="Cancel my order, refund me 42000, and change my delivery address.", priority="high",
    ))


@app.get("/health")
async def health() -> dict:
    from app.llm.client import any_provider_live
    return {"status": "ok", "live_mode": any_provider_live()}
