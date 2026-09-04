"""
FIR / police-report adapter.

For this MVP, extraction is regex/pattern based (deterministic, explainable)
rather than a full spaCy NER pipeline, to keep the demo dependency-light.
Swap `_extract_names` for a real spaCy PERSON-entity pass by installing
spaCy and a model, then calling nlp(text).ents in production — the adapter
interface and downstream pipeline do not change either way.

Expected synthetic FIR text format (loose, for demo purposes):

    Complainant: Rahul Kumar
    Accused: Vikram Singh
    Phone: 9876543210
    Vehicle: DL01AB1234
    Incident: Theft reported at Sector 12 Market on 2026-06-01
"""
import re

from app.processing.ingestion.base_adapter import BaseAdapter, RawFact
from app.processing.normalization import normalize_name, normalize_phone, normalize_vehicle_plate

NAME_LINE = re.compile(r"(Complainant|Accused|Witness)\s*:\s*(.+)", re.IGNORECASE)
PHONE_LINE = re.compile(r"Phone\s*:\s*([\d+\-\s]+)", re.IGNORECASE)
VEHICLE_LINE = re.compile(r"Vehicle\s*:\s*([A-Za-z0-9\-]+)", re.IGNORECASE)
INCIDENT_LINE = re.compile(r"Incident\s*:\s*(.+)", re.IGNORECASE)
DATE_IN_TEXT = re.compile(r"(\d{4}-\d{2}-\d{2})")
LOCATION_HINT = re.compile(r"at\s+([A-Za-z0-9 ,]+?)\s+on\s+\d{4}-\d{2}-\d{2}")


class FIRAdapter(BaseAdapter):
    source_type = "FIR"

    def parse(self, raw_text: str, case_id: str, document_id: str) -> list[RawFact]:
        facts: list[RawFact] = []
        person_roles: dict[str, str] = {}

        for line in raw_text.splitlines():
            m = NAME_LINE.search(line)
            if m:
                role, raw_name = m.group(1), m.group(2)
                name = normalize_name(raw_name)
                person_roles[name] = role.lower()
                facts.append(RawFact(
                    fact_type="entity",
                    payload={"entity_type": "Person", "attributes": {"name": name, "role_in_report": role.lower()}},
                    extraction_method="fir_adapter_regex_v1",
                    confidence=0.9,
                ))
                continue

            m = PHONE_LINE.search(line)
            if m:
                phone = normalize_phone(m.group(1))
                facts.append(RawFact(
                    fact_type="entity",
                    payload={"entity_type": "Phone", "attributes": {"number": phone}},
                    extraction_method="fir_adapter_regex_v1",
                    confidence=1.0,
                ))
                continue

            m = VEHICLE_LINE.search(line)
            if m:
                plate = normalize_vehicle_plate(m.group(1))
                facts.append(RawFact(
                    fact_type="entity",
                    payload={"entity_type": "Vehicle", "attributes": {"plate": plate}},
                    extraction_method="fir_adapter_regex_v1",
                    confidence=1.0,
                ))
                continue

            m = INCIDENT_LINE.search(line)
            if m:
                description = m.group(1).strip()
                date_match = DATE_IN_TEXT.search(description)
                loc_match = LOCATION_HINT.search(description)
                facts.append(RawFact(
                    fact_type="event",
                    payload={
                        "event_type": "incident",
                        "description": description,
                        "timestamp": date_match.group(1) if date_match else None,
                        "location_name": loc_match.group(1).strip() if loc_match else None,
                        "participant_names": list(person_roles.keys()),
                    },
                    extraction_method="fir_adapter_regex_v1",
                    confidence=0.85,
                ))

        return facts
