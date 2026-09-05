"""
Seeds a "Silk Road" demo case with synthetic FIR + CDR data by driving the running API.
This case is based on the famous FBI takedown of the Silk Road marketplace and Ross Ulbricht.

Run the server first:
    uvicorn app.main:app --reload

then, from backend/:
    python scripts/seed_silk_road.py
"""
import time
import requests

BASE = "http://localhost:8000"

SYNTHETIC_FIR_1 = """\
Complainant: Agent Christopher Tarbell
Accused: Ross Ulbricht
Phone: 415-555-0199
Vehicle: CA-55XY123
Incident: Cybercrime and narcotics trafficking operation reported at Glen Park Library on 2013-10-01
"""

SYNTHETIC_FIR_2 = """\
Complainant: Agent Jared Der-Yeghiayan
Accused: Ross W. Ulbricht
Phone: 415-555-0199
Incident: Server infiltration linked to Dread Pirate Roberts reported at San Francisco on 2013-09-25
"""

SYNTHETIC_FIR_3 = """\
Complainant: Agent Carl Force
Accused: Curtis Green
Witness: Dread Pirate Roberts
Phone: 801-555-0200
Incident: Employee theft and intimidation investigation reported at Spanish Fork on 2013-01-17
"""

# Include a call burst between Ross (415-555-0199) and Curtis (801-555-0200) to trigger an alert
SYNTHETIC_CDR = """caller,receiver,timestamp,duration_seconds,cell_tower
415-555-0199,801-555-0200,2013-01-16T09:00:00Z,120,SF-01
415-555-0199,801-555-0200,2013-01-16T09:05:00Z,60,SF-01
415-555-0199,801-555-0200,2013-01-16T10:42:00Z,300,SF-01
415-555-0199,801-555-0200,2013-01-17T09:10:00Z,90,SF-01
415-555-0199,801-555-0200,2013-01-17T11:00:00Z,40,SF-01
415-555-0199,801-555-0200,2013-01-17T12:00:00Z,20,SF-01
415-555-0199,801-555-0200,2013-01-17T13:00:00Z,25,SF-01
415-555-0199,801-555-0200,2013-01-17T14:00:00Z,35,SF-01
415-555-0199,801-555-0200,2013-01-17T15:00:00Z,15,SF-01
415-555-0199,801-555-0200,2013-01-17T16:00:00Z,45,SF-01
415-555-0199,801-555-0200,2013-01-17T17:00:00Z,60,SF-01
415-555-0199,801-555-0200,2013-01-17T19:00:00Z,10,SF-01
415-555-0199,801-555-0200,2013-01-17T20:00:00Z,20,SF-01
415-555-0199,801-555-0200,2013-01-17T21:00:00Z,30,SF-01
415-555-0199,801-555-0200,2013-01-17T22:00:00Z,55,SF-01
415-555-0199,801-555-0200,2013-01-17T23:00:00Z,12,SF-01
"""

def login(username, password):
    r = requests.post(f"{BASE}/api/v1/auth/login", json={"username": username, "password": password})
    r.raise_for_status()
    return r.json()["access_token"]

def main():
    token = login("investigator1", "invest123")
    headers = {"Authorization": f"Bearer {token}"}

    case = requests.post(f"{BASE}/api/v1/cases/", json={
        "title": "Operation Silk Road",
        "description": "Investigation into the Silk Road darknet market and Ross Ulbricht.",
    }, headers=headers).json()
    case_id = case["case_id"]
    print(f"Created case: {case_id}")

    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "FIR", "filename": "fir_tarbell.txt", "raw_text": SYNTHETIC_FIR_1,
    })
    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "FIR", "filename": "fir_deryeghiayan.txt", "raw_text": SYNTHETIC_FIR_2,
    })
    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "FIR", "filename": "fir_force.txt", "raw_text": SYNTHETIC_FIR_3,
    })
    requests.post(f"{BASE}/api/v1/documents/upload", headers=headers, json={
        "case_id": case_id, "source_type": "CDR", "filename": "cdr_ulbricht_green.csv", "raw_text": SYNTHETIC_CDR,
    })
    
    print("Uploaded Silk Road documents (3 FIRs, 1 CDR), waiting for background processing...")
    time.sleep(3)

    alerts = requests.post(f"{BASE}/api/v1/analytics/run-alerts/{case_id}", headers=headers).json()
    print("Alerts created:", len(alerts))

    graph = requests.get(f"{BASE}/api/v1/graph/case/{case_id}", headers=headers).json()
    print(f"Graph now has {len(graph['nodes'])} nodes and {len(graph['links'])} links.")

    print("\nSilk Road Demo case ready.")
    print(f"  Case ID: {case_id}")
    print(f"  Graph endpoint: {BASE}/api/v1/graph/case/{case_id}")
    print("  Log into the frontend with investigator1 / invest123 and open this case.")

if __name__ == "__main__":
    main()
