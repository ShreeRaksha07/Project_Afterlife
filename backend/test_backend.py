import sys
import json
from sqlalchemy import text

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app import app
from database import get_engine, init_db, check_db_connectivity
from services.db_service import delete_project_records_by_url

def test_endpoints():
    print("=== TESTING FLASK BACKEND, GROQ AI & NEON POSTGRESQL ===\n")
    client = app.test_client()
    
    # 1. Test GET /api/health (Groq + Neon DB SELECT 1 verification)
    print("1. Testing GET /api/health ...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, "Health check failed!"
    health_json = health_res.get_json()
    print(f"Status Code: {health_res.status_code}, Response: {health_json}")
    assert health_json.get("groq_configured") is True, "Groq is not reported as configured!"
    assert health_json.get("database_configured") is True, "Neon DATABASE_URL is not reported as configured!"
    assert health_json.get("database_connected") is True, "Neon database SELECT 1 check failed!"
    print("[PASS] GET /api/health (Groq Active: True, Neon DB Connected: True)\n")

    # 2. Test Table Creation in Neon PostgreSQL
    print("2. Verifying Neon PostgreSQL Table Creation ('projects', 'analyses') ...")
    tables_created = init_db()
    assert tables_created is True, "Failed to initialize Neon tables!"
    engine = get_engine()
    assert engine is not None, "Database engine could not be acquired."
    with engine.connect() as conn:
        tables_res = conn.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        ).fetchall()
        table_names = [t[0] for t in tables_res]
        print(f"Tables in public schema: {table_names}")
        assert "projects" in table_names, "Table 'projects' not found in Neon database!"
        assert "analyses" in table_names, "Table 'analyses' not found in Neon database!"
    print("[PASS] Verified 'projects' and 'analyses' tables in Neon PostgreSQL.\n")
    
    # 3. Test Module 1 Analysis with Live Groq AI & Neon DB Saving
    test_repo = "https://github.com/pallets/flask"
    print(f"3. Testing POST /api/analyze/module1 with '{test_repo}' ...")
    m1_res = client.post(
        "/api/analyze/module1",
        data=json.dumps({"github_url": test_repo}),
        content_type="application/json"
    )
    assert m1_res.status_code == 200, f"Module 1 failed: {m1_res.get_json()}"
    m1_data = m1_res.get_json()
    res = m1_data["result"]
    print(f"Engine: {res.get('_engine')}")
    print(f"Maturity: {res.get('maturity')}")
    print(f"Score: {res['score']['overall']}/100")
    assert "groq:" in res.get("_engine", ""), "Analysis did not run with Groq AI!"
    assert "db" in m1_data, "Database persistence info missing from response!"
    assert m1_data["db"].get("saved") is True, "Database record was not saved!"
    saved_project_id = m1_data["db"]["projectId"]
    saved_analysis_id = m1_data["db"]["analysisId"]
    print(f"Neon Saved Info: projectId={saved_project_id}, analysisId={saved_analysis_id}")
    print("[PASS] POST /api/analyze/module1 (Groq analysis executed & persisted to Neon)\n")

    # 4. Test GET /api/history (Retrieving project list from Neon)
    print("4. Testing GET /api/history ...")
    hist_res = client.get("/api/history")
    assert hist_res.status_code == 200, f"History fetch failed: {hist_res.get_json()}"
    hist_json = hist_res.get_json()
    assert hist_json.get("status") == "ok", "History response status not ok!"
    projects = hist_json.get("projects", [])
    print(f"Total projects in history: {len(projects)}")
    matched = [p for p in projects if p.get("github_url") == test_repo]
    assert len(matched) > 0, f"Project '{test_repo}' not found in retrieved history!"
    print(f"Retrieved Project: '{matched[0]['repository_name']}', Latest Analysis: {matched[0].get('latest_analysis')}")
    print("[PASS] GET /api/history (Verified data retrieved from Neon)\n")

    # 5. Test GET /api/history/<identifier> (Retrieving full project analyses)
    print(f"5. Testing GET /api/history/{saved_project_id} ...")
    proj_res = client.get(f"/api/history/{saved_project_id}")
    assert proj_res.status_code == 200, f"Failed to retrieve project by id: {proj_res.get_json()}"
    proj_json = proj_res.get_json()["project"]
    assert len(proj_json.get("analyses", [])) > 0, "No analyses found for project!"
    retrieved_analysis = proj_json["analyses"][0]
    assert retrieved_analysis["module_name"] == "module1", "Expected module_name 'module1'!"
    assert "score" in retrieved_analysis["analysis_result"], "Missing score in persisted analysis_result!"
    print(f"Retrieved analysis record id={retrieved_analysis['id']}, module={retrieved_analysis['module_name']}")
    print("[PASS] GET /api/history/<id> (Full analysis JSON verified from Neon)\n")

    # 6. Test Error Handling (Invalid URL)
    print("6. Testing error handling with invalid URL ...")
    invalid_res = client.post(
        "/api/analyze/module1",
        data=json.dumps({"github_url": "not-a-url"}),
        content_type="application/json"
    )
    assert invalid_res.status_code == 400, f"Expected 400 for invalid URL, got: {invalid_res.status_code}"
    print(f"[PASS] Handled invalid URL cleanly: {invalid_res.get_json()['error']}\n")

    # 7. Clean up Test Record in Neon PostgreSQL (Requirement 8)
    print(f"7. Cleaning up test records for '{test_repo}' in Neon PostgreSQL ...")
    deleted_count = delete_project_records_by_url(test_repo)
    print(f"Deleted {deleted_count} test project record(s).")
    print("[PASS] Database cleanup complete.\n")

    print("=== ALL BACKEND, GROQ AI & NEON POSTGRESQL VERIFICATIONS PASSED! ===")

if __name__ == "__main__":
    test_endpoints()
