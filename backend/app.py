import os
import sys
import logging
from pathlib import Path

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to Python path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("project_afterlife")

from flask import Flask, request, jsonify
from flask_cors import CORS
from config import PORT, DEBUG, HOST, GROQ_API_KEY, GROQ_MODEL
from services.github_service import fetch_repository_details, validate_github_url
from services.prompt_service import MODULE_ALIASES
from services.ai_service import (
    analyze_all,
    analyze_module1,
    analyze_module2,
    analyze_module3,
    analyze_module4,
    is_groq_configured,
    get_active_model
)

app = Flask(__name__)
# Enable CORS for frontend development
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint confirming backend status and Groq SDK configuration."""
    groq_active = is_groq_configured()
    return jsonify({
        "status": "ok",
        "service": "Project Afterlife API",
        "version": "1.0.0",
        "groq_configured": groq_active,
        "groq_model": get_active_model() if groq_active else None
    }), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_full_project():
    """Analyzes a public GitHub repository across all four modules."""
    data = request.get_json(silent=True) or {}
    github_url = data.get("github_url") or data.get("url") or ""
    
    is_valid, owner, repo, err_msg = validate_github_url(github_url)
    if not is_valid:
        return jsonify({"error": err_msg}), 400
        
    try:
        repo_data = fetch_repository_details(github_url)
        full_analysis = analyze_all(repo_data)
        return jsonify(full_analysis), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({
            "error": f"An unexpected error occurred while analyzing the repository: {str(e)}"
        }), 500

@app.route("/api/analyze/<module_id>", methods=["POST"])
def analyze_single_module(module_id: str):
    """
    Modular analysis endpoint supporting module1, module2, module3, module4
    (and aliases: analyzer, tech-advisor, expert-finder, afterlife-planner).
    """
    canonical_id = MODULE_ALIASES.get(module_id.lower().replace("_", "-"))
    if not canonical_id:
        return jsonify({
            "error": f"Invalid module '{module_id}'. Expected one of: module1, module2, module3, module4."
        }), 404
        
    data = request.get_json(silent=True) or {}
    github_url = data.get("github_url") or data.get("url") or ""
    
    is_valid, owner, repo, err_msg = validate_github_url(github_url)
    if not is_valid:
        return jsonify({"error": err_msg}), 400
        
    try:
        repo_data = fetch_repository_details(github_url)
        
        if canonical_id == "module1":
            module_result = analyze_module1(repo_data)
        elif canonical_id == "module2":
            module_result = analyze_module2(repo_data)
        elif canonical_id == "module3":
            module_result = analyze_module3(repo_data)
        elif canonical_id == "module4":
            module_result = analyze_module4(repo_data)
        else:
            return jsonify({"error": "Unknown module"}), 400
            
        return jsonify({
            "moduleId": canonical_id,
            "repoDetails": repo_data,
            "result": module_result
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({
            "error": f"An unexpected error occurred during module analysis: {str(e)}"
        }), 500

if __name__ == "__main__":
    print(f"[RUNNING] Project Afterlife Flask API on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
