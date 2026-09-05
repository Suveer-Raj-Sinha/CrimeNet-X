"""
Every source-type adapter (FIR, CDR, financial, location, ...) implements
this interface. Adding a new data source means adding a new adapter here —
the rest of the pipeline (resolution, graph write, analytics) is unchanged.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class RawFact:
    """One structured fact pulled out of a raw document, pre-graph-write."""
    fact_type: str                     # "entity" | "relationship" | "event"
    payload: dict
    extraction_method: str
    confidence: float = 1.0


class BaseAdapter(ABC):
    source_type: str = "generic"

    @abstractmethod
    def parse(self, raw_text: str, case_id: str, document_id: str) -> list[RawFact]:
        """Parse raw source content into a list of RawFacts."""
        raise NotImplementedError
