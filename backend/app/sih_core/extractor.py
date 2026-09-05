"""
CRIMENET-X Extractor Engine
Extracts Entities, Relationships, and EvidencePointers from Canonical Evidence Objects.
Supports unstructured text (regex + pattern matching for NER) and structured CSV fields.
Supports full names (e.g. Rahul Sharma, Amit Kumar) and initials (e.g. R. Sharma).
"""

import re
import uuid
from typing import List, Tuple, Dict, Any
from app.sih_core.schema import (
    CanonicalEvidenceObject, Entity, Relationship, EntityType,
    RelationshipType, EvidencePointer, SourceType
)
from normalizer import Normalizer


class ExtractorEngine:
    # All major Indian cities for location extraction
    INDIAN_CITIES = {
        "Jaipur", "Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Ahmedabad",
        "Chennai", "Kolkata", "Surat", "Pune", "Lucknow", "Kanpur", "Nagpur",
        "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri", "Patna",
        "Vadodara", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut",
        "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar",
        "Allahabad", "Howrah", "Ranchi", "Coimbatore", "Jodhpur", "Kota",
        "Ajmer", "Udaipur", "Chandigarh", "Guwahati", "Bhubaneswar", "Thiruvananthapuram",
    }

    def __init__(self):
        self.normalizer = Normalizer()
        # False-positive person name phrases — vehicle brands, legal terms, place descriptors
        self.stopwords = {
            # Vehicle brands / models
            "Hyundai Creta", "White Hyundai", "Maruti Swift", "Honda City",
            "Toyota Innova", "Tata Nexon", "Mahindra Scorpio", "Bajaj Pulsar",
            # Legal / report terms
            "First Information", "Information Report", "Station House", "Case Diary",
            "Charge Sheet", "Magistrate Court", "Sessions Court", "District Court",
            # Location descriptors
            "Railway Station", "Police Station", "Toll Plaza", "Toll Gate",
            "Jaipur Railway", "Jaipur Central", "Station North", "Station Road",
            "Ajmer Highway", "Sector Road", "Main Market", "Bus Stand",
            "Civil Lines", "Sector Road", "North Gate", "South Gate",
            # Bank names
            "Hdfc Bank", "Icici Bank", "Axis Bank", "State Bank", "Punjab National",
            "Bank Acct", "Bank Account",
            # Common report phrases that look like names
            "Sub Inspector", "Head Constable", "Assistant Commissioner",
            "Inspector General", "Deputy Superintendent",
        }

    def extract_from_evidence(self, evidence: CanonicalEvidenceObject) -> Tuple[List[Entity], List[Relationship]]:
        entities: Dict[str, Entity] = {}
        relationships: List[Relationship] = []

        raw_payload = evidence.raw_payload

        # 1. Phone extraction
        phone_matches = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{9}', raw_payload)
        for ph in set(phone_matches):
            norm_ph = self.normalizer.normalize_phone(ph)
            ent_id = f"ENT-PH-{hash(norm_ph) % 10000000}"
            if ent_id not in entities:
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"Extracted phone {norm_ph}"
                )
                entities[ent_id] = Entity(
                    id=ent_id,
                    name=norm_ph,
                    type=EntityType.PHONE,
                    extraction_confidence=0.98,
                    evidence_citations=[evidence.evidence_id],
                    attributes={"raw_phone": ph},
                    pointers=[ptr]
                )

        # 2. Vehicle extraction
        vehicle_matches = re.findall(r'\b[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}\b', raw_payload.upper())
        for veh in set(vehicle_matches):
            norm_veh = self.normalizer.normalize_vehicle(veh)
            ent_id = f"ENT-VEH-{norm_veh}"
            if ent_id not in entities:
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"Extracted vehicle plate {norm_veh}"
                )
                entities[ent_id] = Entity(
                    id=ent_id,
                    name=norm_veh,
                    type=EntityType.VEHICLE,
                    extraction_confidence=0.95,
                    evidence_citations=[evidence.evidence_id],
                    attributes={"plate": norm_veh},
                    pointers=[ptr]
                )

        # 3. Location extraction
        loc_patterns = [
            r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s(?:Railway Station|Airport|Toll Plaza|Chowk|Nagar|Road|Sector\s\d+|Police Station|Bus Stand|Civil Lines))',
        ]
        city_pattern = r'\b(' + '|'.join(sorted(self.INDIAN_CITIES, key=len, reverse=True)) + r')\b'
        loc_patterns.append(city_pattern)
        found_locations = set()
        for pat in loc_patterns:
            for match in re.findall(pat, raw_payload):
                found_locations.add(match)

        for loc in found_locations:
            ent_id = f"ENT-LOC-{hash(loc) % 10000000}"
            if ent_id not in entities:
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"Extracted location {loc}"
                )
                entities[ent_id] = Entity(
                    id=ent_id,
                    name=loc,
                    type=EntityType.LOCATION,
                    extraction_confidence=0.90,
                    evidence_citations=[evidence.evidence_id],
                    pointers=[ptr]
                )

        # 4. Person Extraction (Full names & Initials like R. Sharma)
        person_candidates = set()
        full_names = re.findall(r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b', raw_payload)
        initial_names = re.findall(r'\b[A-Z]\.\s*[A-Z][a-z]+\b', raw_payload)

        for name in full_names + initial_names:
            if name not in self.stopwords and not any(loc in name for loc in ["Station", "Toll", "Plaza", "Bank", "Report", "Creta"]):
                person_candidates.add(name)

        for person_name in person_candidates:
            norm_name = self.normalizer.normalize_name(person_name)
            ent_id = f"ENT-PER-{hash(norm_name) % 10000000}"
            if ent_id not in entities:
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"Extracted person name {norm_name}"
                )
                entities[ent_id] = Entity(
                    id=ent_id,
                    name=norm_name,
                    type=EntityType.PERSON,
                    extraction_confidence=0.92,
                    evidence_citations=[evidence.evidence_id],
                    pointers=[ptr]
                )

        # 5. IMEI Extraction
        imei_matches = re.findall(r'\b\d{15}\b', raw_payload)
        for imei in set(imei_matches):
            ent_id = f"ENT-IMEI-{imei}"
            if ent_id not in entities:
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"Extracted IMEI {imei}"
                )
                entities[ent_id] = Entity(
                    id=ent_id,
                    name=f"IMEI: {imei}",
                    type=EntityType.IMEI,
                    extraction_confidence=0.99,
                    evidence_citations=[evidence.evidence_id],
                    attributes={"imei": imei},
                    pointers=[ptr]
                )

        # 6. Structured CDR parsing
        if evidence.source_type == SourceType.CDR:
            lines = raw_payload.splitlines()
            header = lines[0].lower() if lines else ""
            if "caller" in header or "calling" in header or "caller_number" in header:
                for idx, line in enumerate(lines[1:], start=2):
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 3:
                        caller, receiver, timestamp = parts[0], parts[1], parts[2]
                        duration = parts[3] if len(parts) > 3 else "60"
                        tower = parts[4] if len(parts) > 4 else "Unknown Tower"

                        c_norm = self.normalizer.normalize_phone(caller)
                        r_norm = self.normalizer.normalize_phone(receiver)

                        c_id = f"ENT-PH-{hash(c_norm) % 10000000}"
                        r_id = f"ENT-PH-{hash(r_norm) % 10000000}"

                        if c_id not in entities:
                            entities[c_id] = Entity(id=c_id, name=c_norm, type=EntityType.PHONE, evidence_citations=[evidence.evidence_id])
                        if r_id not in entities:
                            entities[r_id] = Entity(id=r_id, name=r_norm, type=EntityType.PHONE, evidence_citations=[evidence.evidence_id])

                        rel_id = f"REL-CALL-{uuid.uuid4().hex[:6]}"
                        ptr = EvidencePointer(
                            source_file=evidence.source_file,
                            source_type=evidence.source_type,
                            csv_row=idx,
                            raw_snippet=f"CDR call from {c_norm} to {r_norm} at {timestamp}"
                        )
                        relationships.append(Relationship(
                            id=rel_id,
                            source_entity_id=c_id,
                            target_entity_id=r_id,
                            type=RelationshipType.CALLS,
                            attributes={"timestamp": timestamp, "duration_sec": duration, "tower_location": tower},
                            relationship_confidence=0.99,
                            is_directly_observed=True,
                            evidence_citations=[evidence.evidence_id],
                            pointer=ptr
                        ))

        # 7. Structured Financial parsing
        elif evidence.source_type == SourceType.FINANCIAL_TRANSACTIONS:
            lines = raw_payload.splitlines()
            for idx, line in enumerate(lines[1:], start=2):
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 4:
                    sender, receiver, amount, timestamp = parts[0], parts[1], parts[2], parts[3]
                    s_id = f"ENT-ACC-{hash(sender) % 10000000}"
                    r_id = f"ENT-ACC-{hash(receiver) % 10000000}"

                    if s_id not in entities:
                        entities[s_id] = Entity(id=s_id, name=sender, type=EntityType.ACCOUNT, evidence_citations=[evidence.evidence_id])
                    if r_id not in entities:
                        entities[r_id] = Entity(id=r_id, name=receiver, type=EntityType.ACCOUNT, evidence_citations=[evidence.evidence_id])

                    rel_id = f"REL-TX-{uuid.uuid4().hex[:6]}"
                    ptr = EvidencePointer(
                        source_file=evidence.source_file,
                        source_type=evidence.source_type,
                        csv_row=idx,
                        raw_snippet=f"Fund transfer ₹{amount} from {sender} to {receiver} at {timestamp}"
                    )
                    relationships.append(Relationship(
                        id=rel_id,
                        source_entity_id=s_id,
                        target_entity_id=r_id,
                        type=RelationshipType.TRANSFERS_FUNDS,
                        attributes={"amount_inr": amount, "timestamp": timestamp},
                        relationship_confidence=0.99,
                        is_directly_observed=True,
                        evidence_citations=[evidence.evidence_id],
                        pointer=ptr
                    ))

        # 8. ANPR / CCTV camera sightings parsing
        elif evidence.source_type == SourceType.CCTV_ANPR:
            lines = raw_payload.splitlines()
            for idx, line in enumerate(lines[1:], start=2):
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 3:
                    plate, camera_loc, timestamp = parts[0], parts[1], parts[2]
                    norm_plate = self.normalizer.normalize_vehicle(plate)
                    v_id = f"ENT-VEH-{norm_plate}"
                    l_id = f"ENT-LOC-{hash(camera_loc) % 10000000}"

                    if v_id not in entities:
                        entities[v_id] = Entity(id=v_id, name=norm_plate, type=EntityType.VEHICLE, evidence_citations=[evidence.evidence_id])
                    if l_id not in entities:
                        entities[l_id] = Entity(id=l_id, name=camera_loc, type=EntityType.LOCATION, evidence_citations=[evidence.evidence_id])

                    rel_id = f"REL-ANPR-{uuid.uuid4().hex[:6]}"
                    ptr = EvidencePointer(
                        source_file=evidence.source_file,
                        source_type=evidence.source_type,
                        camera_id=f"CAM-{hash(camera_loc)%100}",
                        csv_row=idx,
                        raw_snippet=f"ANPR vehicle sighting {norm_plate} at {camera_loc} at {timestamp}"
                    )
                    relationships.append(Relationship(
                        id=rel_id,
                        source_entity_id=v_id,
                        target_entity_id=l_id,
                        type=RelationshipType.SIGHTED_AT,
                        attributes={"timestamp": timestamp},
                        relationship_confidence=0.97,
                        is_directly_observed=True,
                        evidence_citations=[evidence.evidence_id],
                        pointer=ptr
                    ))

        # Connect Person entities to their devices/vehicles/locations
        person_list = [e for e in entities.values() if e.type == EntityType.PERSON]
        phone_list = [e for e in entities.values() if e.type == EntityType.PHONE]
        vehicle_list = [e for e in entities.values() if e.type == EntityType.VEHICLE]
        location_list = [e for e in entities.values() if e.type == EntityType.LOCATION]

        for p in person_list:
            for ph in phone_list:
                rel_id = f"REL-USES-{p.id}-{ph.id}"
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"{p.name} associated with phone number {ph.name}"
                )
                relationships.append(Relationship(
                    id=rel_id,
                    source_entity_id=p.id,
                    target_entity_id=ph.id,
                    type=RelationshipType.USES_DEVICE,
                    relationship_confidence=0.88,
                    is_directly_observed=False,
                    evidence_citations=[evidence.evidence_id],
                    pointer=ptr
                ))

            for v in vehicle_list:
                rel_id = f"REL-OWNED-{p.id}-{v.id}"
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"{p.name} associated with vehicle {v.name}"
                )
                relationships.append(Relationship(
                    id=rel_id,
                    source_entity_id=p.id,
                    target_entity_id=v.id,
                    type=RelationshipType.OWNED_BY,
                    relationship_confidence=0.85,
                    is_directly_observed=False,
                    evidence_citations=[evidence.evidence_id],
                    pointer=ptr
                ))

            for loc in location_list:
                rel_id = f"REL-LOC-{p.id}-{loc.id}"
                ptr = EvidencePointer(
                    source_file=evidence.source_file,
                    source_type=evidence.source_type,
                    raw_snippet=f"{p.name} documented near {loc.name}"
                )
                relationships.append(Relationship(
                    id=rel_id,
                    source_entity_id=p.id,
                    target_entity_id=loc.id,
                    type=RelationshipType.LOCATED_AT,
                    relationship_confidence=0.82,
                    is_directly_observed=False,
                    evidence_citations=[evidence.evidence_id],
                    pointer=ptr
                ))

        return list(entities.values()), relationships
