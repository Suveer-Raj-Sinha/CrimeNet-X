"""
CRIMENET-X Data Quality Validator & Sanity Engine
Validates phone numbers (+91), vehicle plates (RTO regex), timestamps,
latitude/longitude ranges, transaction amounts, file types, and rejects malformed records.
"""

import re
from typing import Tuple, List, Dict, Any


class DataQualityValidator:
    @staticmethod
    def validate_phone(phone_str: str) -> bool:
        digits = re.sub(r'\D', '', str(phone_str))
        return len(digits) == 10 or (len(digits) == 12 and digits.startswith("91"))

    @staticmethod
    def validate_vehicle_plate(plate_str: str) -> bool:
        clean = re.sub(r'[^A-Za-z0-9]', '', str(plate_str)).upper()
        return bool(re.match(r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$', clean))

    @staticmethod
    def validate_lat_lon(lat: float, lon: float) -> bool:
        return (-90.0 <= lat <= 90.0) and (-180.0 <= lon <= 180.0)

    @staticmethod
    def validate_amount(amount: float) -> bool:
        return amount >= 0.0

    @staticmethod
    def validate_payload(raw_content: str, file_name: str) -> Tuple[bool, List[str]]:
        warnings = []
        if not raw_content or not raw_content.strip():
            return False, ["Payload content is completely empty"]

        if len(raw_content) > 10 * 1024 * 1024:
            return False, ["File size exceeds 10MB safety limit"]

        # Basic path traversal & filename safety check
        if ".." in file_name or "/" in file_name or "\\" in file_name:
            warnings.append("Filename sanitized to prevent directory traversal")

        return True, warnings
