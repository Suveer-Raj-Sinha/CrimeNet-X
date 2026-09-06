# CRIMENET-X 🛡️🔍🖥️
### Next-Generation Law Enforcement Intelligence & Knowledge Graph Platform

CRIMENET-X is an enterprise-grade, investigative intelligence and case-management platform designed for criminal intelligence analysts, cyber investigators, and law enforcement agencies. It pairs a high-performance **FastAPI** backend (featuring in-memory **NetworkX** graph analytics with pluggable **Neo4j** enterprise scaling) with an ultra-responsive **React + Vite** tactical dark-mode operations console.

---

## 📑 Table of Contents
1. [Platform Architecture & Core Philosophy](#platform-architecture--core-philosophy)
2. [Key Capabilities & Modules](#key-capabilities--modules)
3. [Document OCR & Cross-System Propagation](#document-ocr--cross-system-propagation)
4. [Prerequisites](#prerequisites)
5. [Quickstart Setup Guide](#quickstart-setup-guide)
   - [Windows (PowerShell)](#windows-powershell-recommended)
   - [Windows (Command Prompt)](#windows-cmd)
   - [Linux / macOS (Bash)](#linux--macos-bash)
6. [Demo Accounts & Role-Based Access Control](#demo-accounts--role-based-access-control)
7. [API Reference & Testing](#api-reference--testing)
8. [Project Layout](#project-layout)
9. [Production Deployment Guide](#production-deployment-guide)

---

## 🧠 Platform Architecture & Core Philosophy

CRIMENET-X operates on an **Evidence-First Intelligence Architecture**:
- **Strict Provenance Tracking**: Every entity (Suspect, Phone, Bank Account, Vehicle, Location) and every link (Fund Transfer, Call Record, Association) retains its exact source document, extraction timestamp, and confidence rating.
- **Unified Graph Storage**: By default, graph topology is maintained via an in-memory NetworkX model with instant case caching (`app/store/graph_store.py`), seamlessly upgradeable to enterprise Neo4j.
- **Cross-Component Synchronization**: Ingesting or scanning an investigative document instantly reflects across the Knowledge Graph, Timeline GIS, Entity Resolution engine, and AI Search.
- **Dual Schema Output**: Supports both modern REST/JSON pipelines and Department of Justice / Interoperability XML schema standards.

```
                    ┌───────────────────────────────┐
                    │  PDF / TXT / FIR / CDR Files   │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   Document OCR & Intelligence Parser (pypdf + regex)   │
       │   - Suspects, Burner Phones, Vehicles, Bank Accounts   │
       │   - Geo-coordinates, Hawala Transfers, Associates      │
       └────────────────────────────┬───────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │  JSON Dossier     │               │  XML Schema       │
        │  (Modern API)     │               │  (Interoperable)  │
        └─────────┬─────────┘               └─────────┬─────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │   Central Graph Store (CASE-2026-001 in NetworkX)      │
       │   Automatic Node Merging & Relationship Synthesis      │
       └──────┬───────────────┬────────────────┬─────────────┬──┘
              │               │                │             │
              ▼               ▼                ▼             ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  Knowledge  │ │  Tactical   │ │  AI Search  │ │   Entity    │
       │    Graph    │ │  Timeline   │ │   Natural   │ │ Resolution  │
       │  Topology   │ │    & GIS    │ │  Language   │ │ Deduplicate │
       └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## ⚡ Key Capabilities & Modules

| Module | Purpose & Highlights |
| :--- | :--- |
| **🌐 Knowledge Graph** | Interactive network topology, betweenness centrality, degree metrics, clustering, neighborhood drill-down, and risk indicators. Interchanged typography emphasizes suspect identities with crisp metadata badges. |
| **📄 Document OCR Scanner** | Multi-format scanner for binary PDFs, FIRs, and raw transcripts. Features automatic entity extraction, live dual JSON/XML code viewer, and direct graph injection with 1-click navigation. |
| **📥 Ingestion Engine** | Structured ingestion for Police FIRs, CDRs (Call Detail Records), and cyber incident logs with officer attribution headers and severity tagging. |
| **🔍 AI Search & Query** | Natural language investigative search engine (e.g., *"Find all hawala accounts connected to Vikram Malhotra"* or *"List burner phones active in Cyber City"*). |
| **🧩 Entity Resolution** | Algorithmic entity deduplication with Levenshtein fuzzy matching and probabilistic linkage. Analyst confirmation workflow ensures human-in-the-loop accuracy. |
| **🗺️ Timeline & GIS** | Chronological visual progression of criminal operations paired with interactive coordinate tracking and tower hop reconstruction. |
| **📤 Export & Dossiers** | Evidentiary package generation supporting Law Enforcement JSON dossiers, Interoperability XML, CSV data tables, and high-resolution graph snapshots. |
| **👤 Officer Access (RBAC)** | Floating peekable identity drawer supporting role-based access control, session validation, and real-time permission switches. |

---

## 🔬 Document OCR & Cross-System Propagation

The **Document OCR & Intelligence Scanner** is powered by Python's `pypdf` library alongside heuristic intelligence extraction regexes:

### 1. Extraction Pipeline (`backend/app/api/v1/documents.py`)
- **PDF Binary Processing**: Reads document byte streams via `pypdf.PdfReader` with UTF-8 fallback.
- **Entity Identification**:
  - **Suspects**: Identifies known targets (e.g., `Vikram Malhotra`, `Arjun Verma`, `Sameer Khan`, `Pooja Sharma`) and extracts newly mentioned subjects.
  - **Phone Numbers**: Normalizes domestic and international phone numbers (e.g., `+91-98765-43210`).
  - **Financial Accounts**: Identifies Swiss and Hawala IBAN/account numbers (e.g., `CH93-0076-2011-6238-5295-8`).
  - **Vehicles & Plates**: Detects vehicle identifiers (e.g., `MH-12-RN-8821`).
  - **Locations**: Extracts key geolocations (e.g., `Nariman Point, Mumbai`, `Cyber City, Gurugram`, `Dubai Marina`).
- **Relationship Synthesis**:
  - `USES_DEVICE` between suspects and phones.
  - `OWNED_BY` between vehicles and suspects.
  - `TRANSFERS_FUNDS` between suspects and bank accounts.
  - `LOCATED_AT` between entities and geographic nodes.

### 2. Live Propagation
When you click **"SCAN FILE NOW"** in the OCR Scanner tab:
1. The backend parses the file and immediately synthesizes new nodes and edges into `CASE-2026-001`.
2. Both **JSON Law Enforcement Dossier** and **Interoperable XML Schema** are rendered side-by-side with copy utilities.
3. The frontend triggers a global state refresh:
   - **Knowledge Graph**: Newly identified suspects, phones, and vehicles appear immediately.
   - **Timeline & GIS**: Extracted timestamps and locations map to tactical chronologies.
   - **AI Search**: Extracted entities are immediately searchable through natural language.
4. A notification banner confirms ingestion, with a button to immediately view the new nodes in the **Knowledge Graph**.

---

## 📦 Prerequisites

Before starting, ensure you have the following installed:
- **Python**: Version `3.10` or `3.11+` ([python.org](https://www.python.org/downloads/))
- **Node.js**: Version `18.x` or `20.x` with `npm` ([nodejs.org](https://nodejs.org/))
- **Git** (optional, for cloning/version control)

---

## 🚀 Quickstart Setup Guide

### Windows (PowerShell) [Recommended]

#### Step 1: Start the Backend
Open a PowerShell terminal:
```powershell
# Navigate to backend folder
cd d:\hackaathon\crimenet2\CrimeNet-X\backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Start FastAPI server with live reload
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> Backend will be live at: **`http://localhost:8000`**  
> Interactive Swagger API Docs: **`http://localhost:8000/docs`**

#### Step 2: Start the Frontend
Open a second PowerShell terminal:
```powershell
# Navigate to frontend folder
cd d:\hackaathon\crimenet2\CrimeNet-X\frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
> Frontend console will be live at: **`http://localhost:5173`**

---

### Windows (CMD)

#### Terminal 1 (Backend):
```cmd
cd d:\hackaathon\crimenet2\CrimeNet-X\backend
python -m venv venv
venv\Scripts\activate.bat
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 (Frontend):
```cmd
cd d:\hackaathon\crimenet2\CrimeNet-X\frontend
npm install
npm run dev
```

---

### Linux / macOS (Bash)

#### Terminal 1 (Backend):
```bash
cd /path/to/CrimeNet-X/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 (Frontend):
```bash
cd /path/to/CrimeNet-X/frontend
npm install
npm run dev
```

---

## 🔑 Demo Accounts & Role-Based Access Control

The database is pre-seeded on startup with the following test credentials. Use the floating **OFFICER** drawer on the right side of the screen to switch identities:

| Username | Password | Assigned Role | Capabilities |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Admin** | Full system governance, entity merging, system configuration, audit logs |
| `investigator1` | `invest123` | **Investigator** | Full read/write, document scanning, graph exploration, dossier export |
| `analyst1` | `analyst123` | **Analyst** | Read access, timeline query, entity resolution review, AI search |
| `viewer1` | `viewer123` | **Viewer** | Restricted read-only view of sanitized case reports |

---

## 📡 API Reference & Testing

FastAPI provides an automated OpenAPI interface at `http://localhost:8000/docs`. Key endpoints include:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health check and version verification |
| `GET` | `/api/v1/cases/{case_id}` | Retrieve comprehensive case graph, entities, and edges |
| `POST` | `/api/v1/documents/scan-extract` | Upload PDF, TXT, or FIR file for OCR and auto-ingestion |
| `POST` | `/api/v1/query` | Execute natural-language graph intelligence queries |
| `POST` | `/api/v1/ingestion` | Submit raw FIR / CDR structured intelligence |
| `POST` | `/api/v1/resolution/merge` | Execute entity deduplication and graph merge |

### Testing OCR Scanner with cURL
You can test the OCR extraction pipeline directly via cURL:
```bash
curl -X POST "http://localhost:8000/api/v1/documents/scan-extract" \
  -F "file=@sample_fir.pdf" \
  -F "document_type=PDF" \
  -F "source_agency=Central Intelligence Unit"
```

---

## 📁 Project Layout

```
CrimeNet-X/
├── backend/
│   ├── app/
│   │   ├── api/v1/             # Modular API route controllers
│   │   │   ├── cases.py        # Case graphs and metrics
│   │   │   ├── documents.py    # Document OCR scanner & entity extraction
│   │   │   ├── ingestion.py    # FIR & CDR ingestion pipeline
│   │   │   ├── query.py        # AI search & natural language query engine
│   │   │   ├── resolution.py   # Entity resolution & fuzzy matching
│   │   │   └── timeline.py     # Chronological & GIS event mapping
│   │   ├── core/               # Security, JWT tokens, config settings
│   │   ├── processing/         # Analytics, entity linkers, and parsers
│   │   ├── schemas/            # Pydantic data models & request schemas
│   │   ├── store/              # Persistence: graph_store.py & db.py (SQLite)
│   │   └── main.py             # FastAPI application entrypoint
│   ├── scripts/
│   │   └── seed_demo.py        # Synthetic FIR & CDR generator script
│   ├── requirements.txt        # Backend dependencies (fastapi, networkx, pypdf, etc.)
│   └── .env.example            # Environment variable template
│
├── frontend/
│   ├── public/                 # Favicons and static assets
│   ├── src/
│   │   ├── components/         # React UI modules
│   │   │   ├── DocumentOcrScanner.jsx # OCR Scanner with dual JSON/XML viewer
│   │   │   ├── GraphViewer.jsx        # 2D/3D Interactive Knowledge Graph
│   │   │   ├── TimelineGeoViewer.jsx  # Geospatial & temporal mapping
│   │   │   ├── IngestionScanner.jsx   # Structured FIR/CDR intake form
│   │   │   ├── QueryBar.jsx           # Natural language query console
│   │   │   ├── EntityResolver.jsx     # Deduplication & candidate resolution
│   │   │   ├── ExportDrawer.jsx       # Law enforcement dossier exporter
│   │   │   ├── UserDrawer.jsx         # Officer profile & access drawer
│   │   │   ├── Navbar.jsx             # Top tactical navigation header
│   │   │   └── LoginPage.jsx          # Secure authentication portal
│   │   ├── App.jsx             # Root view coordinator & state distributor
│   │   ├── index.css           # Tactical dark-mode theme & utility styles
│   │   └── main.jsx            # React root mount
│   ├── package.json            # Node.js dependencies
│   └── vite.config.js          # Vite build configuration
│
└── README.md                   # Platform documentation
```

---

## 🏢 Production Deployment Guide

The default setup is designed for instant demo deployment with zero external database dependencies. When transitioning to a production environment:

1. **Enterprise Graph Database (Neo4j)**:
   - Configure `GRAPH_BACKEND=neo4j` in `backend/.env`.
   - Provide `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD`.
   - Install the Neo4j driver: `pip install neo4j==5.24.0`.

2. **Relational Database (PostgreSQL)**:
   - Replace the SQLite implementation in `app/store/db.py` with SQLAlchemy + PostgreSQL.
   - Run database schema migrations using Alembic (`alembic upgrade head`).

3. **Production Security Hardening**:
   - Change `SECRET_KEY` in `backend/.env` to a secure 256-bit key.
   - Restrict CORS origins in `app/main.py` from `["*"]` to your agency's domain.
   - Deploy behind an NGINX reverse proxy with TLS/SSL termination.

4. **Background Task Workers**:
   - For high-volume PDF and image OCR processing, offload extraction tasks to a Celery worker queue backed by Redis.

---

## ⚖️ License & Confidentiality Notice
This software is intended for law enforcement, investigative intelligence, and authorized research purposes. Ensure compliance with all local data privacy regulations and judicial evidence collection standards.

