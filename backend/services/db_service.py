import logging
import re
from typing import Dict, Any, List, Optional
from models import Project, Analysis
from database import get_db_session, get_engine

logger = logging.getLogger("project_afterlife.db_service")

def save_analysis_record(
    repo_data: Dict[str, Any],
    module_name: str,
    analysis_result: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Saves a GitHub repository and its AI analysis result to Neon PostgreSQL.
    
    Guarantees fault-tolerance: if the database is unreachable or misconfigured,
    it catches the error, logs it securely, and returns None so the live AI analysis
    is returned to the user without interruption.
    """
    if get_engine() is None:
        logger.info("[DB] Database not configured; skipping persistence.")
        return None

    raw_url = repo_data.get("url") or repo_data.get("html_url") or repo_data.get("github_url") or ""
    clean_url = str(raw_url).strip()
    if not clean_url:
        logger.warning("[DB] Cannot save analysis without a valid GitHub URL.")
        return None

    repo_name = (
        repo_data.get("fullName")
        or repo_data.get("full_name")
        or repo_data.get("name")
        or clean_url.split("/")[-1]
    )
    description = repo_data.get("description")
    language = repo_data.get("language")

    try:
        with get_db_session() as session:
            # 1. Find existing project or create new one
            project = session.query(Project).filter_by(github_url=clean_url).first()
            if not project:
                project = Project(
                    github_url=clean_url,
                    repository_name=repo_name,
                    description=description,
                    language=language
                )
                session.add(project)
                session.flush()  # Populates project.id
            else:
                # Update metadata if newer details available
                project.repository_name = repo_name
                if description:
                    project.description = description
                if language:
                    project.language = language

            # 2. Insert analysis record
            analysis = Analysis(
                project_id=project.id,
                module_name=module_name,
                analysis_result=analysis_result
            )
            session.add(analysis)
            session.flush()

            logger.info(
                f"[DB] Successfully saved analysis id={analysis.id} for project id={project.id} "
                f"('{project.repository_name}') into Neon PostgreSQL."
            )
            return {
                "project_id": project.id,
                "analysis_id": analysis.id,
                "repository_name": project.repository_name,
                "module_name": analysis.module_name,
                "created_at": analysis.created_at.isoformat() if analysis.created_at else None
            }

    except Exception as e:
        sanitized = re.sub(r":\/\/[^:]+:[^@]+@", "://***:***@", str(e))
        logger.warning(f"[DB FAULT-TOLERANCE] Could not persist analysis to Neon: {sanitized}")
        return None

def get_all_projects_history(limit: int = 50) -> List[Dict[str, Any]]:
    """
    Retrieves a list of saved projects and their latest analyses.
    """
    if get_engine() is None:
        return []

    try:
        with get_db_session() as session:
            projects = (
                session.query(Project)
                .order_by(Project.created_at.desc())
                .limit(limit)
                .all()
            )
            result = []
            for p in projects:
                p_dict = p.to_dict(include_analyses=False)
                # Include latest analysis preview
                latest_analysis = (
                    session.query(Analysis)
                    .filter_by(project_id=p.id)
                    .order_by(Analysis.created_at.desc())
                    .first()
                )
                if latest_analysis:
                    p_dict["latest_analysis"] = {
                        "id": latest_analysis.id,
                        "module_name": latest_analysis.module_name,
                        "created_at": latest_analysis.created_at.isoformat() if latest_analysis.created_at else None,
                        "overall_score": latest_analysis.analysis_result.get("score", {}).get("overall")
                        if isinstance(latest_analysis.analysis_result, dict) else None,
                        "maturity": latest_analysis.analysis_result.get("maturity")
                        if isinstance(latest_analysis.analysis_result, dict) else None,
                    }
                result.append(p_dict)
            return result
    except Exception as e:
        sanitized = re.sub(r":\/\/[^:]+:[^@]+@", "://***:***@", str(e))
        logger.error(f"[DB ERROR] Error fetching project history: {sanitized}")
        return []

def get_project_by_id_or_url(identifier: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves full details and historical analyses for a project by numeric ID or GitHub URL.
    """
    if get_engine() is None:
        return None

    try:
        with get_db_session() as session:
            project = None
            if identifier.isdigit():
                project = session.query(Project).filter_by(id=int(identifier)).first()
            if not project:
                project = session.query(Project).filter_by(github_url=identifier.strip()).first()

            if not project:
                return None

            return project.to_dict(include_analyses=True)
    except Exception as e:
        sanitized = re.sub(r":\/\/[^:]+:[^@]+@", "://***:***@", str(e))
        logger.error(f"[DB ERROR] Error fetching project: {sanitized}")
        return None

def delete_project_records_by_url(url: str) -> int:
    """
    Deletes project records matching a specific URL (useful for test cleanup).
    Returns count of deleted projects.
    """
    if get_engine() is None:
        return 0

    try:
        with get_db_session() as session:
            projects = session.query(Project).filter_by(github_url=url).all()
            count = len(projects)
            for p in projects:
                session.delete(p)
            return count
    except Exception as e:
        logger.warning(f"[DB] Error deleting test records: {e}")
        return 0
