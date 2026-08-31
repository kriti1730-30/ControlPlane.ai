# ControlPlane backend — real LLM calls, synchronous end to end

## Run it
pip install -r requirements.txt
cp .env.example .env    # fill in ANTHROPIC_API_KEY or switch to gemini
export $(cat .env | xargs)
uvicorn app.main:app --reload --port 8000

Runs with zero key set too — every check falls back to a local heuristic
and fails safe (escalates rather than guessing) instead of crashing.

## The one endpoint that matters
POST /v1/runs   {message, model, mode?: "plan"|"build"}
  -> runs all 7 stages synchronously, returns {run_id, events[], final_output, decision}
  No polling. No WebSocket required to get a result.

GET /v1/bias-audit?check_id=impact_gate
  -> the Bias Sentinel: statistical + LLM-judge audit of whether a CHECK
     (not the underlying model) behaves differently across a tagged group

## Switching providers
Set CONTROLPLANE_PROVIDER=gemini and GEMINI_API_KEY instead of
CONTROLPLANE_PROVIDER=anthropic and ANTHROPIC_API_KEY. Nothing else in the
codebase changes — every check calls app/llm/client.py, never a provider
SDK directly.
