import sys
import json

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app import app

def test_endpoints():
    print("=== TESTING FLASK BACKEND ENDPOINTS & GROQ AI INTEGRATION ===\n")
    client = app.test_client()
    
    # 1. Test GET /api/health
    print("1. Testing GET /api/health ...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, "Health check failed!"
    health_json = health_res.get_json()
    print(f"Status Code: {health_res.status_code}, Response: {health_json}")
    assert health_json.get("groq_configured") is True, "Groq is not reported as configured!"
    print(f"[PASS] GET /api/health (Groq Active: {health_json.get('groq_configured')}, Model: {health_json.get('groq_model')})\n")
    
    # 2. Test Module 1 with Live Groq AI
    test_repo = "https://github.com/pallets/flask"
    print(f"2. Testing POST /api/analyze/module1 with '{test_repo}' ...")
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
    print(f"Score: {res['score']['overall']}/100 (Functionality: {res['score']['functionality']}, Code: {res['score']['codeQuality']}, Docs: {res['score']['documentation']})")
    print(f"Tech Stack: {res.get('technologyStack')}")
    assert "groq:" in res.get("_engine", ""), "Analysis did not run with Groq AI!"
    assert "scoreExplanations" in res, "Missing scoreExplanations in result!"
    print("[PASS] POST /api/analyze/module1 (Verified live Groq output)\n")
    
    # 3. Test Full Analysis (All 4 modules)
    print(f"3. Testing POST /api/analyze with '{test_repo}' ...")
    all_res = client.post(
        "/api/analyze",
        data=json.dumps({"github_url": test_repo}),
        content_type="application/json"
    )
    assert all_res.status_code == 200, f"Full analyze failed: {all_res.get_json()}"
    all_data = all_res.get_json()
    assert "repoDetails" in all_data, "Missing repoDetails"
    assert "analyzerResult" in all_data, "Missing analyzerResult"
    assert "techAdvisorResult" in all_data, "Missing techAdvisorResult"
    assert "expertFinderResult" in all_data, "Missing expertFinderResult"
    assert "plannerResult" in all_data, "Missing plannerResult"
    print("[PASS] POST /api/analyze returned all 4 modules successfully!\n")

    # 4. Test Error Handling (Invalid URL)
    print("4. Testing error handling with invalid URL ...")
    invalid_res = client.post(
        "/api/analyze/module1",
        data=json.dumps({"github_url": "not-a-url"}),
        content_type="application/json"
    )
    assert invalid_res.status_code == 400, f"Expected 400 for invalid URL, got: {invalid_res.status_code}"
    print(f"[PASS] Handled invalid URL cleanly: {invalid_res.get_json()['error']}\n")
    
    print("=== ALL BACKEND VERIFICATIONS COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_endpoints()
