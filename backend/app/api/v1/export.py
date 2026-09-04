from fastapi import APIRouter, Depends, Response
from app.core.permissions import get_current_user
router = APIRouter(prefix="/api/v1/export", tags=["export"])

@router.get("/json")
def export_json(user: dict = Depends(get_current_user)):
    from app.sih_core.audit import AuditLogger
    from app.sih_core.converter import ConverterEngine
    from app.processing.translator import load_all_case_data
    
    AuditLogger.log_action(user["username"], user["role"], "EXPORT_JSON", "Exported CCTNS/NCRB structured case JSON")
    
    entities, relationships = load_all_case_data("CASE-2026-001")
    converter_engine = ConverterEngine()
    json_data = converter_engine.export_to_json(entities, relationships, [], [])
    return Response(content=json_data, media_type="application/json")

@router.get("/xml")
def export_xml(user: dict = Depends(get_current_user)):
    from app.sih_core.audit import AuditLogger
    from app.sih_core.converter import ConverterEngine
    from app.processing.translator import load_all_case_data
    
    AuditLogger.log_action(user["username"], user["role"], "EXPORT_XML", "Exported CCTNS/NCRB structured case XML")
    
    entities, relationships = load_all_case_data("CASE-2026-001")
    converter_engine = ConverterEngine()
    xml_data = converter_engine.export_to_xml(entities, relationships, [])
    return Response(content=xml_data, media_type="application/xml")
