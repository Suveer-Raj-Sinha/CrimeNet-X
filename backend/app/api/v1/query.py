from fastapi import APIRouter, Depends, HTTPException, Form
from typing import Optional
from app.core.permissions import get_current_user
# Note: In a real integration, entities and relationships would be fetched from the db.
# For this MVP port, we'll import the global ones or assume they'll be injected.
# In SIH, they were global lists. We will mock the lists here or load from graph_store.
from app.store.graph_store import graph_store

router = APIRouter(prefix="/api/v1", tags=["query"])

@router.post("/query/execute")
def execute_natural_language_query(
    query: str = Form(...),
    user: dict = Depends(get_current_user)
):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty")

    from app.sih_core.audit import AuditLogger
    from app.sih_core.query_engine import QueryEngine
    from app.processing.translator import load_all_case_data
    
    AuditLogger.log_action(user["username"], user["role"], "EXECUTE_QUERY", f"Query executed: '{query}'")
    
    entities, relationships = load_all_case_data("CASE-2026-001")
    engine = QueryEngine()
    
    return engine.parse_and_execute_query(query, entities, relationships)
