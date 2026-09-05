"""
Analytics + alert-rule engine (MVP scope: network + a basic temporal burst
rule). Every output is a structured Finding, never a bare score, and never a
guilt/criminality label — see architecture doc sections 11-12.
"""
from collections import Counter, defaultdict
from datetime import datetime

from app.store import db
from app.store.graph_store import graph_store


def network_analysis(case_id: str) -> dict:
    degree = graph_store.degree_centrality(case_id)
    betweenness = graph_store.betweenness_centrality(case_id)
    communities = graph_store.communities(case_id)

    entities = {e["entity_id"]: e for e in graph_store.all_entities(case_id)}

    def label(entity_id):
        e = entities.get(entity_id, {})
        return e.get("attributes", {}).get("name") or e.get("attributes", {}).get("number") or entity_id

    top_degree = sorted(degree.items(), key=lambda kv: kv[1], reverse=True)[:10]
    top_betweenness = sorted(betweenness.items(), key=lambda kv: kv[1], reverse=True)[:10]

    return {
        "case_id": case_id,
        "top_degree_centrality": [{"entity_id": k, "label": label(k), "score": round(v, 3)} for k, v in top_degree],
        "top_betweenness_centrality": [{"entity_id": k, "label": label(k), "score": round(v, 3)} for k, v in top_betweenness],
        "communities": [
            {"community_id": i, "members": [{"entity_id": m, "label": label(m)} for m in members]}
            for i, members in enumerate(communities)
        ],
    }


def temporal_burst_analysis(case_id: str, baseline_calls_per_day: float = 3.0, burst_multiplier: float = 4.0) -> list[dict]:
    """
    Very simple, explainable burst detector for the MVP: count CALLS
    relationships per ordered (from, to) phone pair per day; flag pairs whose
    max daily count exceeds baseline * multiplier. Real deployments would use
    a per-entity historical baseline rather than a single global constant.
    """
    rels = [r for r in graph_store.all_relationships(case_id) if r.get("type") == "CALLS"]
    counts_by_pair_day = defaultdict(Counter)

    for r in rels:
        ts = r.get("timestamp")
        if not ts:
            continue
        try:
            day = datetime.fromisoformat(ts.replace("Z", "+00:00")).date().isoformat()
        except ValueError:
            continue
        pair = tuple(sorted([r["from_entity"], r["to_entity"]]))
        counts_by_pair_day[pair][day] += 1

    findings = []
    for pair, day_counts in counts_by_pair_day.items():
        max_day, max_count = max(day_counts.items(), key=lambda kv: kv[1])
        threshold = baseline_calls_per_day * burst_multiplier
        if max_count >= threshold:
            findings.append({
                "type": "communication_burst",
                "entities": list(pair),
                "day": max_day,
                "call_count": max_count,
                "baseline": baseline_calls_per_day,
                "threshold": threshold,
                "confidence": min(0.95, 0.5 + (max_count - threshold) / (threshold * 4)),
            })
    return findings


def run_alert_rules(case_id: str) -> list[dict]:
    """Evaluates rule-based alerts and persists them via the alert store."""
    alerts_created = []

    for finding in temporal_burst_analysis(case_id):
        alert = db.create_alert(
            case_id=case_id,
            alert_type="communication",
            priority="medium" if finding["confidence"] < 0.8 else "high",
            detected=f"Communication burst: {finding['call_count']} calls on {finding['day']} "
                     f"(baseline ~{finding['baseline']}/day)",
            why_detected=f"Rule COMM-BURST-01 triggered: daily call count {finding['call_count']} "
                         f">= threshold {finding['threshold']}",
            entities=finding["entities"],
            relationships=[],
            evidence=[],
            confidence=round(finding["confidence"], 2),
        )
        alerts_created.append(alert)

    return alerts_created


