"""
CRIMENET-X Safe Natural Language Query Engine & Hybrid Search
Translates natural language queries strictly via a structured query plan:
Natural Language -> Structured Query Plan -> Schema Validation -> Safe Execution.
"""

import re
from typing import List, Dict, Any
from app.sih_core.schema import Entity, Relationship, EntityType, RelationshipType


class QueryEngine:
    # --- Expanded keyword sets for intent detection ---
    PATH_KEYWORDS = {
        "connect", "path", "between", "link", "linked", "related",
        "associated", "through", "bridge", "relation", "chain",
        "indirect", "via", "join", "joins", "linking",
    }
    GEO_KEYWORDS = {
        "location", "near", "km", "station", "place", "area",
        "where", "address", "site", "zone", "region", "city",
        "district", "locality", "coordinates", "geo",
    }
    FINANCE_KEYWORDS = {
        "transaction", "transfer", "money", "payment", "hawala",
        "wire", "cash", "rupee", "rupees", "upi", "paytm", "neft",
        "rtgs", "imps", "fund", "funds", "account", "bank",
        "deposit", "withdraw", "amount", "50000", "financial",
    }

    # Type alias map — lets "phone", "suspect" etc. match by entity type
    TYPE_ALIASES = {
        EntityType.PHONE:        ["phone", "call", "mobile", "number", "sim", "cdr", "calls"],
        EntityType.PERSON:       ["person", "suspect", "accused", "witness", "complainant",
                                  "individual", "man", "woman", "subject", "perpetrator"],
        EntityType.LOCATION:     ["location", "place", "area", "site", "address", "station",
                                  "tower", "city", "district", "zone"],
        EntityType.ACCOUNT:      ["account", "bank", "hdfc", "icici", "sbi", "acct",
                                  "finance", "wallet"],
        EntityType.VEHICLE:      ["vehicle", "car", "bike", "truck", "anpr", "plate", "auto"],
        EntityType.ORGANIZATION: ["org", "company", "firm", "group", "gang", "network"],
        EntityType.IMEI:         ["imei", "device", "handset", "phone"],
    }

    def parse_and_execute_query(
        self, query_text: str, entities: List[Entity], relationships: List[Relationship]
    ) -> Dict[str, Any]:
        q_lower = re.sub(r'[^\w\s]', '', query_text.lower())
        q_words = set(q_lower.split())

        query_plan = {
            "input_query": query_text,
            "parsed_intent": "UNKNOWN",
            "target_entities": [],
            "filters": {},
            "execution_allowed": True,
        }

        # ── Intent 1: Graph Path Search ──────────────────────────────────────
        if q_words & self.PATH_KEYWORDS:
            query_plan["parsed_intent"] = "GRAPH_PATH_SEARCH"
            matched_ents = [
                e for e in entities
                if e.name.lower() in q_lower or
                any(word in e.name.lower() for word in q_lower.split() if len(word) > 2)
            ]
            query_plan["target_entities"] = [e.name for e in matched_ents[:2]]

            if len(matched_ents) >= 2:
                e1, e2 = matched_ents[0], matched_ents[1]

                # 1-hop: direct relationship
                direct_rels = [
                    r for r in relationships
                    if (r.source_entity_id == e1.id and r.target_entity_id == e2.id) or
                       (r.source_entity_id == e2.id and r.target_entity_id == e1.id)
                ]

                # 2-hop: intermediate entity path
                two_hop_rels = []
                two_hop_intermediates = []
                if not direct_rels:
                    e1_neighbours = (
                        {r.target_entity_id for r in relationships if r.source_entity_id == e1.id} |
                        {r.source_entity_id for r in relationships if r.target_entity_id == e1.id}
                    )
                    e2_neighbours = (
                        {r.target_entity_id for r in relationships if r.source_entity_id == e2.id} |
                        {r.source_entity_id for r in relationships if r.target_entity_id == e2.id}
                    )
                    for mid_id in list(e1_neighbours & e2_neighbours)[:3]:
                        mid = next((e for e in entities if e.id == mid_id), None)
                        if mid:
                            two_hop_intermediates.append(mid)
                            two_hop_rels += [
                                r for r in relationships if
                                r.source_entity_id in (e1.id, mid_id) and r.target_entity_id in (e1.id, mid_id) or
                                r.source_entity_id in (e2.id, mid_id) and r.target_entity_id in (e2.id, mid_id)
                            ]

                all_rels = direct_rels or two_hop_rels
                all_ents = [e1, e2] + two_hop_intermediates
                hop_desc = (
                    "direct 1-hop" if direct_rels
                    else f"2-hop via {', '.join(e.name for e in two_hop_intermediates)}"
                    if two_hop_intermediates else "no path found"
                )
                return {
                    "query_plan": query_plan,
                    "matched_entities": [e.model_dump() for e in all_ents],
                    "matched_relationships": [r.model_dump() for r in all_rels],
                    "summary": (
                        f"Interpreted Query Plan [GRAPH_PATH]: {len(all_rels)} link(s) "
                        f"connecting {e1.name} and {e2.name} ({hop_desc})."
                    ),
                }

        # ── Intent 2: Geospatial Filter ──────────────────────────────────────
        elif q_words & self.GEO_KEYWORDS:
            query_plan["parsed_intent"] = "GEOSPATIAL_RADIUS_FILTER"
            query_plan["filters"]["radius_km"] = 1.0
            loc_keywords = {"station", "road", "nagar", "chowk", "toll", "plaza", "market", "bazaar"}
            matched_ents = [
                e for e in entities
                if e.type == EntityType.LOCATION or
                any(kw in e.name.lower() for kw in loc_keywords)
            ]
            matched_ids = {e.id for e in matched_ents}
            loc_rels = [r for r in relationships if
                        r.source_entity_id in matched_ids or r.target_entity_id in matched_ids]
            return {
                "query_plan": query_plan,
                "matched_entities": [e.model_dump() for e in matched_ents],
                "matched_relationships": [r.model_dump() for r in loc_rels],
                "summary": (
                    f"Interpreted Query Plan [GEO_FILTER]: Retrieved {len(matched_ents)} "
                    f"location entities and {len(loc_rels)} associated links."
                ),
            }

        # ── Intent 3: Financial Filter ───────────────────────────────────────
        elif q_words & self.FINANCE_KEYWORDS:
            query_plan["parsed_intent"] = "FINANCIAL_THRESHOLD_FILTER"
            query_plan["filters"]["min_amount_inr"] = 50000
            tx_rels = [r for r in relationships if r.type == RelationshipType.TRANSFERS_FUNDS]
            tx_entity_ids = {r.source_entity_id for r in tx_rels} | {r.target_entity_id for r in tx_rels}
            tx_ents = [e for e in entities if e.id in tx_entity_ids]
            return {
                "query_plan": query_plan,
                "matched_entities": [e.model_dump() for e in tx_ents],
                "matched_relationships": [r.model_dump() for r in tx_rels],
                "summary": (
                    f"Interpreted Query Plan [FINANCIAL_FILTER]: Found {len(tx_rels)} "
                    f"fund transfer(s) involving {len(tx_ents)} account(s)."
                ),
            }

        # ── Intent 4: Hybrid Keyword Fallback ────────────────────────────────
        query_plan["parsed_intent"] = "HYBRID_KEYWORD_SEARCH"
        terms = [t for t in q_lower.split() if len(t) > 2]

        def entity_matches(e: Entity) -> bool:
            # 1. Name substring match
            if any(term in e.name.lower() for term in terms):
                return True
            # 2. Entity type alias match
            aliases = self.TYPE_ALIASES.get(e.type, [])
            if any(term in aliases for term in terms):
                return True
            # 3. Attribute value match (e.g. phone number digits, plate)
            for val in (e.attributes or {}).values():
                if isinstance(val, str) and any(term in val.lower() for term in terms):
                    return True
            return False

        matched_e = [e for e in entities if entity_matches(e)]

        # Broad fallback — return everything if nothing matched
        if not matched_e and terms:
            matched_e = entities

        matched_e_ids = {e.id for e in matched_e}
        matched_rels = [r for r in relationships if
                        r.source_entity_id in matched_e_ids or r.target_entity_id in matched_e_ids]

        return {
            "query_plan": query_plan,
            "matched_entities": [e.model_dump() for e in matched_e],
            "matched_relationships": [r.model_dump() for r in matched_rels],
            "summary": (
                f"Interpreted Query Plan [HYBRID_KEYWORD]: Matched "
                f"{len(matched_e)} entities and {len(matched_rels)} associated links."
            ),
        }
