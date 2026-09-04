"""
CRIMENET-X Ingestion & Source Adapter Engine
Detects document types, validates raw content, computes SHA-256 hashes,
wraps incoming data into Canonical Evidence Objects, and persists records in DB.
"""

import hashlib
import uuid
import csv
from io import StringIO
from typing import List, Dict, Any, Tuple
from app.sih_core.schema import CanonicalEvidenceObject, SourceType, current_utc_time
from validator import DataQualityValidator
from app.sih_core.database import get_db_connection


class IngestionEngine:
    @staticmethod
    def calculate_sha256(content: str) -> str:
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    @staticmethod
    def detect_source_type(file_name: str, content: str) -> SourceType:
        name_lower = file_name.lower()
        content_lower = content.lower()

        if "fir" in name_lower or "first information report" in content_lower:
            return SourceType.FIR_POLICE_REPORT
        elif "cdr" in name_lower or "call detail" in content_lower or "calling_num" in content_lower:
            return SourceType.CDR
        elif "anpr" in name_lower or "cctv" in name_lower or "plate" in content_lower:
            return SourceType.CCTV_ANPR
        elif "bank" in name_lower or "transaction" in content_lower or "account_no" in content_lower:
            return SourceType.FINANCIAL_TRANSACTIONS
        elif "gps" in name_lower or "latitude" in content_lower:
            return SourceType.LOCATION_GPS
        elif "witness" in name_lower or "statement" in content_lower:
            return SourceType.WITNESS_STATEMENTS
        elif "vehicle" in name_lower or "rto" in name_lower or "registration" in content_lower:
            return SourceType.VEHICLE_RECORDS
        else:
            return SourceType.CASE_DIARIES

    def ingest_text_or_file(
        self,
        file_name: str,
        raw_content: str,
        case_id: str = "CASE-2026-001",
        forced_source_type: SourceType = None,
        source_reliability: float = 0.95
    ) -> Tuple[CanonicalEvidenceObject, List[str]]:
        
        # 1. Validate payload
        is_valid, warnings = DataQualityValidator.validate_payload(raw_content, file_name)
        if not is_valid:
            raise ValueError(f"Payload validation failed: {', '.join(warnings)}")

        detected_type = forced_source_type or self.detect_source_type(file_name, raw_content)
        file_hash = self.calculate_sha256(raw_content)
        evidence_id = f"EV-{uuid.uuid4().hex[:8].upper()}"

        metadata = {
            "character_count": len(raw_content),
            "line_count": len(raw_content.splitlines()),
            "format": "CSV" if (file_name.endswith(".csv") or "," in raw_content[:100]) else "TEXT/PDF"
        }

        evidence_obj = CanonicalEvidenceObject(
            evidence_id=evidence_id,
            case_id=case_id,
            source_type=detected_type,
            source_file=file_name,
            file_hash_sha256=file_hash,
            source_reliability=source_reliability,
            raw_payload=raw_content,
            ingested_at=current_utc_time(),
            metadata=metadata
        )

        # 2. Persist raw immutable evidence to database
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO documents (doc_id, case_id, file_name, file_hash_sha256, source_type, raw_content, ingested_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (evidence_id, case_id, file_name, file_hash, detected_type.value, raw_content, evidence_obj.ingested_at)
            )
            cursor.execute(
                "INSERT OR REPLACE INTO evidence (evidence_id, doc_id, source_type, source_reliability, metadata_json) VALUES (?, ?, ?, ?, ?)",
                (evidence_id, evidence_id, detected_type.value, source_reliability, str(metadata))
            )
            conn.commit()
            conn.close()
        except Exception as e:
            warnings.append(f"DB persistence warning: {str(e)}")

        return evidence_obj, warnings
