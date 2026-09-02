# ControlPlane.ai

ControlPlane is a real-time oversight and control layer for enterprise AI systems. It sits between a user, an enterprise AI application, and the underlying model, observing every request as it moves through a seven-stage governance pipeline — identity and jurisdiction checks, risk profiling, retrieval and access control, output verification, and continuous calibration — before a response is ever delivered. Where a risk is ambiguous or an action is irreversible, ControlPlane pauses and asks a human, rather than silently allowing or silently blocking.

This repository contains our submission for the Accenture Innovation Challenge 2026, Round 2 (Prototype Development), built against Problem Track 1.

Live demo: [control-plane-ai-git-main-kriti1730-30s-projects.vercel.app](https://control-plane-ai-git-main-kriti1730-30s-projects.vercel.app)
Backend API: [controlplane-ai-x4md.onrender.com](https://controlplane-ai-x4md.onrender.com)

> The backend is hosted on Render's free tier, which spins down after a period of inactivity. The first request after idle time may take 30–60 seconds to respond while the instance wakes up.

## Table of contents

- Problem statement
- Solution architecture
- The seven stages
- Two workspaces
- Key design decisions
- Tech stack
- Repository structure
- Local setup
- Environment variables
- API reference
- Known limitations
- Roadmap

## Problem statement

Enterprises rarely run a single AI system. A typical organization has a customer support assistant, an internal knowledge copilot, and a decision-support tool running at once, often on different underlying platforms, each with its own latency tolerance and risk profile. Today, none of these systems is meaningfully monitored until after a response has already reached a user or an action has already been taken. Hallucinations, cost overruns, biased outputs, and unsafe actions are typically caught after the fact, if at all.

ControlPlane addresses this by acting as a policy-aware layer that every request passes through before it reaches its destination, and every response passes through before it reaches a user.

## Solution architecture

At a high level, a request flows as follows:

```
User
  |
  v
ControlPlane Workbench (Employee AI / Customer Operations)
  |
  v
POST /v1/runs
  |
  v
Seven-stage governance pipeline
  |
  +-- deterministic checks (access control, pattern matching, budget tracking)
  +-- LLM-backed checks (risk classification, injection detection, grounding)
  +-- the real model call (Anthropic / Gemini / OpenAI, selected per request)
  |
  v
Human approval (only when a check escalates)
  |
  v
Final response, persisted, streamed live over WebSocket
```

Every check writes a structured decision — allow, fix, escalate, or block — along with a human-readable reason. These decisions, and the full sequence of stages a request passed through, are streamed to the frontend in real time and persisted to a database, forming a complete audit trail for every run.

## The seven stages

1. **Identity, Platform & Jurisdiction** — resolves which tenant and platform a request belongs to, and scans for prompt injection before any other stage reads the input.
2. **Risk Profiling & Plan/Build Routing** — classifies impact and sensitivity, and determines whether a request is exploratory (a plan) or will take real actions (a build). Plan requests still receive a real, generated response — the distinction only affects whether proposed actions are allowed to execute.
3. **Retrieval / Tool Gate** — verifies access control on any retrieved source and scans retrieved content for personally identifiable information, redacting it in place before it reaches the model.
4. **Pre-LLM Assembly Gate** — checks for known extraction-attack patterns, flags requests that depend on live information the model cannot have, and assembles the final context.
5. **Agentic Execution & Controls** — checks whether the generated response is grounded in the retrieved evidence, resamples only when grounding is in question, and evaluates any proposed action against impact and reversibility thresholds. This is the stage where a human approval is requested when necessary.
6. **Output Verification** — verifies factual claims where possible (for example, confirming a referenced package actually exists in a public registry), checks for toxicity, and scans the final output for sensitive information one more time before it is returned.
7. **Continuous Learning & Calibration** — records the outcome of every run for later analysis, and includes a dedicated auditing process that checks whether the system's own checks behave consistently across different types of requests, independent of the outcome the underlying model produces.

Deterministic checks run first wherever a clear answer is possible without a model call; a model is only consulted when a request is genuinely ambiguous. This keeps the pipeline both fast and inexpensive to run at scale.

## Two workspaces

ControlPlane ships with two reference workspaces built on top of the same seven-stage pipeline:

- **Employee AI** — a conversational workspace where an employee interacts with an internal AI assistant. Includes purpose-built workflow entry points (Research, Coding, Data Analysis, Feature Testing, and Production Change) in addition to open-ended chat.
- **Customer Operations** — a support-agent-facing console for handling customer requests under the same governance pipeline, with a case queue for parallel, priority-ordered handling.

The two workspaces are separated by role at login, with an explicit option to move between them from the account menu.

## Key design decisions

A few decisions are worth calling out explicitly, since they were made deliberately rather than by default:

- **Deterministic-first checks.** Wherever a heuristic or pattern match can resolve a check confidently, it does — a model is only called for genuinely ambiguous cases. This was a direct response to free-tier rate limits during development and remains the right design regardless of tier.
- **Provider failures are never disguised as content decisions.** A rate-limited or unavailable model produces a distinct, clearly labeled outcome rather than being folded into a generic block, and the response never fabricates an answer that looks like it came from a model when it did not.
- **Human approval is a real pause, not a UI simulation.** When a check escalates, the backend genuinely suspends that run's execution and polls for a decision; nothing resumes until a human actually responds, and an unresolved escalation times out to deny, never to allow.
- **Certain actions are deterministic by design, not model-inferred.** For a purpose-built workflow such as a production change request, whether the action requires approval is decided by the workflow type itself, not left to whether the model happened to mention the action in its own output.

## Tech stack

**Backend**
- FastAPI (Python), running fully asynchronously
- SQLite for run and event persistence
- Anthropic, Google Gemini, and OpenAI SDKs behind a single provider-agnostic client
- WebSocket for live event streaming

**Frontend**
- React with TypeScript, built on Vite
- Tailwind CSS
- React Router

**Deployment**
- Backend: Render
- Frontend: Vercel

## Repository structure

```
backend/
  app/
    checks/            seven-stage check implementations, one module per stage
    llm/                provider-agnostic model client
    orchestrator/       pipeline execution and human-approval handling
    routes/             API endpoints
    db/                 persistence layer
    main.py
  requirements.txt

frontend/
  src/
    features/
      auth/             login and session handling
      employee/         Employee AI workspace
      customer-operations/
    components/
      layout/           sidebar, page layout
  package.json
```

## Local setup

### Requirements

- Python 3.11 or later
- Node.js 18 or later
- An API key for at least one of: Anthropic, Google Gemini, OpenAI (the system runs without one, falling back to heuristic checks, but will not produce real model responses)

### Backend

```
cd backend
python -m venv venv
venv\Scripts\activate        (Windows)
source venv/bin/activate     (macOS/Linux)

pip install -r requirements.txt

cp .env.example .env
# edit .env and set at least one provider API key

uvicorn app.main:app --reload --port 8000
```

The backend is now available at `http://127.0.0.1:8000`. Visiting `/health` should return a status response.

### Frontend

```
cd frontend
npm install

cp .env.example .env
# set VITE_API_BASE_URL=http://127.0.0.1:8000 for local development

npm run dev
```

The frontend is now available at `http://localhost:5173`. Sign in using either of the demo accounts shown on the login screen.

## Environment variables

**Backend (`backend/.env`)**

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | one of the three | Anthropic API key |
| `GEMINI_API_KEY` | one of the three | Google Gemini API key |
| `OPENAI_API_KEY` | one of the three | OpenAI API key |

**Frontend (`frontend/.env`)**

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | yes | Base URL of the backend API (local or deployed) |

## API reference

| Endpoint | Method | Description |
|---|---|---|
| `/v1/runs` | POST | Start a new governed run |
| `/v1/runs` | GET | List persisted runs for a workspace |
| `/v1/runs/{run_id}` | GET | Get the current state of a run |
| `/v1/runs/{run_id}/events` | GET | Full event trace for a run |
| `/v1/runs/{run_id}/intervene` | POST | Approve or deny a paused run |
| `/v1/cases` | GET / POST | List or create a Customer Operations case |
| `/v1/bias-audit` | GET | Statistical audit of check behavior across tagged groups |
| `/v1/recalibration` | GET | Real, database-backed action-rate statistics per check |
| `/ws/runs/{run_id}` | WebSocket | Live event stream for a run |

## Known limitations

- History and recalibration are backed by SQLite, which is appropriate for this prototype's scale but would need to move to a managed database for real concurrent multi-tenant use.
- The temporal-reference check in Stage 4 flags requests that need live information; it does not itself perform live retrieval.
- Conversation persistence currently operates at the level of individual runs rather than multi-turn conversations threaded together.

## Roadmap

- Persistent, multi-turn conversation threading, with execution traces attached to individual messages within a conversation
- Additional purpose-built workflows beyond Production Change
- A policy configuration surface for adjusting per-workspace thresholds without a deployment