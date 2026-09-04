import sqlite3
import itertools
import uuid
import json
from datetime import datetime, timezone
from typing import Optional
import os

from app.core.security import hash_password

DB_FILE = os.path.join(os.path.dirname(__file__), "crimenetx.db")

def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def _init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            role TEXT NOT NULL,
            hashed_password TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cases (
            case_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT,
            created_by TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS case_access (
            case_id TEXT,
            username TEXT,
            PRIMARY KEY (case_id, username)
        );
        CREATE TABLE IF NOT EXISTS documents (
            document_id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            source_type TEXT,
            filename TEXT,
            raw_text TEXT,
            status TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS evidence (
            evidence_id TEXT PRIMARY KEY,
            case_id TEXT,
            document_id TEXT,
            extracted_fact TEXT,
            extraction_method TEXT,
            confidence REAL,
            linked_entities TEXT,
            linked_relationships TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            case_id TEXT,
            type TEXT,
            priority TEXT,
            detected TEXT,
            why_detected TEXT,
            entities TEXT,
            supporting_relationships TEXT,
            evidence TEXT,
            confidence REAL,
            status TEXT,
            created_at TEXT
        );
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT,
            resource TEXT,
            case_id TEXT,
            result TEXT,
            timestamp TEXT
        );
        """)

_init_db()

def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

def seed_default_users():
    with get_db() as conn:
        if conn.execute("SELECT 1 FROM users").fetchone():
            return
        users = [
            ("admin", "admin", hash_password("admin123")),
            ("investigator1", "investigator", hash_password("invest123")),
            ("analyst1", "analyst", hash_password("analyst123")),
            ("viewer1", "viewer", hash_password("viewer123")),
        ]
        conn.executemany("INSERT INTO users VALUES (?, ?, ?)", users)

def get_user(username: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        return dict(row) if row else None
        
def create_case(title: str, description: str, created_by: str) -> dict:
    case_id = _new_id("CASE")
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT INTO cases VALUES (?, ?, ?, ?, ?, ?)",
                     (case_id, title, description, "open", created_by, now))
        conn.execute("INSERT INTO case_access VALUES (?, ?)", (case_id, created_by))
    return get_case(case_id)

def create_case_direct(case_id: str, title: str, description: str, status: str, created_by: str) -> dict:
    """Insert a case with a pre-specified case_id (used for demo seeding)."""
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT OR IGNORE INTO cases VALUES (?, ?, ?, ?, ?, ?)",
                     (case_id, title, description, status, created_by, now))
        conn.execute("INSERT OR IGNORE INTO case_access VALUES (?, ?)", (case_id, created_by))
        conn.execute("INSERT OR IGNORE INTO case_access VALUES (?, ?)", (case_id, "admin"))
    return get_case(case_id)

def get_case(case_id: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,)).fetchone()
        return dict(row) if row else None

def list_cases(username: Optional[str] = None) -> list[dict]:
    with get_db() as conn:
        if username is None:
            rows = conn.execute("SELECT * FROM cases").fetchall()
        else:
            rows = conn.execute("""
                SELECT c.* FROM cases c
                JOIN case_access ca ON c.case_id = ca.case_id
                WHERE ca.username = ?
            """, (username,)).fetchall()
        return [dict(r) for r in rows]

def grant_case_access(case_id: str, username: str):
    with get_db() as conn:
        conn.execute("INSERT OR IGNORE INTO case_access VALUES (?, ?)", (case_id, username))

def user_has_case_access(username: str, case_id: str) -> bool:
    with get_db() as conn:
        row = conn.execute("SELECT 1 FROM case_access WHERE case_id = ? AND username = ?", (case_id, username)).fetchone()
        return bool(row)

def create_document(case_id: str, source_type: str, filename: str, raw_text: str) -> dict:
    doc_id = _new_id("DOC")
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?, ?)",
                     (doc_id, case_id, source_type, filename, raw_text, "uploaded", now))
    return get_document(doc_id)

def update_document_status(doc_id: str, status: str):
    with get_db() as conn:
        conn.execute("UPDATE documents SET status = ? WHERE document_id = ?", (status, doc_id))

def get_document(doc_id: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM documents WHERE document_id = ?", (doc_id,)).fetchone()
        return dict(row) if row else None

def list_documents(case_id: str) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM documents WHERE case_id = ?", (case_id,)).fetchall()
        return [dict(r) for r in rows]

def create_evidence(case_id: str, document_id: str, extracted_fact: str,
                     extraction_method: str, confidence: float,
                     linked_entities: list[str], linked_relationships: list[str]) -> dict:
    evidence_id = _new_id("EVD")
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT INTO evidence VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (evidence_id, case_id, document_id, extracted_fact, extraction_method, confidence, 
                      json.dumps(linked_entities), json.dumps(linked_relationships), now))
    return get_evidence(evidence_id)

def get_evidence(evidence_id: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM evidence WHERE evidence_id = ?", (evidence_id,)).fetchone()
        if row:
            d = dict(row)
            d["linked_entities"] = json.loads(d["linked_entities"])
            d["linked_relationships"] = json.loads(d["linked_relationships"])
            return d
        return None

def create_alert(case_id: str, alert_type: str, priority: str, detected: str,
                  why_detected: str, entities: list[str], relationships: list[str],
                  evidence: list[str], confidence: float) -> dict:
    alert_id = _new_id("ALERT")
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (alert_id, case_id, alert_type, priority, detected, why_detected,
                      json.dumps(entities), json.dumps(relationships), json.dumps(evidence), confidence, "new", now))
    return get_alert(alert_id)

def list_alerts(case_id: str) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM alerts WHERE case_id = ?", (case_id,)).fetchall()
        res = []
        for r in rows:
            d = dict(r)
            d["entities"] = json.loads(d["entities"])
            d["supporting_relationships"] = json.loads(d["supporting_relationships"])
            d["evidence"] = json.loads(d["evidence"])
            res.append(d)
        return res

def get_alert(alert_id: str) -> Optional[dict]:
    with get_db() as conn:
        row = conn.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,)).fetchone()
        if row:
            d = dict(row)
            d["entities"] = json.loads(d["entities"])
            d["supporting_relationships"] = json.loads(d["supporting_relationships"])
            d["evidence"] = json.loads(d["evidence"])
            return d
        return None

def update_alert_status(alert_id: str, status: str):
    with get_db() as conn:
        conn.execute("UPDATE alerts SET status = ? WHERE alert_id = ?", (status, alert_id))

def log_audit(username: str, action: str, resource: str, case_id: Optional[str], result: str):
    now = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        conn.execute("INSERT INTO audit_log (username, action, resource, case_id, result, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                     (username, action, resource, case_id, result, now))

def list_audit(case_id: Optional[str] = None, username: Optional[str] = None) -> list[dict]:
    with get_db() as conn:
        query = "SELECT * FROM audit_log WHERE 1=1"
        params = []
        if case_id:
            query += " AND case_id = ?"
            params.append(case_id)
        if username:
            query += " AND username = ?"
            params.append(username)
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
