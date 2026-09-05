"""
CRIMENET-X Conservative Multi-Attribute Entity Resolution Engine
Classifies resolution pairs into:
- STRONG MATCH (>= 0.85)
- POSSIBLE MATCH (0.50 - 0.84) -> Requires investigator manual review/approval
- NO MATCH (< 0.50)
"""

import uuid
from typing import List
from app.sih_core.schema import Entity, ResolutionCandidate, MatchClassification, EntityType


class EntityResolver:
    def __init__(self, strong_threshold: float = 0.85, possible_threshold: float = 0.50):
        self.strong_threshold = strong_threshold
        self.possible_threshold = possible_threshold

    @staticmethod
    def lev_distance(s1: str, s2: str) -> int:
        if len(s1) > len(s2):
            s1, s2 = s2, s1
        distances = range(len(s1) + 1)
        for i2, c2 in enumerate(s2):
            distances_ = [i2 + 1]
            for i1, c1 in enumerate(s1):
                if c1 == c2:
                    distances_.append(distances[i1])
                else:
                    distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
            distances = distances_
        return distances[-1]

    def calculate_name_similarity(self, name1: str, name2: str) -> float:
        n1, n2 = name1.lower().strip(), name2.lower().strip()
        if n1 == n2:
            return 1.0

        # Check initial matching
        parts1 = n1.replace('.', '').split()
        parts2 = n2.replace('.', '').split()
        if len(parts1) >= 2 and len(parts2) >= 2:
            surname_match = (parts1[-1] == parts2[-1])
            initial_match = (parts1[0][0] == parts2[0][0])
            if surname_match and initial_match:
                return 0.85

        d = self.lev_distance(n1, n2)
        max_len = max(len(n1), len(n2))
        if max_len == 0:
            return 1.0
        return 1.0 - (d / max_len)

    def find_resolution_candidates(self, entities: List[Entity]) -> List[ResolutionCandidate]:
        candidates = []
        persons = [e for e in entities if e.type == EntityType.PERSON]

        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                p1 = persons[i]
                p2 = persons[j]

                matched_features = []
                scores = []

                # 1. Name & Initial similarity
                name_sim = self.calculate_name_similarity(p1.name, p2.name)
                if name_sim > 0.4:
                    matched_features.append(f"Name / Alias Pattern Similarity ({int(name_sim*100)}%)")
                    scores.append(name_sim * 0.45)

                # 2. Shared phone check
                p1_phones = set(p1.attributes.get("phones", []))
                p2_phones = set(p2.attributes.get("phones", []))
                if p1_phones and p2_phones and (p1_phones & p2_phones):
                    matched_features.append("Direct Shared Phone Number Match")
                    scores.append(0.35)

                # 3. Citation overlap — only award a boost if they appear in real documents
                citation_overlap = set(p1.evidence_citations) & set(p2.evidence_citations)
                all_citations = set(p1.evidence_citations) | set(p2.evidence_citations)
                if len(citation_overlap) >= 1 and len(all_citations) >= 2:
                    # They appear in multiple different sources — strong cross-document signal
                    matched_features.append(f"Cross-Document Co-occurrence ({len(citation_overlap)} shared source(s))")
                    scores.append(0.20)
                elif len(citation_overlap) >= 1:
                    # Same single document — weaker signal
                    matched_features.append(f"Same-Document Co-occurrence ({len(citation_overlap)} shared document(s))")
                    scores.append(0.10)
                # No shared documents → no score added (no fabricated signal)

                total_score = min(sum(scores), 0.99)

                # Classify match conservatively
                if total_score >= self.strong_threshold:
                    classification = MatchClassification.STRONG_MATCH
                elif total_score >= self.possible_threshold:
                    classification = MatchClassification.POSSIBLE_MATCH
                else:
                    classification = MatchClassification.NO_MATCH

                if classification != MatchClassification.NO_MATCH:
                    cand_id = f"CAND-{uuid.uuid4().hex[:6].upper()}"
                    candidates.append(ResolutionCandidate(
                        candidate_id=cand_id,
                        entity_a_id=p1.id,
                        entity_a_name=p1.name,
                        entity_b_id=p2.id,
                        entity_b_name=p2.name,
                        classification=classification,
                        entity_resolution_confidence=round(total_score, 2),
                        matched_features=matched_features,
                        status="PENDING_REVIEW"
                    ))

        return candidates
