from typing import Optional

from fastapi import APIRouter, Depends

from app.core.permissions import require_role
from app.store import db

router = APIRouter(prefix="/api/v1/audit", tags=["audit"])


@router.get("/")
def list_audit(case_id: Optional[str] = None, username: Optional[str] = None,
               user: dict = Depends(require_role("admin"))):
    return db.list_audit(case_id=case_id, username=username)
