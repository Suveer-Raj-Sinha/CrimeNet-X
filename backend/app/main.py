from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "sih_core"))

from app.api.v1 import alerts, analytics, audit, auth, cases, documents, evidence, graph
from app.core.config import settings
from app.store.db import seed_default_users

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

from app.api.v1 import cases, graph, auth, query, export, documents, analytics, alerts, evidence, audit

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(graph.router)
app.include_router(query.router)
app.include_router(export.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(evidence.router)
app.include_router(audit.router)
app.include_router(documents.router)



@app.on_event("startup")
def startup():
    seed_default_users()
    _seed_demo_graph()


def _seed_demo_graph():
    """Seed the demo case and graph entities on every server start."""
    from app.store import db
    from app.store.graph_store import graph_store
    from app.sih_core.schema import Entity, EntityType, Relationship, RelationshipType
    from app.processing.translator import save_case_data

    CASE_ID = "CASE-2026-001"

    # Ensure the case row exists in the relational store
    if not db.get_case(CASE_ID):
        db.create_case_direct(
            case_id=CASE_ID,
            title="Operation CyberPhantom",
            description="Demo case",
            status="open",
            created_by="admin",
        )

    # Seed the in-memory graph if it's empty
    if len(graph_store.all_entities(CASE_ID)) == 0:
        mock_entities = [
            Entity(id="ENT-PER-01", name="Rahul Sharma",   type=EntityType.PERSON),
            Entity(id="ENT-PER-02", name="Amit Kumar",     type=EntityType.PERSON),
            Entity(id="ENT-LOC-01", name="Jaipur Station", type=EntityType.LOCATION),
            Entity(id="ENT-ACC-01", name="HDFC Bank Acct", type=EntityType.ACCOUNT),
            Entity(id="ENT-ACC-02", name="ICICI Bank Acct",type=EntityType.ACCOUNT),
            Entity(id="ENT-PH-01",  name="+919876543210",  type=EntityType.PHONE),
            Entity(id="ENT-PH-02",  name="+919811223344",  type=EntityType.PHONE),
        ]
        mock_rels = [
            Relationship(id="REL-01",      source_entity_id="ENT-PER-01", target_entity_id="ENT-PER-02", type=RelationshipType.ASSOCIATED_WITH),
            Relationship(id="REL-02",      source_entity_id="ENT-PER-02", target_entity_id="ENT-LOC-01", type=RelationshipType.LOCATED_AT),
            Relationship(id="REL-03",      source_entity_id="ENT-PER-01", target_entity_id="ENT-PH-01",  type=RelationshipType.USES_DEVICE),
            Relationship(id="REL-TX-01",   source_entity_id="ENT-ACC-01", target_entity_id="ENT-ACC-02", type=RelationshipType.TRANSFERS_FUNDS),
            Relationship(id="REL-CALL-01", source_entity_id="ENT-PH-01",  target_entity_id="ENT-PH-02",  type=RelationshipType.CALLS),
        ]
        save_case_data(CASE_ID, mock_entities, mock_rels)


@app.get("/")
def root():
    return {
        "service": settings.APP_NAME,
        "status": "ok",
        "docs": "/docs",
        "graph_backend": settings.GRAPH_BACKEND,
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0"
    }
