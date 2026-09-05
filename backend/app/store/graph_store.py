"""
GraphStore: a single interface for knowledge-graph reads/writes.

Two implementations:
- NetworkXGraphStore: in-memory, zero-dependency, used by default so the
  system runs as a demo with synthetic data (GRAPH_BACKEND="memory").
- Neo4jGraphStore: thin wrapper over the official `neo4j` driver, activated
  with GRAPH_BACKEND="neo4j". Cypher lives here only — no other module
  should import the neo4j driver directly.

Every entity/relationship/event carries the same provenance fields
regardless of backend (case_id, confidence, status, evidence_id,
source_id, observed_or_inferred, timestamp where applicable).
"""
from __future__ import annotations

from typing import Optional

import networkx as nx

from app.core.config import settings


class BaseGraphStore:
    def upsert_entity(self, entity: dict): ...
    def get_entity(self, entity_id: str) -> Optional[dict]: ...
    def upsert_relationship(self, rel: dict): ...
    def upsert_event(self, event: dict): ...
    def case_graph(self, case_id: str, min_confidence: float = 0.0) -> dict: ...
    def entity_neighborhood(self, entity_id: str, hops: int = 1) -> dict: ...
    def find_path(self, from_id: str, to_id: str) -> Optional[list]: ...
    def all_entities(self, case_id: str) -> list[dict]: ...
    def all_relationships(self, case_id: str) -> list[dict]: ...


class NetworkXGraphStore(BaseGraphStore):
    """Demo/dev graph store backed by an in-memory NetworkX MultiDiGraph."""

    def __init__(self):
        self.g = nx.MultiDiGraph()

    def upsert_entity(self, entity: dict):
        self.g.add_node(entity["entity_id"], **entity)

    def get_entity(self, entity_id: str) -> Optional[dict]:
        if entity_id not in self.g.nodes:
            return None
        return dict(self.g.nodes[entity_id])

    def upsert_relationship(self, rel: dict):
        self.g.add_edge(
            rel["from_entity"], rel["to_entity"], key=rel["relationship_id"], **rel
        )

    def upsert_event(self, event: dict):
        # Represent events as nodes of entity_type "Event" linked via INVOLVES
        node = {**event, "entity_id": event["event_id"], "entity_type": "Event"}
        self.g.add_node(event["event_id"], **node)
        for participant in event.get("participants", []):
            self.g.add_edge(
                event["event_id"], participant,
                key=f"{event['event_id']}-INVOLVES-{participant}",
                type="INVOLVES", case_id=event["case_id"], confidence=event.get("confidence", 1.0),
                status="confirmed",
            )

    def all_entities(self, case_id: str) -> list[dict]:
        return [
            dict(data) for _, data in self.g.nodes(data=True)
            if data.get("case_id") == case_id
        ]

    def all_relationships(self, case_id: str) -> list[dict]:
        rels = []
        for u, v, key, data in self.g.edges(keys=True, data=True):
            if data.get("case_id") == case_id:
                rels.append(dict(data))
        return rels

    def case_graph(self, case_id: str, min_confidence: float = 0.0) -> dict:
        nodes = []
        for entity in self.all_entities(case_id):
            nodes.append({
                "id": entity["entity_id"],
                "type": entity.get("entity_type"),
                "label": entity.get("attributes", {}).get("name") or entity.get("attributes", {}).get("number") or entity.get("attributes", {}).get("plate") or entity.get("event_type") or entity.get("entity_id"),
                "metadata": entity.get("attributes", {}),
                "importance": entity.get("importance", None),
            })
        links = []
        for u, v, key, data in self.g.edges(keys=True, data=True):
            if data.get("case_id") != case_id:
                continue
            if data.get("confidence", 1.0) < min_confidence:
                continue
            links.append({
                "source": u,
                "target": v,
                "relationship": data.get("type"),
                "timestamp": data.get("timestamp"),
                "confidence": data.get("confidence"),
                "evidence_ref": data.get("evidence_id"),
                "status": data.get("status"),
            })
        return {"nodes": nodes, "links": links}

    def entity_neighborhood(self, entity_id: str, hops: int = 1) -> dict:
        if entity_id not in self.g.nodes:
            return {"nodes": [], "links": []}
        undirected = self.g.to_undirected()
        sub_nodes = {entity_id}
        frontier = {entity_id}
        for _ in range(hops):
            next_frontier = set()
            for n in frontier:
                next_frontier |= set(undirected.neighbors(n))
            sub_nodes |= next_frontier
            frontier = next_frontier
        sub = self.g.subgraph(sub_nodes)
        nodes = [{
            "id": n,
            "type": d.get("entity_type"),
            "label": d.get("attributes", {}).get("name") or d.get("attributes", {}).get("number") or d.get("attributes", {}).get("plate") or d.get("event_type") or n,
            "metadata": d.get("attributes", {}),
        } for n, d in sub.nodes(data=True)]
        links = [{
            "source": u, "target": v,
            "relationship": d.get("type"),
            "timestamp": d.get("timestamp"),
            "confidence": d.get("confidence"),
            "evidence_ref": d.get("evidence_id"),
        } for u, v, k, d in sub.edges(keys=True, data=True)]
        return {"nodes": nodes, "links": links}

    def find_path(self, from_id: str, to_id: str) -> Optional[list]:
        undirected = self.g.to_undirected()
        try:
            return nx.shortest_path(undirected, from_id, to_id)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    # -- analytics helpers used by AnalyticsService --
    def degree_centrality(self, case_id: str) -> dict:
        sub = self._case_subgraph(case_id)
        return nx.degree_centrality(sub)

    def betweenness_centrality(self, case_id: str) -> dict:
        sub = self._case_subgraph(case_id)
        return nx.betweenness_centrality(sub.to_undirected())

    def communities(self, case_id: str) -> list[list[str]]:
        sub = self._case_subgraph(case_id).to_undirected()
        if sub.number_of_nodes() == 0:
            return []
        comms = nx.algorithms.community.greedy_modularity_communities(sub)
        return [list(c) for c in comms]

    def _case_subgraph(self, case_id: str) -> nx.MultiDiGraph:
        nodes = [n for n, d in self.g.nodes(data=True) if d.get("case_id") == case_id]
        return self.g.subgraph(nodes)


class Neo4jGraphStore(BaseGraphStore):
    """
    Production graph store backed by real Neo4j. Not used by default in this
    demo (requires a running Neo4j instance + GRAPH_BACKEND="neo4j").
    Implements the same interface as NetworkXGraphStore via Cypher.
    """

    def __init__(self):
        from neo4j import GraphDatabase  # imported lazily so demo mode has no hard dependency
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )

    def upsert_entity(self, entity: dict):
        with self.driver.session() as session:
            session.run(
                """
                MERGE (e:Entity {entity_id: $entity_id})
                SET e += $props, e:`""" + entity["entity_type"] + "`",
                entity_id=entity["entity_id"], props=entity,
            )

    def upsert_relationship(self, rel: dict):
        with self.driver.session() as session:
            session.run(
                f"""
                MATCH (a:Entity {{entity_id: $from_id}}), (b:Entity {{entity_id: $to_id}})
                MERGE (a)-[r:{rel['type']} {{relationship_id: $rel_id}}]->(b)
                SET r += $props
                """,
                from_id=rel["from_entity"], to_id=rel["to_entity"],
                rel_id=rel["relationship_id"], props=rel,
            )

    def upsert_event(self, event: dict):
        with self.driver.session() as session:
            session.run(
                """
                MERGE (ev:Event {event_id: $event_id})
                SET ev += $props
                WITH ev
                UNWIND $participants AS pid
                MATCH (p:Entity {entity_id: pid})
                MERGE (ev)-[:INVOLVES]->(p)
                """,
                event_id=event["event_id"], props=event,
                participants=event.get("participants", []),
            )

    def get_entity(self, entity_id: str) -> Optional[dict]:
        with self.driver.session() as session:
            record = session.run(
                "MATCH (e:Entity {entity_id: $id}) RETURN e", id=entity_id
            ).single()
            return dict(record["e"]) if record else None

    def case_graph(self, case_id: str, min_confidence: float = 0.0) -> dict:
        with self.driver.session() as session:
            result = session.run(
                """
                MATCH (a:Entity {case_id: $case_id})-[r]->(b:Entity {case_id: $case_id})
                WHERE coalesce(r.confidence, 1.0) >= $min_confidence
                RETURN a, r, b
                """,
                case_id=case_id, min_confidence=min_confidence,
            )
            nodes, links, seen = [], [], set()
            for record in result:
                for node in (record["a"], record["b"]):
                    if node["entity_id"] not in seen:
                        seen.add(node["entity_id"])
                        nodes.append({
                            "id": node["entity_id"],
                            "type": node.get("entity_type"),
                            "label": node.get("attributes", {}).get("name") or node.get("attributes", {}).get("number") or node.get("attributes", {}).get("plate") or node.get("event_type") or node["entity_id"],
                            "metadata": node.get("attributes", {}),
                        })
                r = record["r"]
                links.append({
                    "source": record["a"]["entity_id"],
                    "target": record["b"]["entity_id"],
                    "relationship": r.type,
                    "timestamp": r.get("timestamp"),
                    "confidence": r.get("confidence"),
                    "evidence_ref": r.get("evidence_id"),
                })
            return {"nodes": nodes, "links": links}

    def entity_neighborhood(self, entity_id: str, hops: int = 1) -> dict:
        with self.driver.session() as session:
            result = session.run(
                f"""
                MATCH path = (e:Entity {{entity_id: $id}})-[*1..{hops}]-(n)
                RETURN path
                """,
                id=entity_id,
            )
            nodes, links, seen = [], [], set()
            for record in result:
                path = record["path"]
                for node in path.nodes:
                    if node["entity_id"] not in seen:
                        seen.add(node["entity_id"])
                        nodes.append({
                            "id": node["entity_id"], "type": node.get("entity_type"),
                            "label": node.get("attributes", {}).get("name") or node.get("attributes", {}).get("number") or node.get("attributes", {}).get("plate") or node.get("event_type") or node["entity_id"],
                            "metadata": node.get("attributes", {}),
                        })
                for rel in path.relationships:
                    links.append({
                        "source": rel.start_node["entity_id"],
                        "target": rel.end_node["entity_id"],
                        "relationship": rel.type,
                    })
            return {"nodes": nodes, "links": links}

    def find_path(self, from_id: str, to_id: str) -> Optional[list]:
        with self.driver.session() as session:
            record = session.run(
                """
                MATCH p = shortestPath((a:Entity {entity_id:$from_id})-[*..10]-(b:Entity {entity_id:$to_id}))
                RETURN [n IN nodes(p) | n.entity_id] AS ids
                """,
                from_id=from_id, to_id=to_id,
            ).single()
            return record["ids"] if record else None

    def all_entities(self, case_id: str) -> list[dict]:
        with self.driver.session() as session:
            result = session.run("MATCH (e:Entity {case_id:$cid}) RETURN e", cid=case_id)
            return [dict(r["e"]) for r in result]

    def all_relationships(self, case_id: str) -> list[dict]:
        with self.driver.session() as session:
            result = session.run(
                "MATCH (:Entity {case_id:$cid})-[r]->(:Entity {case_id:$cid}) RETURN r", cid=case_id
            )
            return [dict(r["r"]) for r in result]


def get_graph_store() -> BaseGraphStore:
    if settings.GRAPH_BACKEND == "neo4j":
        return Neo4jGraphStore()
    return NetworkXGraphStore()


# Module-level singleton so the same in-memory graph persists across requests
# in this demo process (mirrors how a real Neo4j connection pool is shared).
graph_store = get_graph_store()
