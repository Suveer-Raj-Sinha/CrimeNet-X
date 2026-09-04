"""
Orchestrates: RawFact list -> entity resolution -> graph write -> evidence
record. This is the one place that ties adapters, resolution, and the graph
store together, per the pipeline in the architecture doc (section 7).

Deterministic entities (Phone, Vehicle) are deduplicated by their natural key
(number/plate) within a case — no ambiguity there, no review needed.
Person entities go through the fuzzy resolution engine and are written as
"candidate" if a plausible existing match is found, "confirmed" otherwise
pending investigator action on any surfaced candidate match.
"""
import uuid
from datetime import datetime, timezone

from app.processing.ingestion.base_adapter import RawFact
from app.processing.ingestion.cdr_adapter import CDRAdapter
from app.processing.ingestion.fir_adapter import FIRAdapter
from app.processing.resolution import score_person_match
from app.store import db
from app.store.graph_store import graph_store

ADAPTERS = {
    "FIR": FIRAdapter(),
    "CDR": CDRAdapter(),
}


def _new_entity_id() -> str:
    return f"ENT-{uuid.uuid4().hex[:8].upper()}"


def _new_rel_id() -> str:
    return f"REL-{uuid.uuid4().hex[:8].upper()}"


def _new_event_id() -> str:
    return f"EVT-{uuid.uuid4().hex[:8].upper()}"


def _find_existing_by_key(case_id: str, entity_type: str, key_field: str, key_value: str):
    for e in graph_store.all_entities(case_id):
        if e.get("entity_type") == entity_type and e.get("attributes", {}).get(key_field) == key_value:
            return e
    return None


def _find_person_by_name(case_id: str, name: str):
    for e in graph_store.all_entities(case_id):
        if e.get("entity_type") == "Person" and e.get("attributes", {}).get("name") == name:
            return e
    return None


def process_document(document_id: str, case_id: str, source_type: str, raw_text: str) -> dict:
    """Runs the full pipeline for one uploaded document. Returns a summary."""
    adapter = ADAPTERS.get(source_type)
    if adapter is None:
        raise ValueError(f"No ingestion adapter registered for source_type={source_type}")

    facts: list[RawFact] = adapter.parse(raw_text, case_id, document_id)

    name_to_entity_id: dict[str, str] = {}
    phone_to_entity_id: dict[str, str] = {}
    candidate_matches = []
    created_entities, created_relationships, created_events, created_evidence = [], [], [], []

    for fact in facts:
        if fact.fact_type == "entity":
            entity = _write_entity(case_id, document_id, fact, name_to_entity_id,
                                    phone_to_entity_id, candidate_matches)
            if entity:
                created_entities.append(entity["entity_id"])
                ev = db.create_evidence(
                    case_id, document_id,
                    extracted_fact=f"{fact.payload['entity_type']}: {fact.payload['attributes']}",
                    extraction_method=fact.extraction_method,
                    confidence=fact.confidence,
                    linked_entities=[entity["entity_id"]],
                    linked_relationships=[],
                )
                created_evidence.append(ev["evidence_id"])

    # Second pass: relationships/events reference entities created above
    for fact in facts:
        if fact.fact_type == "relationship" and fact.payload.get("type") == "CALLS":
            from_id = phone_to_entity_id.get(fact.payload["from_phone"])
            to_id = phone_to_entity_id.get(fact.payload["to_phone"])
            if not (from_id and to_id):
                continue
            rel_id = _new_rel_id()
            ev = db.create_evidence(
                case_id, document_id,
                extracted_fact=f"Call from {fact.payload['from_phone']} to {fact.payload['to_phone']} at {fact.payload['timestamp']}",
                extraction_method=fact.extraction_method, confidence=fact.confidence,
                linked_entities=[from_id, to_id], linked_relationships=[rel_id],
            )
            rel = {
                "relationship_id": rel_id, "type": "CALLS",
                "from_entity": from_id, "to_entity": to_id,
                "case_id": case_id, "observed_or_inferred": "observed",
                "confidence": fact.confidence, "extraction_method": fact.extraction_method,
                "source_id": document_id, "evidence_id": ev["evidence_id"],
                "timestamp": fact.payload["timestamp"], "status": "confirmed",
            }
            graph_store.upsert_relationship(rel)
            created_relationships.append(rel_id)
            created_evidence.append(ev["evidence_id"])

        elif fact.fact_type == "event" and fact.payload.get("event_type") == "call":
            from_id = phone_to_entity_id.get(fact.payload["caller"])
            to_id = phone_to_entity_id.get(fact.payload["receiver"])
            participants = [p for p in (from_id, to_id) if p]
            event_id = _new_event_id()
            event = {
                "event_id": event_id, "event_type": "call",
                "timestamp": fact.payload["timestamp"], "participants": participants,
                "case_id": case_id, "source_id": document_id,
                "confidence": fact.confidence,
                "metadata": {"duration_seconds": fact.payload.get("duration_seconds"),
                             "cell_tower": fact.payload.get("cell_tower")},
            }
            graph_store.upsert_event(event)
            created_events.append(event_id)

        elif fact.fact_type == "event" and fact.payload.get("event_type") == "incident":
            participants = [name_to_entity_id[n] for n in fact.payload.get("participant_names", [])
                             if n in name_to_entity_id]
            event_id = _new_event_id()
            event = {
                "event_id": event_id, "event_type": "incident",
                "timestamp": fact.payload.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                "participants": participants, "case_id": case_id, "source_id": document_id,
                "confidence": fact.confidence,
                "metadata": {"description": fact.payload.get("description"),
                             "location_name": fact.payload.get("location_name")},
            }
            graph_store.upsert_event(event)
            created_events.append(event_id)

    db.update_document_status(document_id, "processed")

    return {
        "document_id": document_id,
        "entities_created": created_entities,
        "relationships_created": created_relationships,
        "events_created": created_events,
        "evidence_created": created_evidence,
        "candidate_matches": candidate_matches,
    }


def _write_entity(case_id, document_id, fact: RawFact, name_to_entity_id, phone_to_entity_id, candidate_matches):
    entity_type = fact.payload["entity_type"]
    attrs = fact.payload["attributes"]

    if entity_type == "Phone":
        existing = _find_existing_by_key(case_id, "Phone", "number", attrs["number"])
        if existing:
            phone_to_entity_id[attrs["number"]] = existing["entity_id"]
            return None  # dedup — no new entity/evidence needed
        entity_id = _new_entity_id()
        entity = _base_entity(entity_id, "Phone", case_id, attrs, status="confirmed", confidence=1.0)
        graph_store.upsert_entity(entity)
        phone_to_entity_id[attrs["number"]] = entity_id
        return entity

    if entity_type == "Vehicle":
        existing = _find_existing_by_key(case_id, "Vehicle", "plate", attrs["plate"])
        if existing:
            return None
        entity_id = _new_entity_id()
        entity = _base_entity(entity_id, "Vehicle", case_id, attrs, status="confirmed", confidence=1.0)
        graph_store.upsert_entity(entity)
        return entity

    if entity_type == "Person":
        existing = _find_person_by_name(case_id, attrs["name"])
        if existing:
            name_to_entity_id[attrs["name"]] = existing["entity_id"]
            return None

        # Check fuzzy candidates against all existing persons in the case
        best_match = None
        for other in graph_store.all_entities(case_id):
            if other.get("entity_type") != "Person":
                continue
            result = score_person_match(attrs, other.get("attributes", {}))
            if result and (best_match is None or result.confidence > best_match.confidence):
                best_match = result

        entity_id = _new_entity_id()
        status = "candidate" if best_match else "confirmed"
        entity = _base_entity(entity_id, "Person", case_id, attrs, status=status, confidence=fact.confidence)
        graph_store.upsert_entity(entity)
        name_to_entity_id[attrs["name"]] = entity_id

        if best_match:
            best_match.entity_a = entity_id
            candidate_matches.append(best_match.__dict__)

        return entity

    return None


def _base_entity(entity_id, entity_type, case_id, attrs, status, confidence):
    now = datetime.now(timezone.utc).isoformat()
    return {
        "entity_id": entity_id,
        "entity_type": entity_type,
        "case_id": case_id,
        "attributes": attrs,
        "confidence": confidence,
        "status": status,
        "created_at": now,
        "updated_at": now,
    }
