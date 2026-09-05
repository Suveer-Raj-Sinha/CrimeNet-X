from typing import List, Dict, Tuple
from app.sih_core.schema import Entity, Relationship, EvidencePointer, SourceType, EntityType, RelationshipType
from app.store.graph_store import graph_store

def sih_entity_to_graph_dict(ent: Entity) -> dict:
    return {
        "entity_id": ent.id,
        "entity_type": ent.type.value,
        "name": ent.name,
        "attributes": ent.attributes,
        "aliases": ent.aliases,
        "confidence": ent.extraction_confidence,
        "evidence_citations": ent.evidence_citations
    }

def graph_dict_to_sih_entity(d: dict) -> Entity:
    return Entity(
        id=d.get("entity_id", d.get("id")),
        name=d.get("name", d.get("label", "Unknown")),
        type=EntityType(d.get("entity_type", "PERSON")),
        attributes=d.get("attributes", d.get("metadata", {})),
        aliases=d.get("aliases", []),
        extraction_confidence=d.get("confidence", 0.95),
        evidence_citations=d.get("evidence_citations", [])
    )

def sih_rel_to_graph_dict(rel: Relationship) -> dict:
    return {
        "relationship_id": rel.id,
        "from_entity": rel.source_entity_id,
        "to_entity": rel.target_entity_id,
        "type": rel.type.value,
        "attributes": rel.attributes,
        "confidence": rel.relationship_confidence,
        "is_directly_observed": rel.is_directly_observed,
        "evidence_citations": rel.evidence_citations
    }

def graph_dict_to_sih_rel(d: dict) -> Relationship:
    return Relationship(
        id=d.get("relationship_id", d.get("id", "R-UNK")),
        source_entity_id=d.get("from_entity", d.get("source")),
        target_entity_id=d.get("to_entity", d.get("target")),
        type=RelationshipType(d.get("type", "ASSOCIATED_WITH")),
        attributes=d.get("attributes", {}),
        relationship_confidence=d.get("confidence", 0.95),
        is_directly_observed=d.get("is_directly_observed", True),
        evidence_citations=d.get("evidence_citations", [])
    )

def load_all_case_data(case_id: str = "CASE-2026-001") -> Tuple[List[Entity], List[Relationship]]:
    raw_ents = graph_store.all_entities(case_id)
    raw_rels = graph_store.all_relationships(case_id)
    
    entities = [graph_dict_to_sih_entity(e) for e in raw_ents]
    relationships = [graph_dict_to_sih_rel(r) for r in raw_rels]
    
    return entities, relationships

def save_case_data(case_id: str, entities: List[Entity], relationships: List[Relationship]):
    for e in entities:
        d = sih_entity_to_graph_dict(e)
        d["case_id"] = case_id
        graph_store.upsert_entity(d)
        
    for r in relationships:
        d = sih_rel_to_graph_dict(r)
        d["case_id"] = case_id
        graph_store.upsert_relationship(d)
