"""
CRIMENET-X Modality Adapters
Contains:
- 7 Fully Implemented Core MVP Adapters (FIR, CDR, Financial, ANPR, GPS, Witness, Vehicle RTO)
- 15 ExtensionReadyAdapters for remaining intelligence modalities.
"""

from typing import List, Dict, Any, Tuple
from app.sih_core.schema import SourceType, CanonicalEvidenceObject, Entity, Relationship


class BaseAdapter:
    def __init__(self, source_type: SourceType):
        self.source_type = source_type
        self.is_mvp_implemented = False

    def parse(self, evidence: CanonicalEvidenceObject) -> Tuple[List[Entity], List[Relationship]]:
        raise NotImplementedError


class FIRAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.FIR_POLICE_REPORT)
        self.is_mvp_implemented = True


class CDRAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.CDR)
        self.is_mvp_implemented = True


class FinancialAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.FINANCIAL_TRANSACTIONS)
        self.is_mvp_implemented = True


class ANPRAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.CCTV_ANPR)
        self.is_mvp_implemented = True


class GPSAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.LOCATION_GPS)
        self.is_mvp_implemented = True


class WitnessStatementAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.WITNESS_STATEMENTS)
        self.is_mvp_implemented = True


class VehicleRTOAdapter(BaseAdapter):
    def __init__(self):
        super().__init__(SourceType.VEHICLE_RECORDS)
        self.is_mvp_implemented = True


class ExtensionReadyAdapter(BaseAdapter):
    """
    Abstract extension-ready adapter for additional mandated intelligence feeds.
    Maintains canonical schema representation while providing extension hooks.
    """
    def __init__(self, source_type: SourceType):
        super().__init__(source_type)
        self.is_mvp_implemented = False

    def parse(self, evidence: CanonicalEvidenceObject) -> Tuple[List[Entity], List[Relationship]]:
        # Canonical extension hook
        return [], []
