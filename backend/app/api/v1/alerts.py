from fastapi import APIRouter, Depends, HTTPException

from app.core.permissions import get_current_user, require_case_access, require_role
from app.schemas.schemas import AlertActionRequest
from app.store import db

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])


@router.get("/case/{case_id}")
def list_case_alerts(case_id: str, user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    return db.list_alerts(case_id)


@router.get("/{alert_id}")
def get_alert(alert_id: str, user: dict = Depends(get_current_user)):
    alert = db.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    require_case_access(alert["case_id"], user)
    return alert


@router.post("/{alert_id}/approve")
def approve_alert(alert_id: str, payload: AlertActionRequest,
                   user: dict = Depends(require_role("admin", "investigator", "analyst"))):
    alert = db.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    require_case_access(alert["case_id"], user)
    db.update_alert_status(alert_id, "approved")
    db.log_audit(user["username"], "approve_alert", alert_id, alert["case_id"], "success")
    return {"alert_id": alert_id, "status": "approved"}


@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: str, payload: AlertActionRequest,
                   user: dict = Depends(require_role("admin", "investigator", "analyst"))):
    alert = db.get_alert(alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    require_case_access(alert["case_id"], user)
    db.update_alert_status(alert_id, "dismissed")
    db.log_audit(user["username"], "dismiss_alert", alert_id, alert["case_id"], "success")
    return {"alert_id": alert_id, "status": "dismissed"}
