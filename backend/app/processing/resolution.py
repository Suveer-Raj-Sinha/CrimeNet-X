"""
Entity resolution: decide whether a newly-extracted entity is the same as an
existing one, using explainable, weighted signals — never a black-box model.

For the MVP demo, string similarity uses stdlib `difflib` (SequenceMatcher).
In production, swap in `rapidfuzz` for speed/quality on large entity sets —
only this module needs to change.

Policy (see architecture doc section 10):
  >= AUTO_LINK_THRESHOLD  -> still returned as "review" in this MVP
                             (auto-link is disabled by default, per the
                             human-in-the-loop principle)
  >= REVIEW_THRESHOLD     -> candidate match, investigator review required
  <  REVIEW_THRESHOLD     -> kept separate
"""
from dataclasses import dataclass
from difflib import SequenceMatcher

AUTO_LINK_THRESHOLD = 0.95
REVIEW_THRESHOLD = 0.6


@dataclass
class MatchResult:
    entity_a: str
    entity_b: str
    confidence: float
    reasons: list[str]
    recommended_action: str  # "review" | "separate"


def name_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()


def score_person_match(candidate_attrs: dict, existing_attrs: dict) -> MatchResult | None:
    reasons = []
    score = 0.0
    weight_total = 0.0

    # Name similarity (always available)
    name_sim = name_similarity(candidate_attrs.get("name", ""), existing_attrs.get("name", ""))
    score += 0.4 * name_sim
    weight_total += 0.4
    if name_sim > 0.8:
        reasons.append(f"name_similarity={name_sim:.2f}")

    # Phone match (strong signal if both known)
    if candidate_attrs.get("phone") and existing_attrs.get("phone"):
        weight_total += 0.35
        if candidate_attrs["phone"] == existing_attrs["phone"]:
            score += 0.35
            reasons.append("same_phone")

    # Vehicle match
    if candidate_attrs.get("vehicle_plate") and existing_attrs.get("vehicle_plate"):
        weight_total += 0.15
        if candidate_attrs["vehicle_plate"] == existing_attrs["vehicle_plate"]:
            score += 0.15
            reasons.append("same_vehicle")

    # Location overlap (very coarse for demo)
    if candidate_attrs.get("location") and existing_attrs.get("location"):
        weight_total += 0.10
        if candidate_attrs["location"] == existing_attrs["location"]:
            score += 0.10
            reasons.append("location_overlap")

    if weight_total == 0:
        return None

    normalized_score = score / weight_total
    if normalized_score < REVIEW_THRESHOLD:
        return None

    return MatchResult(
        entity_a=candidate_attrs.get("entity_id", "NEW"),
        entity_b=existing_attrs.get("entity_id", ""),
        confidence=round(normalized_score, 2),
        reasons=reasons,
        recommended_action="review",  # never "auto_link" in this MVP, by policy
    )
