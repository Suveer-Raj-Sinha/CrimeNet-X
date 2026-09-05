from typing import Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str
    mfa_code: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class CaseCreate(BaseModel):
    title: str
    description: str = ""


class CaseResponse(BaseModel):
    case_id: str
    title: str
    description: str
    status: str
    created_by: str
    created_at: str


class DocumentUpload(BaseModel):
    case_id: str
    source_type: str  # "FIR" | "CDR"
    filename: str
    raw_text: str


class DocumentResponse(BaseModel):
    document_id: str
    case_id: str
    source_type: str
    filename: str
    status: str
    created_at: str


class GraphNode(BaseModel):
    id: str
    type: Optional[str] = None
    label: Optional[str] = None
    metadata: dict = {}
    importance: Optional[float] = None


class GraphLink(BaseModel):
    source: str
    target: str
    relationship: Optional[str] = None
    timestamp: Optional[str] = None
    confidence: Optional[float] = None
    evidence_ref: Optional[str] = None
    status: Optional[str] = None


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]


class AlertActionRequest(BaseModel):
    note: Optional[str] = None
