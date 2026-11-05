import os
import json
import logging
from typing import Dict, Any, Optional

from config import GROQ_API_KEY, GROQ_MODEL, dotenv_path
from services.prompt_service import MODULE_PERSONAS, format_repo_context

logger = logging.getLogger(__name__)

# Dynamic Groq client cache
_cached_groq_client = None
_cached_api_key = None

def get_groq_client():
    """
    Lazily and dynamically retrieves or initializes the Groq SDK client.
    Re-checks environment variables on call so adding GROQ_API_KEY to backend/.env
    works immediately without requiring a full server reboot.
    """
    global _cached_groq_client, _cached_api_key
    
    # Check current environment or re-read .env
    current_key = os.getenv("GROQ_API_KEY", "").strip()
    if not current_key or current_key == "gsk_your_groq_api_key_here":
        try:
            from dotenv import load_dotenv
            load_dotenv(dotenv_path=dotenv_path, override=True)
            current_key = os.getenv("GROQ_API_KEY", "").strip()
        except Exception:
            pass
            
    if not current_key or current_key == "gsk_your_groq_api_key_here":
        return None
        
    if _cached_groq_client is not None and _cached_api_key == current_key:
        return _cached_groq_client
        
    try:
        from groq import Groq
        _cached_groq_client = Groq(api_key=current_key)
        _cached_api_key = current_key
        logger.info("[GROQ] Groq Python SDK client successfully initialized.")
        return _cached_groq_client
    except Exception as e:
        logger.warning(f"[GROQ] Could not initialize Groq client: {e}")
        return None

def is_groq_configured() -> bool:
    """Returns True if a valid Groq API key is present and usable."""
    return get_groq_client() is not None

def get_active_model() -> str:
    """Returns the configured Groq model name."""
    return os.getenv("GROQ_MODEL", GROQ_MODEL).strip() or "openai/gpt-oss-120b"

def clean_json_string(text: str) -> str:
    """Strips markdown code fences (```json ... ```) or whitespace from LLM output."""
    if not text:
        return ""
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

def extract_json_object(text: str) -> Optional[Dict[str, Any]]:
    """
    Extracts and parses a JSON object from text, even with markdown fences or surrounding chatter.
    """
    cleaned = clean_json_string(text)
    try:
        return json.loads(cleaned)
    except Exception:
        pass
        
    # Attempt extraction between the first '{' and the last '}'
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(cleaned[first_brace:last_brace + 1])
        except Exception as e:
            logger.warning(f"[JSON PARSE] Failed to parse extracted substring: {e}")
            
    return None

def validate_and_sanitize_module1(data: Dict[str, Any], repo: Dict[str, Any], model: str) -> Dict[str, Any]:
    """
    Validates all required fields for Module 1, sanitizes score boundaries,
    ensures evidence-based explanations are preserved, and embeds engine metadata.
    """
    raw_score = data.get("score")
    if not isinstance(raw_score, dict):
        raw_score = {}
        
    func = int(raw_score.get("functionality") or 70)
    code = int(raw_score.get("codeQuality") or 70)
    doc = int(raw_score.get("documentation") or 70)
    innov = int(raw_score.get("innovation") or 70)
    ux = int(raw_score.get("userExperience") or 70)
    scale = int(raw_score.get("scalability") or 70)
    
    # Clamp scores between 0 and 100
    func = max(0, min(100, func))
    code = max(0, min(100, code))
    doc = max(0, min(100, doc))
    innov = max(0, min(100, innov))
    ux = max(0, min(100, ux))
    scale = max(0, min(100, scale))
    
    overall = raw_score.get("overall")
    if overall is None or not isinstance(overall, (int, float)) or overall <= 0:
        overall = round((func * 0.25) + (code * 0.20) + (doc * 0.15) + (innov * 0.15) + (ux * 0.10) + (scale * 0.15))
    else:
        overall = max(0, min(100, int(overall)))
        
    sanitized_score = {
        "overall": overall,
        "functionality": func,
        "codeQuality": code,
        "documentation": doc,
        "innovation": innov,
        "userExperience": ux,
        "scalability": scale
    }
    
    # Maturity Level Validation
    valid_maturities = {"Idea", "Prototype", "MVP", "Advanced Prototype", "Production Ready"}
    maturity = data.get("maturity")
    if maturity not in valid_maturities:
        if overall < 55: maturity = "Idea"
        elif overall < 70: maturity = "Prototype"
        elif overall < 82: maturity = "MVP"
        elif overall < 90: maturity = "Advanced Prototype"
        else: maturity = "Production Ready"
        
    def clean_str(val: Any, default: str) -> str:
        if isinstance(val, str) and val.strip():
            return val.strip()
        return default
        
    def clean_list(val: Any, default_list: list) -> list:
        if isinstance(val, list) and val:
            return [str(x).strip() for x in val if str(x).strip()]
        return default_list

    primary_lang = repo.get("language") or "Codebase"
    
    project_overview = clean_str(data.get("projectOverview"), f"{repo.get('fullName', 'Project')} evaluated using {primary_lang}.")
    problem_identified = clean_str(data.get("problemIdentified"), f"Addresses challenges in {repo.get('description') or 'software workflows'}.")
    tech_stack = clean_list(data.get("technologyStack"), [primary_lang])
    main_features = clean_list(data.get("mainFeatures"), ["Core application workflow"])
    project_structure = clean_list(data.get("projectStructure"), [f"• {f}" for f in repo.get("rootFiles", [])[:8]])
    strengths = clean_list(data.get("strengths"), [f"Functional codebase implemented in {primary_lang}"])
    areas_imp = clean_list(data.get("areasRequiringImprovement"), ["Add automated unit and regression tests", "Provide environment variable documentation"])
    tech_issues = clean_list(data.get("technicalIssues"), ["Verify cross-platform compatibility and edge-case handling"])
    innov_potential = clean_str(data.get("innovationPotential"), "Promising project with good expansion potential.")
    scalability_assess = clean_str(data.get("scalabilityAssessment"), "Architectural foundation can scale with caching and persistent database storage.")
    rec_next_step = clean_str(data.get("recommendedNextStep"), "Set up a test suite and deployment pipeline.")
    
    # Score Explanations
    score_explanations = data.get("scoreExplanations")
    if not isinstance(score_explanations, dict):
        score_explanations = {
            "functionality": f"Functionality score ({func}/100) reflects repository features and implementation completeness.",
            "codeQuality": f"Code quality score ({code}/100) reflects structure and tests ({'tests detected' if repo.get('detectedStack', {}).get('hasTests') else 'no tests detected'}).",
            "documentation": f"Documentation score ({doc}/100) reflects README depth ({len(repo.get('readmeContent', ''))} chars) and usage instructions.",
            "innovation": f"Innovation score ({innov}/100) reflects novelty in problem domain.",
            "userExperience": f"UX score ({ux}/100) reflects developer ergonomics and UI setup.",
            "scalability": f"Scalability score ({scale}/100) reflects modularity and containerization ({'Docker present' if repo.get('detectedStack', {}).get('hasDocker') else 'no Docker'}).",
            "overall": f"Overall weighted score: {overall}/100."
        }
    else:
        for k in ["functionality", "codeQuality", "documentation", "innovation", "userExperience", "scalability", "overall"]:
            if k not in score_explanations or not str(score_explanations[k]).strip():
                score_explanations[k] = f"{k.capitalize()} assessed at {sanitized_score.get(k, overall)}/100 based on repository evidence."

    assumptions = clean_list(data.get("assumptions"), [])
    
    # Add score justifications to assumptions so they render visibly in UI
    if score_explanations:
        for k, v in score_explanations.items():
            entry = f"Evidence ({k.capitalize()} {sanitized_score.get(k, overall)}/100): {v}"
            if not any(k.lower() in a.lower() for a in assumptions):
                assumptions.append(entry)

    return {
        "projectOverview": project_overview,
        "problemIdentified": problem_identified,
        "technologyStack": tech_stack,
        "mainFeatures": main_features,
        "projectStructure": project_structure,
        "strengths": strengths,
        "areasRequiringImprovement": areas_imp,
        "technicalIssues": tech_issues,
        "innovationPotential": innov_potential,
        "scalabilityAssessment": scalability_assess,
        "score": sanitized_score,
        "scoreExplanations": score_explanations,
        "maturity": maturity,
        "recommendedNextStep": rec_next_step,
        "assumptions": assumptions,
        "_engine": f"groq:{model}"
    }

def call_groq_module1(repo: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes live Groq AI analysis for Module 1 using the official Groq Python SDK.
    Handles rate limits, invalid keys, model deprecations, and response validation.
    """
    client = get_groq_client()
    if not client:
        raise ValueError(
            "GROQ_API_KEY is not configured or invalid in backend/.env. "
            "Please configure your Groq API key to analyze repositories with Groq AI."
        )

    preferred_model = get_active_model()
    # List of candidate models in case preferred model has been deprecated or is inaccessible
    candidate_models = [preferred_model]
    for m in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]:
        if m not in candidate_models:
            candidate_models.append(m)

    persona = MODULE_PERSONAS["module1"]
    user_context = format_repo_context(repo)

    last_error = None
    for model in candidate_models:
        try:
            logger.info(f"[GROQ] Analyzing {repo.get('fullName')} with model '{model}'...")
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": persona["system_prompt"]},
                    {"role": "user", "content": user_context}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=3000
            )
            raw_content = completion.choices[0].message.content
            if not raw_content:
                raise ValueError("Groq returned an empty response.")
                
            parsed = extract_json_object(raw_content)
            if not parsed or not isinstance(parsed, dict):
                raise ValueError("Groq response could not be parsed into valid JSON.")
                
            sanitized = validate_and_sanitize_module1(parsed, repo, model)
            logger.info(
                f"[GROQ] Successfully analyzed {repo.get('fullName')} using {model} "
                f"(Score: {sanitized['score']['overall']}/100, Maturity: {sanitized['maturity']})."
            )
            return sanitized

        except Exception as e:
            err_str = str(e).lower()
            last_error = e
            # Immediate exit on rate limit or auth error
            if "rate_limit" in err_str or "rate limit" in err_str or "429" in err_str:
                logger.warning(f"[GROQ RATE LIMIT] {e}")
                raise ValueError("Groq API rate limit exceeded. Please wait a few seconds and try again.")
            if "invalid_api_key" in err_str or "authentication" in err_str or "401" in err_str:
                logger.error(f"[GROQ AUTH ERROR] {e}")
                raise ValueError("Invalid Groq API key in backend/.env. Please verify your credentials at https://console.groq.com/keys.")
            # If model is deprecated or not found, try fallback
            if "model_not_found" in err_str or "model_decommissioned" in err_str or "404" in err_str:
                logger.warning(f"[GROQ MODEL FALLBACK] Model '{model}' not found/decommissioned. Trying next candidate...")
                continue
                
            logger.error(f"[GROQ ERROR] Error with model '{model}': {e}")
            raise ValueError(f"Groq AI analysis error: {str(e)}")

    raise ValueError(f"All Groq AI models failed. Last error: {str(last_error)}")

def _call_groq_json(system_prompt: str, user_prompt: str) -> Optional[Dict[str, Any]]:
    """Calls Groq API with JSON mode enabled and safe parsing (used by modules 2, 3, 4)."""
    client = get_groq_client()
    if not client:
        return None
        
    model = get_active_model()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=3000
        )
        content = completion.choices[0].message.content
        if content:
            parsed = extract_json_object(content)
            if parsed:
                return parsed
            logger.warning(f"[GROQ] Content received but JSON extraction failed. Sample: {content[:120]}")
    except Exception as e:
        logger.error(f"[GROQ ERROR] Groq API call error: {e}")
        return None

# =========================================================================
# Module 1: Senior Software Project Reviewer
# =========================================================================
def analyze_module1(repo: Dict[str, Any]) -> Dict[str, Any]:
    """
    Module 1: Senior Software Project Reviewer.
    Executes live Groq AI analysis on the validated repository context.
    """
    return call_groq_module1(repo)

def _heuristic_module1(repo: Dict[str, Any]) -> Dict[str, Any]:
    readme = repo.get("readmeContent", "")
    has_tests = repo.get("detectedStack", {}).get("hasTests", False)
    has_docker = repo.get("detectedStack", {}).get("hasDocker", False)
    primary_lang = repo.get("language") or "Codebase"
    file_count = len(repo.get("rootFiles", []))
    
    doc_score = min(95, max(40, 45 + (len(readme) // 70)))
    code_score = min(90, max(50, 55 + (15 if has_tests else 0) + (10 if file_count > 6 else 0)))
    func_score = min(90, max(55, 65 + (10 if len(readme) > 400 else 0) + (5 if repo.get("stars", 0) > 3 else 0)))
    innov_score = min(92, max(65, 75 + (8 if repo.get("topics") else 0)))
    ux_score = min(88, max(55, 65 + (15 if repo.get("detectedStack", {}).get("frontend") else 5)))
    scale_score = min(85, max(40, 45 + (20 if has_docker else 0) + (10 if has_tests else 0)))
    
    overall = round((func_score * 0.25) + (code_score * 0.20) + (doc_score * 0.15) + (innov_score * 0.15) + (ux_score * 0.10) + (scale_score * 0.15))
    
    maturity = "Prototype"
    if overall < 55: maturity = "Idea"
    elif overall < 70: maturity = "Prototype"
    elif overall < 82: maturity = "MVP"
    elif overall < 90: maturity = "Advanced Prototype"
    else: maturity = "Production Ready"
    
    desc = repo.get("description") or f"A software project built with {primary_lang}."
    
    return {
        "projectOverview": f"{repo.get('fullName')} is an open-source project written predominantly in {primary_lang}. {desc}",
        "problemIdentified": f"Addresses challenges in domain '{', '.join(repo.get('topics', [])) or 'software tooling'}' using {primary_lang}.",
        "technologyStack": [primary_lang] + repo.get("detectedStack", {}).get("frontend", []) + repo.get("detectedStack", {}).get("backend", []) + repo.get("detectedStack", {}).get("database", []),
        "mainFeatures": [
            f"Core service orchestration in {primary_lang}",
            f"Root directory comprising {file_count} root artifacts",
            f"Ecosystem topics: {', '.join(repo.get('topics', [])) or 'Standard software architecture'}"
        ],
        "projectStructure": [f"• {f}" for f in repo.get("rootFiles", [])[:10]],
        "strengths": [
            f"Established repository foundation using {primary_lang}",
            "Descriptive README documentation available" if len(readme) > 200 else "Clean initial repository scaffolding",
            "Containerization ready via Docker" if has_docker else "Lightweight code structure with minimal initialization friction"
        ],
        "areasRequiringImprovement": [
            "Establish automated unit and regression testing suite" if not has_tests else "Expand test coverage to include end-to-end integration tests",
            "Add a .env.example template to ensure secure secret management",
            "Introduce GitHub Actions CI/CD to verify pull requests and build status automatically"
        ],
        "technicalIssues": [
            "Regression risk: absence of automated testing in repository root" if not has_tests else "Need stress and benchmark performance tests",
            "Environment portability risk: missing Docker containerization" if not has_docker else "Container image lacks multi-stage caching optimization",
            "Centralized error handling and input schema validation needed"
        ],
        "innovationPotential": f"Solid hackathon and academic premise. With reliable CI/CD and user testing, {repo.get('name')} can transition from a student prototype into a production-grade portfolio piece.",
        "scalabilityAssessment": "Architecture is well-suited for single-tenant demonstration. Multi-user concurrency will require asynchronous workers, persistent cloud storage, and database indexing.",
        "score": {
            "overall": overall,
            "functionality": func_score,
            "codeQuality": code_score,
            "documentation": doc_score,
            "innovation": innov_score,
            "userExperience": ux_score,
            "scalability": scale_score
        },
        "maturity": maturity,
        "recommendedNextStep": "Create a smoke test suite and environment configuration template (.env.example) before adding new features.",
        "assumptions": [
            f"Assumed {primary_lang} is the primary target runtime based on GitHub repository language distribution",
            "Assumed no formal CI/CD pipeline exists based on absence of .github workflows in root"
        ],
        "_engine": "heuristic"
    }

# =========================================================================
# Module 2: Principal Software Architect
# =========================================================================
def analyze_module2(repo: Dict[str, Any]) -> Dict[str, Any]:
    persona = MODULE_PERSONAS["module2"]
    user_context = format_repo_context(repo)
    
    # Try Groq API first
    result = _call_groq_json(persona["system_prompt"], user_context)
    if result and "comparisonTable" in result and "categoryRecommendations" in result:
        result["_engine"] = f"groq:{get_active_model()}"
        return result
        
    return _heuristic_module2(repo)

def _heuristic_module2(repo: Dict[str, Any]) -> Dict[str, Any]:
    detected = repo.get("detectedStack", {})
    primary_lang = repo.get("language") or "JavaScript"
    is_python = "python" in primary_lang.lower()
    is_js_ts = any(k in primary_lang.lower() for k in ["javascript", "typescript"])
    
    current_fe = ", ".join(detected.get("frontend", [])) or "Web Templates / UI"
    current_be = ", ".join(detected.get("backend", [])) or (f"{primary_lang} Scripts")
    current_db = ", ".join(detected.get("database", [])) or "Local Storage / SQLite"
    
    table_rows = [
        {
            "currentTech": current_fe,
            "recommendedTech": "Keep the existing technology (React / Vite)" if is_js_ts else "Vite + React or Next.js",
            "why": "Keep existing technology: strong ecosystem velocity and component reusability." if is_js_ts else "Provides faster student build velocity and effortless edge deployment.",
            "priority": "Medium",
            "action": "keep" if is_js_ts else "upgrade"
        },
        {
            "currentTech": current_be,
            "recommendedTech": "Keep the existing technology (FastAPI / Python)" if is_python else "Node.js (Hono or Express)",
            "why": "Keep existing technology: native async performance and automated OpenAPI documentation." if is_python else "Non-blocking event loop with low runtime memory footprint.",
            "priority": "High",
            "action": "keep"
        },
        {
            "currentTech": current_db,
            "recommendedTech": "PostgreSQL (Supabase or Neon Serverless)",
            "why": "ACID compliance, relational integrity, serverless free tiers, and seamless row-level security.",
            "priority": "High",
            "action": "upgrade"
        },
        {
            "currentTech": "Hardcoded Configuration",
            "recommendedTech": "Pydantic / Zod Schema Validation + .env",
            "why": "Prevents runtime crashes caused by missing environment variables and protects API keys.",
            "priority": "High",
            "action": "add"
        },
        {
            "currentTech": "Manual Testing" if not detected.get("hasTests") else "Unit Test Runner",
            "recommendedTech": "Pytest + GitHub Actions CI" if is_python else "Vitest + Playwright",
            "why": "Automated verification ensures new post-hackathon changes do not break core functionality.",
            "priority": "High",
            "action": "add"
        }
    ]
    
    categories = [
        {"category": "Frontend", "current": current_fe, "recommended": "Vite + React" if not is_js_ts else "Keep existing setup, add strict TypeScript", "why": "Fast HMR and component modularity.", "tradeoffs": "None; minimal migration friction.", "action": "keep" if is_js_ts else "upgrade"},
        {"category": "Backend", "current": current_be, "recommended": "FastAPI (Python)" if is_python else "Node.js / Express", "why": "High async throughput and clean routing.", "tradeoffs": "Requires structured controllers.", "action": "keep"},
        {"category": "Database", "current": current_db, "recommended": "Managed PostgreSQL (Supabase / Neon)", "why": "Free student tier with automatic backups and SQL integrity.", "tradeoffs": "Requires migrations setup.", "action": "upgrade"},
        {"category": "Authentication", "current": "None / Unauthenticated", "recommended": "Clerk or Supabase Auth", "why": "Ready-to-use OAuth and JWT session handling without rolling custom crypto.", "tradeoffs": "External service dependency.", "action": "add"},
        {"category": "Cloud & Deployment", "current": "Localhost execution", "recommended": "Frontend on Vercel, Backend on Render", "why": "Instant git-push deployments with free SSL certificates.", "tradeoffs": "Free tier sleep on inactivity.", "action": "add"},
        {"category": "Testing", "current": "No automated tests" if not detected.get("hasTests") else "Basic tests", "recommended": "Pytest / Vitest with CI automation", "why": "Guarantees regression-free iterations.", "tradeoffs": "Requires upfront time investment.", "action": "add"},
        {"category": "AI Integration", "current": ", ".join(detected.get("aiMl", [])) or "None detected", "recommended": "Groq Python SDK with Structured JSON Schemas", "why": "Sub-second inference speeds and guaranteed schema parsing.", "tradeoffs": "Requires API key budgeting.", "action": "keep" if detected.get("aiMl") else "add"},
        {"category": "Security", "current": "Development defaults", "recommended": "CORS origin restriction and Helmet security headers", "why": "Defends against cross-origin abuse and credential leakage.", "tradeoffs": "Must whitelist explicit frontend origins.", "action": "add"},
        {"category": "DevOps", "current": "Manual setup", "recommended": "GitHub Actions CI pipeline for linting & tests", "why": "Catches breaking syntax errors before merging code.", "tradeoffs": "Adds 1-2 minute build check on pull requests.", "action": "add"},
        {"category": "Architecture", "current": "Monolithic script", "recommended": "Layered Modular Architecture (Controllers -> Services -> Data Access)", "why": "Enables multiple students to collaborate without git merge conflicts.", "tradeoffs": "Slightly more boilerplate files.", "action": "upgrade"}
    ]
    
    return {
        "existingAudit": {
            "frontend": current_fe,
            "backend": current_be,
            "database": current_db,
            "apis": "REST JSON endpoints",
            "authentication": "Unauthenticated or prototype tokens",
            "hosting": "Local machine (localhost)",
            "testing": "Unit tests detected" if detected.get("hasTests") else "No automated tests detected",
            "aiMl": ", ".join(detected.get("aiMl", [])) or "None detected"
        },
        "comparisonTable": table_rows,
        "categoryRecommendations": categories,
        "minimumTechnologyUpgrade": {
            "summary": "Pragmatic upgrades achievable in 1-2 weekends without rewriting core logic.",
            "steps": [
                "Add a .env.example file and move all secrets out of code.",
                "Install Pytest or Vitest and create 3 smoke tests covering the main user workflow.",
                "Connect a free managed PostgreSQL database via Supabase or Neon.",
                "Deploy frontend to Vercel and backend to Render."
            ],
            "estimatedEffort": "8 - 14 hours total"
        },
        "futureTechnologyUpgrade": {
            "summary": "Production-ready architecture designed for 10,000+ users.",
            "steps": [
                "Adopt strict TypeScript / Pydantic v2 schemas across all boundaries.",
                "Add Redis caching for frequent database reads.",
                "Deploy multi-stage Docker containers to Google Cloud Run or AWS ECS.",
                "Set up Sentry error monitoring and observability."
            ],
            "estimatedEffort": "4 - 6 weeks part-time"
        },
        "architectAdvice": "Resist the urge to rewrite everything in the newest framework. The hackathon prototype has momentum—focus on persistent cloud storage, automated tests, and a live public URL.",
        "_engine": "heuristic"
    }

# =========================================================================
# Module 3: Startup Incubation & Innovation Mentor
# =========================================================================
def analyze_module3(repo: Dict[str, Any]) -> Dict[str, Any]:
    persona = MODULE_PERSONAS["module3"]
    user_context = format_repo_context(repo)
    
    # Try Groq API first
    result = _call_groq_json(persona["system_prompt"], user_context)
    if result and "mustHave" in result and "shouldHave" in result:
        result["_engine"] = f"groq:{get_active_model()}"
        return result
        
    return _heuristic_module3(repo)

def _heuristic_module3(repo: Dict[str, Any]) -> Dict[str, Any]:
    primary_lang = repo.get("language") or "Software"
    topics = repo.get("topics", [])
    
    must_have = [
        {
            "id": "exp-1",
            "who": "Senior Technical Peer / Graduate Mentor",
            "category": "MUST HAVE",
            "whyNeeded": f"The prototype has solid foundational code in {primary_lang}, but requires code review to clean up hackathon shortcuts.",
            "whatHelpTheyCanProvide": "Perform code reviews, identify unhandled errors, and recommend clean module boundaries.",
            "whenToApproach": "Immediately (Week 1) before introducing new features.",
            "priority": "High",
            "iconName": "Code2"
        },
        {
            "id": "exp-2",
            "who": "Target End-User / Student Tester Cohort",
            "category": "MUST HAVE",
            "whyNeeded": "Hackathon prototypes are built under sprint pressure and need real feedback from non-developers.",
            "whatHelpTheyCanProvide": "Test the primary onboarding flow without developer assistance and identify confusing UX dead-ends.",
            "whenToApproach": "Within the first 14 days, as soon as a live deployment link is available.",
            "priority": "High",
            "iconName": "Users"
        }
    ]
    
    should_have = [
        {
            "id": "exp-3",
            "who": "College Innovation & Incubation Cell (IIC / E-Cell)",
            "category": "SHOULD HAVE",
            "whyNeeded": "University incubation cells provide institutional backing, free cloud credit grants, and project continuation stipends.",
            "whatHelpTheyCanProvide": "Access to student entrepreneurship grants, faculty mentorship credits, and letters of recommendation.",
            "whenToApproach": "During Month 2 once the MVP has demonstrated stable live usage.",
            "priority": "Medium",
            "iconName": "GraduationCap"
        },
        {
            "id": "exp-4",
            "who": "UI/UX Student Designer",
            "category": "SHOULD HAVE",
            "whyNeeded": "Engineers build functional layouts, but visual polish and mobile responsiveness elevate credibility.",
            "whatHelpTheyCanProvide": "Create a lightweight Figma design system, standardize color palettes, and design responsive mobile layouts.",
            "whenToApproach": "Weeks 3 to 5 when core functionality is stabilized.",
            "priority": "Medium",
            "iconName": "Palette"
        }
    ]
    
    nice_to_have = [
        {
            "id": "exp-5",
            "who": "Open Source Community Contributors",
            "category": "NICE TO HAVE",
            "whyNeeded": "External contributors help maintain dependencies and fix edge-case bugs once repository hygiene is established.",
            "whatHelpTheyCanProvide": "Submit pull requests for 'good first issue' labels and test across different OS platforms.",
            "whenToApproach": "Month 3 after publishing CONTRIBUTING.md and issue templates.",
            "priority": "Low",
            "iconName": "GitPullRequest"
        },
        {
            "id": "exp-6",
            "who": "Domain Subject Matter Specialist (Industry Partner)",
            "category": "NICE TO HAVE",
            "whyNeeded": f"Validates whether the problem-solution fit aligns with real commercial sector workflows in '{', '.join(topics) or 'the target sector'}'.",
            "whatHelpTheyCanProvide": "Provide real-world pilot feedback, identify regulatory/compliance standards, and explore future sponsorship.",
            "whenToApproach": "Month 3 when preparing for public pilot testing.",
            "priority": "Low",
            "iconName": "Briefcase"
        }
    ]
    
    return {
        "projectNeedsSummary": {
            "technical": f"Code review and refactoring for {primary_lang} modules, database migrations, and CI pipeline setup.",
            "domain": f"Validation of problem assumptions against the target market ({', '.join(topics) or 'end-user workflows'}).",
            "business": "Structuring a sustainable value proposition and non-profit or student venture roadmap.",
            "testing": "Usability testing sessions with 5-10 real users to discover navigational friction.",
            "deployment": "Moving from local environment to persistent cloud hosting with continuous deployment.",
            "industry": "Feedback from domain practitioners to explore pilot deployment potential.",
            "fundingIncubation": "Securing university incubator seed grants and student cloud credits.",
            "community": "Establishing open-source contribution guidelines to invite fellow student contributors."
        },
        "mustHave": must_have,
        "shouldHave": should_have,
        "niceToHave": nice_to_have,
        "mentorGuidance": "When approaching mentors or incubation cells, do not ask 'Can you look at my project?'. Instead, say: 'We built this prototype, deployed it live here, and have identified 2 specific technical hurdles in our architecture. Could we get 15 minutes of your guidance on solving these specific issues?' Specific questions get immediate responses.",
        "_engine": "heuristic"
    }

# =========================================================================
# Module 4: Product Growth & Innovation Strategist
# =========================================================================
def analyze_module4(repo: Dict[str, Any]) -> Dict[str, Any]:
    persona = MODULE_PERSONAS["module4"]
    user_context = format_repo_context(repo)
    
    # Try Groq API first
    result = _call_groq_json(persona["system_prompt"], user_context)
    if result and "thirtyDayPlan" in result and "top5Actions" in result:
        result["_engine"] = f"groq:{get_active_model()}"
        return result
        
    return _heuristic_module4(repo)

def _heuristic_module4(repo: Dict[str, Any]) -> Dict[str, Any]:
    primary_lang = repo.get("language") or "Software"
    has_tests = repo.get("detectedStack", {}).get("hasTests", False)
    
    top5 = [
        {
            "number": 1,
            "title": "Deploy to a Public URL & Eliminate Localhost Dependency",
            "description": "Host your frontend on Vercel/Cloudflare and backend on Render so anyone can test your project with a single click without installing dependencies.",
            "impact": "Immediate 10x boost in project visibility and shareability."
        },
        {
            "number": 2,
            "title": "Replace Mock Data with a Persistent Cloud Database",
            "description": "Connect a free PostgreSQL database (Supabase or Neon) so user actions and data survive browser refreshes and server restarts.",
            "impact": "Transforms a visual mock into a functional application."
        },
        {
            "number": 3,
            "title": "Establish a Baseline Automated Test Suite",
            "description": f"Write 3 to 5 automated unit tests in {primary_lang} covering your most critical user journey.",
            "impact": "Prevents regressions and gives you confidence to add features without breaking existing code."
        },
        {
            "number": 4,
            "title": "Conduct 5 Recorded User Testing Sessions",
            "description": "Watch 5 fellow students try to accomplish the project's primary goal without explaining anything. Write down every moment they hesitate or click the wrong button.",
            "impact": "Uncovers the real UX flaws that developers are blind to."
        },
        {
            "number": 5,
            "title": "Draft a Clear Problem/Solution Showcase README",
            "description": "Add a 60-second Loom demo video link, architecture diagram, live demo badge, and step-by-step contribution instructions to your GitHub repository.",
            "impact": "Makes your repository stand out to recruiters, hackathon judges, and open-source contributors."
        }
    ]
    
    thirty_day = {
        "title": "Phase 1: Stabilization & Public Availability",
        "days": 30,
        "objective": "Transform the raw hackathon prototype into a stable, deployed, zero-friction web application that works consistently for any visitor.",
        "tasks": [
            "Clean up codebase: remove console.logs, commented-out dead code, and temporary mock files.",
            "Create .env.example and sanitize hardcoded secrets or API tokens.",
            "Deploy frontend and backend to free-tier cloud hosting with automatic git deployment.",
            "Verify all existing tests pass on GitHub Actions" if has_tests else "Create 3 smoke tests verifying core API endpoints.",
            "Record a concise 90-second video demo walkthrough and embed it at the top of your GitHub README."
        ],
        "deliverable": "A live, publicly accessible URL with automated deployment and a clean GitHub README."
    }
    
    sixty_day = {
        "title": "Phase 2: Validation & Usability Refinement",
        "days": 60,
        "objective": "Test the application with 15-20 real users, gather concrete feedback, and implement top requested improvements.",
        "tasks": [
            "Onboard 10-15 target users (classmates, club members) to use the tool.",
            "Log usability blockers and prioritize the top 3 UX friction points.",
            "Integrate production error monitoring (e.g. Sentry free tier) to catch live crashes.",
            "Implement authentication (Clerk or Supabase) to allow individual user accounts and saved history.",
            "Optimize database queries and API response times for smooth user interaction."
        ],
        "deliverable": "An authenticated, user-tested MVP with active student pilot usage and telemetry."
    }
    
    ninety_day = {
        "title": "Phase 3: Ecosystem Expansion & Continuity",
        "days": 90,
        "objective": "Transition the project from an individual student repository into a sustainable community project or university incubation venture.",
        "tasks": [
            "Submit the validated project to your college Innovation & Incubation Cell (IIC) or student grant program.",
            "Publish a comprehensive CONTRIBUTING.md and label beginner-friendly issues to onboard fellow students.",
            "Present project outcomes to college department heads or student clubs as an adopted internal tool.",
            "Write a technical case study / blog post detailing architectural lessons learned.",
            "Set up a standing maintenance schedule (1 hour weekly) to review pull requests and update dependencies."
        ],
        "deliverable": "Institutional adoption, open-source contributors, or formal incubation milestone."
    }
    
    roadmap = [
        {"id": "road-1", "phase": "NOW", "title": "Fix Deployment & Storage Foundations", "description": "Get off localhost. Deploy to free cloud hosting and link serverless PostgreSQL.", "targetDays": "Days 1 - 14", "keyAction": "Push live Vercel/Render URLs and sanitize environment variables.", "badge": "Immediate Priority"},
        {"id": "road-2", "phase": "NOW", "title": "Test Core Journey with 5 Users", "description": "Observe non-developer peers navigating the app to catch glaring UX flaws.", "targetDays": "Days 15 - 30", "keyAction": "Document 5 user friction points and fix top 2.", "badge": "Foundational"},
        {"id": "road-3", "phase": "NEXT", "title": "Implement Authentication & State Retention", "description": "Allow users to log in, save their preferences, and resume their work.", "targetDays": "Days 31 - 60", "keyAction": "Integrate Clerk or Supabase Auth with secure session cookies.", "badge": "Core Feature"},
        {"id": "road-4", "phase": "NEXT", "title": "Automated CI/CD Quality Gateways", "description": "Ensure pull requests must pass linter and test suites before merging.", "targetDays": "Days 45 - 60", "keyAction": "Add GitHub Actions check for build and test commands.", "badge": "Engineering Hygiene"},
        {"id": "road-5", "phase": "LATER", "title": "Campus / Community Pilot Rollout", "description": "Offer the tool to a student organization, lab, or academic course as a formal pilot.", "targetDays": "Days 61 - 90", "keyAction": "Conduct a 2-week active pilot and measure repeat usage.", "badge": "Adoption"},
        {"id": "road-6", "phase": "LATER", "title": "Institutional Incubation Application", "description": "Present traction and pilot data to university E-Cell or student grants for continued funding.", "targetDays": "Days 75 - 90+", "keyAction": "Submit pitch deck and live demo to campus incubator.", "badge": "Sustainability"}
    ]
    
    return {
        "currentStage": "Functional Prototype / Early MVP" if (repo.get("stars", 0) > 10 or has_tests) else "Hackathon Sprint Prototype",
        "biggestBlockers": [
            "Lack of public deployment makes sharing and testing cumbersome for external reviewers.",
            "Limited edge-case test coverage leaves code susceptible to regressions during updates." if has_tests else "Zero automated tests leaves code susceptible to regressions during updates.",
            "Unstructured feedback loop: no systematic method to collect bug reports or feature requests from pilot users."
        ],
        "mostImportantImprovements": [
            "Migrate from local persistence to a cloud-hosted database (e.g. Supabase / PostgreSQL).",
            "Implement user session authentication so people can save their progress.",
            "Improve responsive layout so the app works seamlessly on mobile devices."
        ],
        "targetUsers": [
            "Undergraduate and graduate students seeking automated productivity tooling",
            "Campus clubs, hackathon organizers, and academic laboratory researchers",
            "Junior developers exploring open-source portfolio projects"
        ],
        "realWorldUseCases": [
            f"Automating student workflows using {primary_lang} routines",
            "Demonstration benchmark for academic coursework or capstone project submission",
            "Modular base template for future student developer hackathons"
        ],
        "pilotOpportunities": [
            "Pilot with 15 classmates in a relevant computer science or engineering elective course",
            "Partner with a college student tech club (ACM, IEEE, GDSC) for interactive workshop testing",
            "Post on student developer Discord communities for beta testers"
        ],
        "validationStrategy": "Deploy the application live, invite 20 target users to complete a specific task, and measure task completion rate without intervention.",
        "longTermPossibilities": "If validated with consistent student usage, this project can evolve into a recognized open-source tool or university incubation venture.",
        "top5Actions": top5,
        "thirtyDayPlan": thirty_day,
        "sixtyDayPlan": sixty_day,
        "ninetyDayPlan": ninety_day,
        "roadmap": roadmap,
        "_engine": "heuristic"
    }

# =========================================================================
# Master Orchestrator (Reuses the 4 module services without code duplication)
# =========================================================================
def analyze_all(repo: Dict[str, Any]) -> Dict[str, Any]:
    """Runs all four modules by delegating to each individual module service."""
    return {
        "repoDetails": repo,
        "analyzerResult": analyze_module1(repo),
        "techAdvisorResult": analyze_module2(repo),
        "expertFinderResult": analyze_module3(repo),
        "plannerResult": analyze_module4(repo)
    }
