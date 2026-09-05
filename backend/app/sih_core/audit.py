"""
CRIMENET-X Audit Logger
Records immutable audit logs for file uploads, entity approval/rejections,
query executions, and data exports.
"""

import uuid
from typing import List, Dict, Any
from app.sih_core.schema import AuditLog, current_utc_time
from app.sih_core.database import get_db_connection


class AuditLogger:
    @staticmethod
    def log_action(user_id: str, user_role: str, action: str, details: str) -> AuditLog:
        log_entry = AuditLog(
            log_id=f"LOG-{uuid.uuid4().hex[:8].upper()}",
            timestamp=current_utc_time(),
            user_id=user_id,
            user_role=user_role,
            action=action,
            details=details
        )

        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO audit_logs (log_id, timestamp, user_id, user_role, action, details) VALUES (?, ?, ?, ?, ?, ?)",
                (log_entry.log_id, log_entry.timestamp, log_entry.user_id, log_entry.user_role, log_entry.action, log_entry.details)
            )
            conn.commit()
            conn.close()
        except Exception:
            pass

        return log_entry

    @staticmethod
    def get_recent_logs(limit: int = 20) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
