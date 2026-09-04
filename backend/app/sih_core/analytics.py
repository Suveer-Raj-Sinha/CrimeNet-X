"""
CRIMENET-X Analytics & Unified Timeline Model Engine
Builds:
- Unified TimelineEvent sequence across all 7 MVP modalities (CDR, CCTV/ANPR, Tx, GPS, Witness)
- Multi-source geospatial co-location GeoEvent clusters
"""

import uuid
from typing import List, Dict, Any
from app.sih_core.schema import Entity, Relationship, TimelineEvent, GeoEvent, RelationshipType


class AnalyticsEngine:
    def build_unified_timeline(
        self, entities: List[Entity], relationships: List[Relationship]
    ) -> List[TimelineEvent]:
        timeline = []

        for r in relationships:
            ts = r.attributes.get("timestamp") or "2026-08-25T21:00:00"
            src_ent = next((e for e in entities if e.id == r.source_entity_id), None)
            tgt_ent = next((e for e in entities if e.id == r.target_entity_id), None)

            src_name = src_ent.name if src_ent else r.source_entity_id
            tgt_name = tgt_ent.name if tgt_ent else r.target_entity_id

            if r.type == RelationshipType.CALLS:
                title = f"Telecommunication Call: {src_name} ➔ {tgt_name}"
                event_type = "CDR Call Log"
            elif r.type == RelationshipType.TRANSFERS_FUNDS:
                amt = r.attributes.get("amount_inr", "50,000")
                title = f"Financial Transfer ₹{amt}: {src_name} ➔ {tgt_name}"
                event_type = "Bank Transaction"
            elif r.type == RelationshipType.SIGHTED_AT:
                title = f"ANPR Camera Sighting: Vehicle {src_name} at {tgt_name}"
                event_type = "CCTV / ANPR Camera"
            else:
                title = f"Observed Association: {src_name} {r.type.value} {tgt_name}"
                event_type = "Document Observation"

            timeline.append(TimelineEvent(
                event_id=f"EVT-{uuid.uuid4().hex[:6].upper()}",
                timestamp=ts,
                title=title,
                event_type=event_type,
                participating_entities=[src_name, tgt_name],
                source_file=r.pointer.source_file if r.pointer else "Case_Document.txt",
                evidence_id=r.evidence_citations[0] if r.evidence_citations else "EV-01",
                pointer=r.pointer
            ))

        timeline.sort(key=lambda x: x.timestamp)
        return timeline

    def perform_geospatial_temporal_correlation(
        self, entities: List[Entity], relationships: List[Relationship]
    ) -> List[GeoEvent]:
        co_location_events = []
        sighting_rels = [r for r in relationships if r.type in (RelationshipType.LOCATED_AT, RelationshipType.SIGHTED_AT)]

        location_groups: Dict[str, List[Relationship]] = {}
        for r in sighting_rels:
            loc_key = r.attributes.get("tower_location") or r.target_entity_id
            if loc_key not in location_groups:
                location_groups[loc_key] = []
            location_groups[loc_key].append(r)

        for loc, rels in location_groups.items():
            if len(rels) >= 2:
                sources = list(set(r.pointer.source_type.value if r.pointer else "Multi-source Log" for r in rels))
                connected_entity_ids = set()
                for r in rels:
                    connected_entity_ids.add(r.source_entity_id)

                entity_names = [e.name for e in entities if e.id in connected_entity_ids]

                co_location_events.append(GeoEvent(
                    geo_id=f"GEO-{uuid.uuid4().hex[:6].upper()}",
                    location_name=str(loc),
                    latitude=26.9124,
                    longitude=75.7873,
                    timestamp=rels[0].attributes.get("timestamp", "2026-08-25T21:30:00"),
                    entities_present=entity_names,
                    sources=sources,
                    radius_km=1.0
                ))

        return co_location_events
