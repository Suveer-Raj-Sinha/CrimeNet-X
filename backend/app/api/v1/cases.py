from fastapi import APIRouter, Depends

from app.core.permissions import get_current_user, require_role
from app.schemas.schemas import CaseCreate, CaseResponse
from app.store import db

router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


@router.post("/", response_model=CaseResponse)
def create_case(payload: CaseCreate, user: dict = Depends(require_role("admin", "investigator"))):
    case = db.create_case(payload.title, payload.description, user["username"])
    db.log_audit(user["username"], "create_case", case["case_id"], case["case_id"], "success")
    return case


@router.get("/", response_model=list[CaseResponse])
def list_cases(user: dict = Depends(get_current_user)):
    username = None if user["role"] == "admin" else user["username"]
    return db.list_cases(username)


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, user: dict = Depends(get_current_user)):
    from fastapi import HTTPException
    from app.core.permissions import require_case_access
    require_case_access(case_id, user)
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(404, "Case not found")
        
    # Auto-seed mock data if the in-memory graph is empty so the UI demo queries work
    from app.store.graph_store import graph_store
    if len(graph_store.all_entities(case_id)) == 0:
        from app.sih_core.schema import Entity, EntityType, Relationship, RelationshipType
        from app.processing.translator import save_case_data
        
        mock_entities = [
            Entity(id="ENT-PER-01", name="Rahul Sharma", type=EntityType.PERSON),
            Entity(id="ENT-PER-02", name="Amit Kumar", type=EntityType.PERSON),
            Entity(id="ENT-LOC-01", name="Jaipur Station", type=EntityType.LOCATION),
            Entity(id="ENT-ACC-01", name="HDFC Bank Acct", type=EntityType.ACCOUNT),
            Entity(id="ENT-ACC-02", name="ICICI Bank Acct", type=EntityType.ACCOUNT),
            Entity(id="ENT-PH-01", name="+919876543210", type=EntityType.PHONE),
            Entity(id="ENT-PH-02", name="+919811223344", type=EntityType.PHONE)
        ]
        mock_rels = [
            Relationship(id="REL-01", source_entity_id="ENT-PER-01", target_entity_id="ENT-PER-02", type=RelationshipType.ASSOCIATED_WITH),
            Relationship(id="REL-02", source_entity_id="ENT-PER-02", target_entity_id="ENT-LOC-01", type=RelationshipType.LOCATED_AT),
            Relationship(id="REL-03", source_entity_id="ENT-PER-01", target_entity_id="ENT-PH-01", type=RelationshipType.USES_DEVICE),
            Relationship(id="REL-TX-01", source_entity_id="ENT-ACC-01", target_entity_id="ENT-ACC-02", type=RelationshipType.TRANSFERS_FUNDS),
            Relationship(id="REL-CALL-01", source_entity_id="ENT-PH-01", target_entity_id="ENT-PH-02", type=RelationshipType.CALLS)
        ]
        save_case_data(case_id, mock_entities, mock_rels)
        
    return case
