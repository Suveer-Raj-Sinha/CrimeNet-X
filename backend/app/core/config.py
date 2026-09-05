"""
Central configuration for CRIMENET-X backend.

For this MVP/demo build the graph store defaults to an in-memory NetworkX
graph (GRAPH_BACKEND="memory") so the whole system runs with zero external
services. Flipping GRAPH_BACKEND to "neo4j" and providing NEO4J_* settings
switches the GraphStore implementation to the real Neo4j driver without
touching any calling code (see app/store/graph_store.py).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "CRIMENET-X"
    SECRET_KEY: str = "dev-secret-change-me"          # override via env in real deployments
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Graph backend: "memory" (NetworkX, default for demo) or "neo4j"
    GRAPH_BACKEND: str = "memory"
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    # SQLite used for cases/users/audit/evidence in this MVP.
    # Swap for PostgreSQL in production by changing this URL.
    DATABASE_URL: str = "sqlite:///./crimenet_x.db"

    class Config:
        env_file = ".env"


settings = Settings()
