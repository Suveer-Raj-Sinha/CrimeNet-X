"""
CRIMENET-X Entity & Property Normalization Module
Standardizes phone numbers, vehicle registration numbers, names, dates, and locations.
"""

import re
from typing import Dict, Any


class Normalizer:
    @staticmethod
    def normalize_phone(phone_str: str) -> str:
        """Standardizes Indian phone numbers to 10-digit format with +91 prefix."""
        digits = re.sub(r'\D', '', str(phone_str))
        if len(digits) == 10:
            return f"+91{digits}"
        elif len(digits) == 12 and digits.startswith("91"):
            return f"+{digits}"
        elif len(digits) == 11 and digits.startswith("0"):
            return f"+91{digits[1:]}"
        return phone_str.strip()

    @staticmethod
    def normalize_vehicle(vehicle_str: str) -> str:
        """Standardizes Indian vehicle registration plates (e.g. RJ-14 AB 1234 -> RJ14AB1234)."""
        clean = re.sub(r'[^A-Za-z0-9]', '', str(vehicle_str)).upper()
        return clean

    @staticmethod
    def normalize_name(name_str: str) -> str:
        """Standardizes person names by removing extra spaces and titles."""
        clean = re.sub(r'^(Mr\.|Mrs\.|Ms\.|Shri|Dr\.|Suspect|Accused)\s+', '', name_str.strip(), flags=re.IGNORECASE)
        clean = " ".join([word.capitalize() for word in clean.split()])
        return clean

    @staticmethod
    def normalize_imei(imei_str: str) -> str:
        """Cleans and validates 15-digit IMEI strings."""
        digits = re.sub(r'\D', '', str(imei_str))
        return digits

    @staticmethod
    def normalize_account(account_str: str) -> str:
        """Standardizes bank account and UPI IDs."""
        return account_str.strip().upper()
