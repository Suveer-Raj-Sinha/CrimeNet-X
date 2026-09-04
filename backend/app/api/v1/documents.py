from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.core.permissions import get_current_user, require_case_access
from app.processing.pipeline import process_document
from app.schemas.schemas import DocumentResponse, DocumentUpload
from app.store import db

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse)
def upload_document(payload: DocumentUpload, background_tasks: BackgroundTasks,
                     user: dict = Depends(get_current_user)):
    require_case_access(payload.case_id, user)
    doc = db.create_document(payload.case_id, payload.source_type, payload.filename, payload.raw_text)
    db.log_audit(user["username"], "upload_document", doc["document_id"], payload.case_id, "success")

    # MVP: FastAPI BackgroundTasks for async processing (see architecture doc
    # section 9 — swap for Celery/Arq when document volume grows).
    background_tasks.add_task(_run_pipeline_safe, doc["document_id"], payload.case_id,
                               payload.source_type, payload.raw_text)
    return doc


def _run_pipeline_safe(document_id, case_id, source_type, raw_text):
    try:
        process_document(document_id, case_id, source_type, raw_text)
    except Exception as exc:  # pragma: no cover - demo-grade error handling
        db.update_document_status(document_id, f"failed: {exc}")


@router.get("/{document_id}/status")
def document_status(document_id: str, user: dict = Depends(get_current_user)):
    doc = db.get_document(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    require_case_access(doc["case_id"], user)
    return {"document_id": document_id, "status": doc["status"]}


@router.get("/case/{case_id}", response_model=list[DocumentResponse])
def list_case_documents(case_id: str, user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    return db.list_documents(case_id)
