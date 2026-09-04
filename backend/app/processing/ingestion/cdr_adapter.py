"""
CDR adapter. Expects CSV text with header:
    caller,receiver,timestamp,duration_seconds,cell_tower

Fully deterministic parsing — CDRs are structured data, no NLP needed.
"""
import csv
import io

from app.processing.ingestion.base_adapter import BaseAdapter, RawFact
from app.processing.normalization import normalize_phone


class CDRAdapter(BaseAdapter):
    source_type = "CDR"

    def parse(self, raw_text: str, case_id: str, document_id: str) -> list[RawFact]:
        facts: list[RawFact] = []
        reader = csv.DictReader(io.StringIO(raw_text))
        for row in reader:
            caller = normalize_phone(row["caller"])
            receiver = normalize_phone(row["receiver"])

            for phone in (caller, receiver):
                facts.append(RawFact(
                    fact_type="entity",
                    payload={"entity_type": "Phone", "attributes": {"number": phone}},
                    extraction_method="cdr_adapter_v1",
                    confidence=1.0,
                ))

            facts.append(RawFact(
                fact_type="event",
                payload={
                    "event_type": "call",
                    "caller": caller,
                    "receiver": receiver,
                    "timestamp": row["timestamp"],
                    "duration_seconds": row.get("duration_seconds"),
                    "cell_tower": row.get("cell_tower"),
                },
                extraction_method="cdr_adapter_v1",
                confidence=1.0,
            ))

            facts.append(RawFact(
                fact_type="relationship",
                payload={
                    "type": "CALLS",
                    "from_phone": caller,
                    "to_phone": receiver,
                    "timestamp": row["timestamp"],
                    "observed_or_inferred": "observed",
                },
                extraction_method="cdr_adapter_v1",
                confidence=1.0,
            ))
        return facts
