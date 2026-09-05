"""
Seeds a demo case with synthetic FIR + CDR data by driving the running API,
exactly the way a real client would. Run the server first:

    uvicorn app.main:app --reload

then, from backend/:

    python scripts/seed_demo.py

This creates one case, uploads two synthetic documents, waits for background
processing, runs the alert rules, and prints a summary + the graph URL to
check in the frontend.
"""
import time

import requests

BASE = "http://localhost:8000"

SYNTHETIC_FIR = """\
Complainant: Rahul Kumar
Accused: Vikram Singh
Phone: 9876543210
Vehicle: DL01AB1234
Incident: Theft reported at Sector 12 Market on 2026-06-01
"""

SYNTHETIC_CDR = """caller,receiver,timestamp,duration_seconds,cell_tower
9876543210,9123456780,2026-05-30T09:00:00Z,120,TWR-01
9876543210,9123456780,2026-05-30T09:05:00Z,60,TWR-01
9876543210,9123456780,2026-05-30T18:42:00Z,300,TWR-02
9876543210,9123456780,2026-05-31T09:10:00Z,90,TWR-01
9876543210,9123456780,2026-05-31T11:00:00Z,40,TWR-01
9876543210,9123456780,2026-05-31T12:00:00Z,20,TWR-01
9876543210,9123456780,2026-05-31T13:00:00Z,25,TWR-01
9876543210,9123456780,2026-05-31T14:00:00Z,35,TWR-01
9876543210,9123456780,2026-05-31T15:00:00Z,15,TWR-01
9876543210,9123456780,2026-05-31T16:00:00Z,45,TWR-01
9876543210,9123456780,2026-05-31T17:00:00Z,60,TWR-01
9876543210,9123456780,2026-05-31T19:00:00Z,10,TWR-01
9876543210,9123456780,2026-05-31T20:00:00Z,20,TWR-01
9876543210,9123456780,2026-05-31T21:00:00Z,30,TWR-01
"""


def login(username, password):
    r = requests.post(f"{BASE}/api/v1/auth/login", json={"username": username, "password": password})
    r.raise_for_status()
    return r.json()["access_token"]


def main():
    token = login("investigator1", "invest123")
    headers = {"Authorization": f"Bearer {token}"}

    case = requests.post(f"{BASE}/api/v1/cases/", json={
        "title": "Sector 12 Market Theft",
        "description": "Synthetic demo case for CRIMENET-X MVP",
    }, headers=headers).json()
    case_id = case["case_id"]
    print(f"Created case: {case_id}")

    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "FIR", "filename": "fir_001.txt", "raw_text": SYNTHETIC_FIR,
    })
    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "CDR", "filename": "cdr_001.csv", "raw_text": SYNTHETIC_CDR,
    })
    print("Uploaded synthetic FIR + CDR documents, waiting for background processing...")
    time.sleep(2)

    alerts = requests.post(f"{BASE}/api/v1/analytics/run-alerts/{case_id}", headers=headers).json()
    print("Alerts created:", alerts)

    graph = requests.get(f"{BASE}/api/v1/graph/case/{case_id}", headers=headers).json()
    print(f"Graph now has {len(graph['nodes'])} nodes and {len(graph['links'])} links.")

    print("\nDemo case ready.")
    print(f"  Case ID: {case_id}")
    print(f"  Graph endpoint: {BASE}/api/v1/graph/case/{case_id}")
    print("  Log into the frontend with investigator1 / invest123 and open this case.")


if __name__ == "__main__":
    main()
