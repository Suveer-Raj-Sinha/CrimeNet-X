# CRIMENET-X

CRIMENET‑X is a compact, demo-ready investigative case management and
knowledge-graph platform. It pairs a FastAPI backend (with an in-memory
NetworkX graph store by default) and a React + Vite frontend so you can run
and explore graph-driven ingestion, entity resolution, alerting, and basic
analytics locally with minimal setup.

This README provides detailed setup and run instructions (Windows and
Unix), an overview of features, recommended configuration, and the project
layout.

---

## Key features

- FastAPI backend with JWT auth and simple RBAC (admin/investigator/analyst/viewer)
- In-memory NetworkX graph store (default for demos); optional Neo4j backend
- SQLite-based lightweight case/user store for quick local runs
- Demo seeding: project seeds demo users and a sample case/graph on startup
- React + Vite frontend (Tailwind UI & Lucide icons) for graph visualization,
  ingestion, query, and alerts
- Modular ingestion and processing pipeline (FIR, CDR adapters; entity
  resolution; analytics; alert rules)

---

## Prerequisites

- Python 3.11+ (or 3.10 depending on your environment)
- Node.js 18+ and npm (for the frontend)
- (Optional) Neo4j and/or PostgreSQL if you plan to enable production backends

---

## Setup and run (recommended — Windows)

1) Backend

Open a terminal and run:

```powershell
cd D:\hackaathon\crimenet-x\backend
python -m venv venv
venv\Scripts\Activate.ps1    # PowerShell
# or: venv\Scripts\activate    # cmd.exe
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
# Run the backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2) Frontend

Open a second terminal and run:

```powershell
cd D:\hackaathon\crimenet-x\frontend
npm ci
npm run dev
```

- Frontend dev server typically opens at http://localhost:5173
- Backend runs at http://localhost:8000 and provides OpenAPI docs at
  http://localhost:8000/docs

Setup and run (Unix / macOS)

```bash
# Backend
cd /path/to/crimenet-x/backend
python3 -m venv venv
source venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd /path/to/crimenet-x/frontend
npm ci
npm run dev
```

---

## Environment configuration

- Copy `backend/.env.example` to `backend/.env` and update values you care
  about (SECRET_KEY, GRAPH_BACKEND, NEO4J_* if using Neo4j).
- The frontend can be pointed at a different backend using a Vite env var:
  create `frontend/.env` with e.g. `VITE_API_URL=http://localhost:8000`.

---

## Demo accounts (seeded automatically)

These demo users are seeded into the backend DB when the server starts (no
manual setup required):

- admin / admin123  — role: admin
- investigator1 / invest123  — role: investigator
- analyst1 / analyst123  — role: analyst
- viewer1 / viewer123  — role: viewer

Use these credentials in the frontend login screen to explore features.

---

## Seeding a demo case (optional)

With the backend running you can run the provided script to seed demo data:

```bash
# from the backend folder (with venv active)
python scripts/seed_demo.py
```

This does the same demo-data load used by the frontend "Load synthetic FIR
+ CDR" convenience button.

---

## Project structure

Top-level layout (important files/folders):

D:/hackaathon/crimenet-x

- backend/
  - app/
    - main.py                # FastAPI application entrypoint
    - core/                  # config, security, settings
    - api/v1/                # routers and API endpoints
    - schemas/               # Pydantic models
    - processing/            # ingestion adapters, translator, analytics, resolution
    - store/                 # persistence: db.py (sqlite in demo) + graph_store.py
  - scripts/
    - seed_demo.py           # convenience script to upload synthetic FIR+CDR
  - requirements.txt         # Python runtime dependencies
  - .env.example

- frontend/
  - index.html
  - src/
    - main.jsx
    - App.jsx
    - components/            # React components (GraphViewer, EntityResolver, Navbar, etc.)
    - index.css              # Tailwind / styles
  - package.json
  - package-lock.json
  - vite.config.js

- .gitignore
- README.md

---

## Switching to production services

The demo uses zero external services by default. When moving to production
consider the following:

- Graph backend: set `GRAPH_BACKEND=neo4j` and provide `NEO4J_URI`,
  `NEO4J_USER`, `NEO4J_PASSWORD` in `backend/.env`; install the `neo4j` driver.
- Replace the simple sqlite wrapper in `app/store/db.py` with SQLAlchemy +
  PostgreSQL (or another RDBMS) and enable migrations (alembic).
- Harden security: rotate SECRET_KEY, enable HTTPS, restrict CORS origins,
  enforce stronger password hashing (bcrypt/argon2), add rate limiting.
- Move background work (if any) to Celery/RQ backed by Redis and run in
  separate workers.

---

## Tests and linters (optional)

No full test suite is included in the MVP scaffold. Suggested developer
tools to add if you want to harden the project before sharing:

- Backend: pytest, httpx (for API tests), mypy/ruff
- Frontend: vitest, @testing-library/react, eslint, prettier

---

## License & contributing

Add a LICENSE file (MIT is a common permissive choice). Contributions are
welcome: please open issues for bugs/feature requests and submit PRs.

---

If you'd like, I can also:
- Commit these README changes for you and initialize a git repository,
- Add a LICENSE file (e.g. MIT), or
- Add a CONTRIBUTING.md and CODE_OF_CONDUCT.md template.

Reminder: I'm an AI assistant using Copilot CLI runtime in VS Code.
