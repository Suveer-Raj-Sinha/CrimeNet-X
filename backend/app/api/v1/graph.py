from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.permissions import get_current_user, require_case_access
from app.schemas.schemas import GraphResponse
from app.store.graph_store import graph_store

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])


@router.get("/case/{case_id}", response_model=GraphResponse)
def get_case_graph(case_id: str, min_confidence: float = Query(0.0, ge=0.0, le=1.0),
                    user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    return graph_store.case_graph(case_id, min_confidence=min_confidence)


@router.get("/entity/{entity_id}/neighborhood", response_model=GraphResponse)
def get_entity_neighborhood(entity_id: str, hops: int = Query(1, ge=1, le=3),
                             user: dict = Depends(get_current_user)):
    entity = graph_store.get_entity(entity_id)
    if not entity:
        raise HTTPException(404, "Entity not found")
    require_case_access(entity["case_id"], user)
    return graph_store.entity_neighborhood(entity_id, hops=hops)


@router.get("/path")
def find_path(from_id: str, to_id: str, user: dict = Depends(get_current_user)):
    entity = graph_store.get_entity(from_id)
    if entity:
        require_case_access(entity["case_id"], user)
    path = graph_store.find_path(from_id, to_id)
    return {"path": path}


@router.get("/entity/{entity_id}")
def get_entity_profile(entity_id: str, user: dict = Depends(get_current_user)):
    entity = graph_store.get_entity(entity_id)
    if not entity:
        raise HTTPException(404, "Entity not found")
    require_case_access(entity["case_id"], user)
    return entity

@router.get("/case/{case_id}/sih_graph")
def get_sih_graph_data(case_id: str, user: dict = Depends(get_current_user)):
    # This endpoint powers the SIH GraphViewer modularly
    from app.processing.translator import load_all_case_data
    from app.sih_core.graph_engine import KnowledgeGraphEngine
    from app.sih_core.relevance import RelevanceEngine
    
    entities_db, relationships_db = load_all_case_data(case_id)
    graph_engine = KnowledgeGraphEngine()
    relevance_engine = RelevanceEngine()
    
    graph_engine.build_graph(entities_db, relationships_db)
    deg_cent, bet_cent = graph_engine.calculate_centrality()

    entities_with_relevance = []
    for e in entities_db:
        rel_eval = relevance_engine.evaluate_relevance(e, [], relationships_db)
        e_dict = e.model_dump()
        e_dict["relevance"] = rel_eval.model_dump()
        e_dict["degree_centrality"] = round(deg_cent.get(e.id, 0.0), 3)
        e_dict["betweenness_centrality"] = round(bet_cent.get(e.id, 0.0), 3)
        entities_with_relevance.append(e_dict)

    alerts = graph_engine.generate_defensible_alerts(relationships_db)

    return {
        "entities": entities_with_relevance,
        "relationships": [r.model_dump() for r in relationships_db],
        "alerts": alerts
    }

from fastapi import Form

@router.post("/resolution/action")
def resolution_action(
    candidate_id: str = Form(...),
    entity_a_id: str = Form(...),
    entity_b_id: str = Form(...),
    action: str = Form(...),
    user: dict = Depends(get_current_user)
):
    from app.sih_core.audit import AuditLogger
    from app.processing.translator import load_all_case_data, save_case_data
    from app.store.graph_store import graph_store
    
    entities, relationships = load_all_case_data("CASE-2026-001")
    
    if action == 'APPROVED':
        # Find entities
        ent_a = next((e for e in entities if e.id == entity_a_id), None)
        ent_b = next((e for e in entities if e.id == entity_b_id), None)
        
        if ent_a and ent_b:
            # Merge aliases
            if ent_b.name not in ent_a.aliases:
                ent_a.aliases.append(ent_b.name)
            ent_a.aliases.extend(ent_b.aliases)
            
            # Re-point relationships
            for r in relationships:
                if r.source_entity_id == entity_b_id:
                    r.source_entity_id = entity_a_id
                if r.target_entity_id == entity_b_id:
                    r.target_entity_id = entity_a_id
            
            # Remove ent_b from lists
            entities = [e for e in entities if e.id != entity_b_id]
            
            # Delete ent_b from graph_store directly
            try:
                graph_store.g.remove_node(entity_b_id)
            except Exception:
                pass
            
            save_case_data("CASE-2026-001", entities, relationships)
        
    AuditLogger.log_action(user["username"], user["role"], "RESOLUTION_ACTION", f"Resolved {candidate_id}: {action}")
    
    return {"status": action}
