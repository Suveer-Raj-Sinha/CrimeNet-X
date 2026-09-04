from fastapi import APIRouter, Depends

from app.core.permissions import get_current_user, require_case_access
from app.processing.analytics import network_analysis, run_alert_rules, temporal_burst_analysis

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/network/{case_id}")
def get_network_analysis(case_id: str, user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    return network_analysis(case_id)


@router.get("/temporal/{case_id}")
def get_temporal_analysis(case_id: str, user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    return {"case_id": case_id, "findings": temporal_burst_analysis(case_id)}


@router.post("/run-alerts/{case_id}")
def trigger_alert_rules(case_id: str, user: dict = Depends(get_current_user)):
    require_case_access(case_id, user)
    created = run_alert_rules(case_id)
    return {"alerts_created": [a["alert_id"] for a in created]}

@router.get("/case/{case_id}/timeline_geo")
def get_timeline_geo(case_id: str, user: dict = Depends(get_current_user)):
    from app.processing.translator import load_all_case_data
    from app.sih_core.analytics import AnalyticsEngine
    
    entities_db, relationships_db = load_all_case_data(case_id)
    analytics_engine = AnalyticsEngine()
    
    timeline_events = analytics_engine.build_unified_timeline(entities_db, relationships_db)
    co_location_events = analytics_engine.perform_geospatial_temporal_correlation(entities_db, relationships_db)
    
    return {
        "timeline_events": [t.model_dump() for t in timeline_events],
        "co_location_events": [g.model_dump() for g in co_location_events]
    }
