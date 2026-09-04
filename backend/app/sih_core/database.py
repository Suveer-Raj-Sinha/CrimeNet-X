"""
CRIMENET-X SQLite Relational Database Engine
Provides persistence for cases, documents, evidence, entities, entity_aliases,
relationships, timeline_events, geo_events, alerts, and audit_logs.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "crimenetx.db")


def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS cases (
        case_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
        doc_id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_hash_sha256 TEXT NOT NULL,
        source_type TEXT NOT NULL,
        raw_content TEXT NOT NULL,
        ingested_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
        evidence_id TEXT PRIMARY KEY,
        doc_id TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_reliability REAL NOT NULL,
        metadata_json TEXT
    );

    CREATE TABLE IF NOT EXISTS entities (
        entity_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        extraction_confidence REAL NOT NULL,
        attributes_json TEXT
    );

    CREATE TABLE IF NOT EXISTS entity_aliases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        alias_name TEXT NOT NULL,
        FOREIGN KEY(entity_id) REFERENCES entities(entity_id)
    );

    CREATE TABLE IF NOT EXISTS relationships (
        rel_id TEXT PRIMARY KEY,
        source_entity_id TEXT NOT NULL,
        target_entity_id TEXT NOT NULL,
        type TEXT NOT NULL,
        relationship_confidence REAL NOT NULL,
        is_directly_observed INTEGER NOT NULL,
        provenance_json TEXT
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
        event_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        title TEXT NOT NULL,
        event_type TEXT NOT NULL,
        evidence_id TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
        alert_id TEXT PRIMARY KEY,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        pattern_description TEXT NOT NULL,
        baseline_comparison TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_role TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL
    );
    """)

    conn.commit()
    conn.close()


init_db()
