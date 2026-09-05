"""
CRIMENET-X Standardized JSON & XML Converter Engine
Converts evidence, extracted entities, relationships, provenance chains,
and relevance scores into structured CCTNS/NCRB compliant JSON and XML formats.
"""

import json
import xml.etree.ElementTree as ET
from xml.dom import minidom
from typing import List, Dict, Any
from app.sih_core.schema import Entity, Relationship, CanonicalEvidenceObject, ResolutionCandidate


class ConverterEngine:
    @staticmethod
    def export_to_json(
        entities: List[Entity],
        relationships: List[Relationship],
        evidence_list: List[CanonicalEvidenceObject],
        candidates: List[ResolutionCandidate]
    ) -> str:
        data = {
            "system": "CRIMENET-X Intelligence Pipeline",
            "compliance": "SIH-2026189 / CCTNS Interoperable Intelligence Format",
            "summary": {
                "total_entities": len(entities),
                "total_relationships": len(relationships),
                "total_evidence_sources": len(evidence_list),
                "resolution_candidates_count": len(candidates)
            },
            "evidence_sources": [ev.model_dump() for ev in evidence_list],
            "entities": [e.model_dump() for e in entities],
            "relationships": [r.model_dump() for r in relationships],
            "entity_resolution_candidates": [c.model_dump() for c in candidates]
        }
        return json.dumps(data, indent=2)

    @staticmethod
    def export_to_xml(
        entities: List[Entity],
        relationships: List[Relationship],
        evidence_list: List[CanonicalEvidenceObject]
    ) -> str:
        root = ET.Element("CrimenetXCaseIntelligence")
        root.set("system", "CRIMENET-X")
        root.set("compliance", "CCTNS/NCRB 2026")

        # 1. Evidence Sources Node
        sources_elem = ET.SubElement(root, "EvidenceSources")
        for ev in evidence_list:
            ev_elem = ET.SubElement(sources_elem, "EvidenceSource")
            ET.SubElement(ev_elem, "EvidenceID").text = str(ev.evidence_id)
            ET.SubElement(ev_elem, "SourceType").text = str(ev.source_type.value if hasattr(ev.source_type, 'value') else ev.source_type)
            ET.SubElement(ev_elem, "FileName").text = str(ev.source_file)
            ET.SubElement(ev_elem, "FileHash").text = str(ev.file_hash_sha256 or "")
            ET.SubElement(ev_elem, "SourceReliability").text = str(ev.source_reliability)

        # 2. Entities Node
        entities_elem = ET.SubElement(root, "Entities")
        for e in entities:
            ent_elem = ET.SubElement(entities_elem, "Entity")
            ET.SubElement(ent_elem, "ID").text = str(e.id)
            ET.SubElement(ent_elem, "Name").text = str(e.name)
            ET.SubElement(ent_elem, "Type").text = str(e.type.value if hasattr(e.type, 'value') else e.type)
            ET.SubElement(ent_elem, "Confidence").text = str(e.extraction_confidence)
            
            cites_elem = ET.SubElement(ent_elem, "Citations")
            for cit in e.evidence_citations:
                ET.SubElement(cites_elem, "EvidenceID").text = str(cit)

        # 3. Relationships Node
        rels_elem = ET.SubElement(root, "Relationships")
        for r in relationships:
            rel_elem = ET.SubElement(rels_elem, "Relationship")
            ET.SubElement(rel_elem, "ID").text = str(r.id)
            ET.SubElement(rel_elem, "SourceEntityID").text = str(r.source_entity_id)
            ET.SubElement(rel_elem, "TargetEntityID").text = str(r.target_entity_id)
            ET.SubElement(rel_elem, "Type").text = str(r.type.value if hasattr(r.type, 'value') else r.type)
            ET.SubElement(rel_elem, "Confidence").text = str(r.relationship_confidence)
            if r.pointer:
                prov_elem = ET.SubElement(rel_elem, "Pointer")
                ET.SubElement(prov_elem, "Snippet").text = str(r.pointer.raw_snippet)

        raw_str = ET.tostring(root, encoding='utf-8')
        parsed = minidom.parseString(raw_str)
        return parsed.toprettyxml(indent="  ")
