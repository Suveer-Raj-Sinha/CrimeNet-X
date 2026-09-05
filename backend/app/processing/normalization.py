"""
Simple normalization utilities used by ingestion adapters.
"""
import re


def normalize_phone(raw: str) -> str:
    """Strip all non-digit characters and ensure a leading +91 for Indian numbers."""
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 10:
        digits = "91" + digits
    return "+" + digits if digits else raw


def normalize_name(raw: str) -> str:
    """Title-case and strip extra whitespace from a person name."""
    return " ".join(raw.strip().title().split())


def normalize_vehicle_plate(raw: str) -> str:
    """Uppercase and strip spaces/hyphens from a vehicle plate number."""
    return re.sub(r"[\s\-]", "", (raw or "").upper())
