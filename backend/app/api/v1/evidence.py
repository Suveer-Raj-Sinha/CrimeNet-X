from fastapi import APIRouter, Depends, HTTPException

from app.core.permissions import get_current_user, require_case_access
from app.store import db

router = APIRouter(prefix="/api/v1/evidence", tags=["evidence"])


@router.get("/{evidence_id}")
def get_evidence(evidence_id: str, user: dict = Depends(get_current_user)):
    evidence = db.get_evidence(evidence_id)
    if not evidence:
        raise HTTPException(404, "Evidence not found")
    require_case_access(evidence["case_id"], user)
    return evidence

from fastapi import Form, Header
from typing import Optional

@router.post("/ingest")
async def ingest_document(
    file_name: str = Form("uploaded_document.txt"),
    raw_content: str = Form(...),
    source_type: Optional[str] = Form(None),
    x_user_id: Optional[str] = Header("OFFICER-771"),
    x_user_role: Optional[str] = Header("Investigator")
):
    from app.sih_core.ingestion import IngestionEngine
    from app.sih_core.extractor import ExtractorEngine
    from app.sih_core.converter import ConverterEngine
    from app.sih_core.audit import AuditLogger
    from app.sih_core.schema import SourceType
    from app.processing.translator import save_case_data
    
    ingestion_engine = IngestionEngine()
    extractor_engine = ExtractorEngine()
    converter_engine = ConverterEngine()

    forced_type = None
    if source_type:
        for st in SourceType:
            if st.value.lower() == source_type.lower():
                forced_type = st
                break

    ev, warnings = ingestion_engine.ingest_text_or_file(file_name, raw_content, "CASE-2026-001", forced_type)
    new_ents, new_rels = extractor_engine.extract_from_evidence(ev)

    save_case_data("CASE-2026-001", new_ents, new_rels)
    AuditLogger.log_action(x_user_id, x_user_role, "INGEST_DOCUMENT", f"Ingested {file_name} ({ev.source_type.value})")

    return {
        "message": "Data ingested and saved to Database",
        "evidence_object": ev.model_dump(),
        "warnings": warnings,
        "pipeline_stages": [
            {"stage": "1. Uploaded", "status": "COMPLETED"},
            {"stage": "2. Parsed & Saved", "status": "COMPLETED"}
        ],
        "extracted_entities_count": len(new_ents),
        "extracted_relationships_count": len(new_rels),
        "json_preview": converter_engine.export_to_json(new_ents, new_rels, [ev], [])
    }
