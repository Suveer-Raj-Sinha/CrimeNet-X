"""
CRIMENET-X Canonical Data Schemas & Strict Data Contracts
Includes Pydantic models for Case, SourceDocument, CanonicalEvidenceObject,
Entity, Relationship, EvidencePointer, ResolutionCandidate, RelevanceScore, Alert,
TimelineEvent, GeoEvent, and AuditLog.

Explicitly separates:
- extraction_confidence
- entity_resolution_confidence
- relationship_confidence
- source_reliability
- relevance_score
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class SourceType(str, Enum):
    # 7 Fully Implemented Demo MVP Modalities
    FIR_POLICE_REPORT = "FIR / Police Reports"
    CASE_DIARIES = "Case Diaries / Investigation Notes"
    CDR = "CDR (Call Detail Records)"
    FINANCIAL_TRANSACTIONS = "Financial Transactions / UPI"
    CCTV_ANPR = "CCTV / ANPR Metadata"
    LOCATION_GPS = "Location / GPS Data"
    WITNESS_STATEMENTS = "Witness Statements"
    VEHICLE_RECORDS = "Vehicle Records"
    
    # 15 Extension-Ready Modalities
    LEGAL_RECORDS = "Court / Legal Records [Extension Ready]"
    SMS_EMAIL = "SMS / Email Metadata [Extension Ready]"
    BLOCKCHAIN_DATA = "Blockchain Data [Extension Ready]"
    SURVEILLANCE_REPORTS = "Surveillance Reports [Extension Ready]"
    TRAVEL_RECORDS = "Travel / Transport Records [Extension Ready]"
    HOTEL_RECORDS = "Hotel / Access Records [Extension Ready]"
    PROPERTY_RECORDS = "Property / Asset Records [Extension Ready]"
    BANK_KYC = "Bank / KYC Records [Extension Ready]"
    SIM_DEVICE_DATA = "Phone / SIM / Device Data [Extension Ready]"
    IP_LOGIN_LOGS = "IP / Login Logs [Extension Ready]"
    DOMAIN_URL_DATA = "Domain / URL Data [Extension Ready]"
    SOCMINT = "SOCMINT / Public Intelligence [Extension Ready]"
    COMPANY_RECORDS = "Company / Organization Records [Extension Ready]"
    DIGITAL_EVIDENCE = "Digital Evidence Hashes [Extension Ready]"


class EntityType(str, Enum):
    PERSON = "PERSON"
    PHONE = "PHONE"
    VEHICLE = "VEHICLE"
    LOCATION = "LOCATION"
    DATE_TIME = "DATE_TIME"
    ACCOUNT = "ACCOUNT"
    WALLET = "WALLET"
    IMEI = "IMEI"
    IP_ADDRESS = "IP_ADDRESS"
    DOMAIN = "DOMAIN"
    ORGANIZATION = "ORGANIZATION"
    CASE = "CASE"
    DOCUMENT = "DOCUMENT"
    PROPERTY = "PROPERTY"
    FILE_HASH = "FILE_HASH"


class RelationshipType(str, Enum):
    CALLS = "CALLS"
    TRANSFERS_FUNDS = "TRANSFERS_FUNDS"
    MET_AT = "MET_AT"
    LOCATED_AT = "LOCATED_AT"
    OWNED_BY = "OWNED_BY"
    USES_DEVICE = "USES_DEVICE"
    ASSOCIATED_WITH = "ASSOCIATED_WITH"
    MEMBER_OF = "MEMBER_OF"
    SIGHTED_AT = "SIGHTED_AT"
    SEARCHED_DOMAIN = "SEARCHED_DOMAIN"
    REGISTERED_TO = "REGISTERED_TO"
    INVOLVED_IN = "INVOLVED_IN"


class MatchClassification(str, Enum):
    STRONG_MATCH = "STRONG MATCH"
    POSSIBLE_MATCH = "POSSIBLE MATCH"
    NO_MATCH = "NO MATCH"


def current_utc_time() -> str:
    return datetime.now(timezone.utc).isoformat()


class EvidencePointer(BaseModel):
    source_file: str
    source_type: SourceType
    line_number: Optional[int] = None
    csv_row: Optional[int] = None
    camera_id: Optional[str] = None
    raw_snippet: str
    created_at: str = Field(default_factory=current_utc_time)


class CanonicalEvidenceObject(BaseModel):
    evidence_id: str
    case_id: str = "CASE-2026-001"
    source_type: SourceType
    source_file: str
    file_hash_sha256: str
    ingested_at: str = Field(default_factory=current_utc_time)
    source_reliability: float = Field(default=0.90, ge=0.0, le=1.0)
    raw_payload: str
    processing_version: str = "v1.0.0"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Entity(BaseModel):
    id: str
    name: str
    type: EntityType
    canonical_id: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    extraction_confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    evidence_citations: List[str] = Field(default_factory=list)
    pointers: List[EvidencePointer] = Field(default_factory=list)


class Relationship(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    type: RelationshipType
    attributes: Dict[str, Any] = Field(default_factory=dict)
    relationship_confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    is_directly_observed: bool = True
    evidence_citations: List[str] = Field(default_factory=list)
    pointer: Optional[EvidencePointer] = None


class ResolutionCandidate(BaseModel):
    candidate_id: str
    entity_a_id: str
    entity_a_name: str
    entity_b_id: str
    entity_b_name: str
    classification: MatchClassification
    entity_resolution_confidence: float = Field(ge=0.0, le=1.0)
    matched_features: List[str]
    status: str = "PENDING_REVIEW"  # PENDING_REVIEW, APPROVED, REJECTED
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None


class RelevanceScore(BaseModel):
    score: float = Field(ge=0.0, le=100.0)  # Normalized scale 0-100
    relevance_level: str
    component_breakdown: Dict[str, float]
    why_breakdown: List[str]
    evidence_citations: List[Dict[str, str]]
    source_reliability_factor: float


class TimelineEvent(BaseModel):
    event_id: str
    timestamp: str
    title: str
    event_type: str
    participating_entities: List[str]
    source_file: str
    evidence_id: str
    pointer: Optional[EvidencePointer] = None


class GeoEvent(BaseModel):
    geo_id: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: str
    entities_present: List[str]
    sources: List[str]
    radius_km: float = 1.0


class Alert(BaseModel):
    alert_id: str
    severity: str  # HIGH, MEDIUM, LOW
    title: str
    pattern_description: str  # Defensible phrasing ("Unusual Pattern for Investigator Review")
    baseline_comparison: str
    supporting_records: List[str]
    investigator_action_recommendation: str
    created_at: str = Field(default_factory=current_utc_time)


class AuditLog(BaseModel):
    log_id: str
    timestamp: str = Field(default_factory=current_utc_time)
    user_id: str
    user_role: str  # Investigator, Admin
    action: str  # UPLOAD, MERGE, REJECT, QUERY, EXPORT
    details: str
