# STAYQEN — Shared Project Memory & Conflict Detection Layer

> **Hackathon MVP**: Connecting multi-AI coding assistants (ChatGPT, Gemini, Antigravity, Claude, Cursor) into a shared, structured FalkorDB memory graph that automatically catches conflicting architectural decisions and breaking API contracts before code is integrated.

---

## 1. Product Overview

In modern engineering teams, multiple engineers interact with different AI coding tools. Without a centralized, persistent coordination layer, these AI tools make incompatible architectural assumptions in silos:
- One tool refactors `/api/auth/login` to return `token`.
- Another frontend agent assumes the OAuth2 standard `access_token`.
- Silent regressions occur that only surface during staging or production outages.

**STAYQEN** acts as a shared memory and coordination layer:
1. **Captures** structured handoffs from any AI tool (decisions, contracts, modules, blockers).
2. **Stores** project knowledge in **FalkorDB** as an interconnected Cypher graph.
3. **Detects** conflicts deterministically and semantically using the **Conflict Detection Agent**.
4. **Traces** conflicts back to exact, side-by-side evidence with affected modules and recommendations.
5. **Visualizes** project relationships and animated conflict edges in an interactive **React Flow** canvas.

---

## 2. Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, `@xyflow/react` (React Flow), `lucide-react`.
- **Backend**: Python 3.14+, FastAPI, Pydantic V2, Uvicorn.
- **Graph Database**: FalkorDB (Cypher graph engine running locally on port 6380 via Docker).
- **AI Intelligence**: Google Gemini API integration with automatic fallback to a deterministic semantic rule engine.

---

## 3. Architecture & Graph Schema

```mermaid
graph TD
    Project((Project: stayqen-core))
    TeamMember((TeamMember: Alex / Devin))
    Handoff((Handoff: Work Session))
    Decision((Decision: RFC Spec))
    APIContract((APIContract: /api/auth/login))
    Module((Module: auth_service))

    TeamMember -->|SUBMITTED| Handoff
    Project -->|CONTAINS| Handoff
    Handoff -->|RECORDED| Decision
    Handoff -->|RECORDED| APIContract
    Handoff -->|AFFECTS| Module
    APIContract -->|AFFECTS| Module
    Decision -->|AFFECTS| Module
    APIContract -.->|CONTRADICTS (animated crimson)| APIContract
```

---

## 4. Quickstart & Local Setup

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+
- Docker (for FalkorDB)

### Step 1: Start FalkorDB
```bash
# Using Docker directly:
docker run -d --name stayqen-falkordb -p 6380:6379 falkordb/falkordb:latest

# Or using docker-compose:
docker compose up -d
```

### Step 2: Start the Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check*: Verify at `http://localhost:8000/api/health` (`"falkordb_connected": true`).

### Step 3: Start the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Verified Deterministic Test Case

STAYQEN comes with automated pytest tests verifying 5 mandatory specifications:

1. **Genuine Contract Conflict**:
   - *Baseline Contract*: `POST /api/auth/login` returning `{ "access_token": "string" }`.
   - *Conflicting Handoff*: `POST /api/auth/login` returning `{ "token": "string" }`.
   - *Output*: High-severity conflict flagged, evidence comparing both response schemas, affected modules (`auth_service`, `frontend_web`), and actionable reconciliation recommendation.
2. **Consistent Handoff**: Independent endpoint addition (`GET /api/users/me`) records with 0 conflicts.
3. **Missing/Ambiguous Evidence**: Flags unconfirmed drift with explicit uncertainty score (< 0.70 confidence).
4. **Graph Persistence & Retrieval**: Verifies Cypher graph schema nodes and edges for React Flow.
5. **API Validation**: Verifies schema validation and rejection of incomplete payloads.

### Running the Tests:
```bash
cd backend
source venv/bin/activate
pytest -v
```

---

## 6. Hackathon Live Demo Workflow

1. **Open Dashboard** at `http://localhost:3000`:
   - Inspect the official **STAYQEN** titanium logo and clean dark infrastructure design system.
   - Note the **FalkorDB Memory: ACTIVE** indicator in the sidebar.
2. **Explore Knowledge Graph** (`/graph`):
   - See the interconnected nodes (`Project`, `TeamMember`, `Handoff`, `APIContract`, `Module`).
   - Click any node to open the **Node Inspector Drawer** to view its raw Cypher graph properties.
3. **Trigger Test Conflict**:
   - In the sidebar, click **"Trigger Test Conflict"**.
   - Watch the dashboard immediately highlight the breaking change.
   - Jump to `/graph` to see the animated crimson `CONTRADICTS` edge connecting the new handoff to the original API contract.
4. **Review Conflict Center** (`/conflicts`):
   - Inspect side-by-side evidence: *Established Project Knowledge* vs *Conflicting Incoming Handoff*.
   - Click **"Accept & Migrate"** or **"Keep Existing"** to record the resolution in the graph.
5. **Submit Custom Handoff** (`/handoffs`):
   - Test submitting new AI sessions or use the one-click template buttons.
