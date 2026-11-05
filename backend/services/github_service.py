import re
import base64
import requests
from typing import Dict, Any, Tuple
from config import GITHUB_TOKEN

def validate_github_url(raw_url: str) -> Tuple[bool, str, str, str]:
    """
    Validates a public GitHub repository URL.
    Returns (is_valid, owner, repo, error_message)
    """
    if not raw_url or not raw_url.strip():
        return False, "", "", "Please enter a GitHub repository URL."
    
    clean_url = raw_url.strip()
    pattern = r'^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$'
    match = re.match(pattern, clean_url)
    
    if not match:
        return False, "", "", "Please enter a valid GitHub repository URL."
    
    owner = match.group(1)
    repo = match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
        
    if not owner or not repo:
        return False, "", "", "Please enter a valid GitHub repository URL."
        
    return True, owner, repo, ""

def fetch_repository_details(raw_url: str) -> Dict[str, Any]:
    """
    Fetches public GitHub repository metadata, languages, file tree, and README.
    Raises ValueError with user-friendly error messages if invalid or inaccessible.
    """
    is_valid, owner, repo, err_msg = validate_github_url(raw_url)
    if not is_valid:
        raise ValueError(err_msg)
        
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Project-Afterlife-AI-Reviewer"
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
        
    base_url = f"https://api.github.com/repos/{owner}/{repo}"
    
    # 1. Fetch Repository Metadata
    try:
        repo_res = requests.get(base_url, headers=headers, timeout=12)
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error while connecting to GitHub: {str(e)}")
        
    if repo_res.status_code == 404:
        raise ValueError(
            "This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct."
        )
    elif repo_res.status_code == 403:
        err_json = repo_res.json() if repo_res.content else {}
        if "rate limit" in err_json.get("message", "").lower():
            raise ValueError("GitHub API rate limit reached. Please wait a few minutes or provide GITHUB_TOKEN in backend/.env.")
        raise ValueError("This repository could not be analyzed. Access was forbidden (it may be private or rate limited).")
    elif not repo_res.ok:
        raise ValueError("This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct.")
        
    repo_data = repo_res.json()
    
    # 2. Fetch Languages Breakdown
    languages = {}
    try:
        lang_res = requests.get(f"{base_url}/languages", headers=headers, timeout=8)
        if lang_res.ok:
            languages = lang_res.json()
    except Exception:
        pass
        
    # 3. Fetch Root Contents / File Tree
    root_files = []
    try:
        contents_res = requests.get(f"{base_url}/contents", headers=headers, timeout=8)
        if contents_res.ok:
            items = contents_res.json()
            if isinstance(items, list):
                root_files = [item.get("name", "") for item in items if item.get("name")]
    except Exception:
        pass
        
    # 4. Fetch README Content
    readme_content = ""
    try:
        readme_res = requests.get(f"{base_url}/readme", headers=headers, timeout=8)
        if readme_res.ok:
            readme_data = readme_res.json()
            if readme_data.get("content"):
                readme_content = base64.b64decode(readme_data["content"]).decode("utf-8", errors="replace")
    except Exception:
        pass

    # 5. Inspect key dependency files if present
    relevant_source_files = {}
    for filename in ["package.json", "requirements.txt", "Dockerfile"]:
        if filename in root_files:
            try:
                f_res = requests.get(f"{base_url}/contents/{filename}", headers=headers, timeout=6)
                if f_res.ok:
                    f_json = f_res.json()
                    if f_json.get("content"):
                        decoded = base64.b64decode(f_json["content"]).decode("utf-8", errors="replace")
                        relevant_source_files[filename] = decoded[:1500]
            except Exception:
                pass
                
    detected_stack = _detect_stack(root_files, languages, readme_content, relevant_source_files)
    
    return {
        "owner": owner,
        "name": repo_data.get("name", repo),
        "fullName": repo_data.get("full_name", f"{owner}/{repo}"),
        "url": repo_data.get("html_url", f"https://github.com/{owner}/{repo}"),
        "description": repo_data.get("description") or "No description provided by repository author.",
        "stars": repo_data.get("stargazers_count", 0),
        "forks": repo_data.get("forks_count", 0),
        "openIssues": repo_data.get("open_issues_count", 0),
        "language": repo_data.get("language") or (list(languages.keys())[0] if languages else "Unknown"),
        "languages": languages,
        "topics": repo_data.get("topics", []),
        "defaultBranch": repo_data.get("default_branch", "main"),
        "license": repo_data.get("license", {}).get("name") if repo_data.get("license") else None,
        "createdAt": repo_data.get("created_at", ""),
        "updatedAt": repo_data.get("pushed_at") or repo_data.get("updated_at", ""),
        "readmeContent": readme_content,
        "rootFiles": root_files,
        "relevantSourceFiles": relevant_source_files,
        "detectedStack": detected_stack
    }

def _detect_stack(files, languages, readme, relevant_files):
    lower_files = [f.lower() for f in files]
    lower_readme = readme.lower()
    pkg_json = relevant_files.get("package.json", "").lower()
    req_txt = relevant_files.get("requirements.txt", "").lower()
    combined_ctx = f"{lower_readme} {pkg_json} {req_txt}"

    has_docker = any("dockerfile" in f or "docker-compose" in f for f in lower_files)
    has_tests = any("test" in f or "spec" in f or "jest" in f or "pytest" in f for f in lower_files)
    has_cicd = ".github" in lower_files or ".gitlab-ci.yml" in lower_files
    has_env_example = any(".env.example" in f or ".env.sample" in f for f in lower_files)
    has_license = any("license" in f or "copying" in f for f in lower_files)

    frontend = []
    backend = []
    database = []
    testing = []
    ai_ml = []

    if "react" in combined_ctx: frontend.append("React")
    if "next" in combined_ctx: frontend.append("Next.js")
    if "vue" in combined_ctx: frontend.append("Vue.js")
    if "tailwind" in combined_ctx: frontend.append("Tailwind CSS")
    if "vite" in combined_ctx: frontend.append("Vite")

    if "express" in combined_ctx or "server.js" in lower_files or "app.js" in lower_files: backend.append("Node.js / Express")
    if "fastapi" in combined_ctx: backend.append("FastAPI")
    if "flask" in combined_ctx: backend.append("Flask")
    if "django" in combined_ctx: backend.append("Django")
    if "spring" in combined_ctx or "pom.xml" in lower_files: backend.append("Spring Boot")

    if "mongodb" in combined_ctx or "mongoose" in combined_ctx: database.append("MongoDB")
    if "postgres" in combined_ctx or "psycopg" in combined_ctx: database.append("PostgreSQL")
    if "mysql" in combined_ctx: database.append("MySQL")
    if "sqlite" in combined_ctx: database.append("SQLite")
    if "firebase" in combined_ctx or "firestore" in combined_ctx: database.append("Firebase / Firestore")
    if "supabase" in combined_ctx: database.append("Supabase")

    if any(k in combined_ctx for k in ["groq", "openai", "gemini", "langchain", "pytorch", "tensorflow", "huggingface", "scikit-learn"]):
        if "groq" in combined_ctx: ai_ml.append("Groq API")
        if "openai" in combined_ctx: ai_ml.append("OpenAI API")
        if "gemini" in combined_ctx: ai_ml.append("Gemini AI")
        if "langchain" in combined_ctx: ai_ml.append("LangChain")
        if "pytorch" in combined_ctx: ai_ml.append("PyTorch")
        if "tensorflow" in combined_ctx: ai_ml.append("TensorFlow")

    if has_tests:
        if "jest" in combined_ctx: testing.append("Jest")
        if "pytest" in combined_ctx: testing.append("PyTest")
        if "vitest" in combined_ctx: testing.append("Vitest")

    return {
        "frontend": frontend if frontend else ["Vanilla Web UI / Templates"],
        "backend": backend if backend else ["Node.js / Python Runtime Script"],
        "database": database if database else ["Local / JSON Storage / Embedded DB"],
        "testing": testing if testing else (["Unit test files detected"] if has_tests else ["No automated tests detected"]),
        "aiMl": ai_ml,
        "hasDocker": has_docker,
        "hasTests": has_tests,
        "hasCiCd": has_cicd,
        "hasEnvExample": has_env_example,
        "hasLicense": has_license
    }
