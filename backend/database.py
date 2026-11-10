import os
import re
import logging
from contextlib import contextmanager
from typing import Optional, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base
from config import DATABASE_URL

logger = logging.getLogger("project_afterlife.db")

_cached_engine = None
_cached_session_factory = None

def normalize_database_url(raw_url: str) -> str:
    """
    Normalizes a Neon PostgreSQL connection string for SQLAlchemy.
    Converts 'postgres://' or 'postgresql://' to use psycopg2/psycopg driver while
    retaining sslmode=require and all connection parameters.
    """
    if not raw_url:
        return ""
    url = raw_url.strip()

    # Determine available driver (prefer psycopg2 which has verified binary support)
    driver = "psycopg2"
    try:
        import psycopg2
        driver = "psycopg2"
    except ImportError:
        try:
            import psycopg
            driver = "psycopg"
        except ImportError:
            driver = "psycopg2"

    if url.startswith("postgres://"):
        url = url.replace("postgres://", f"postgresql+{driver}://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", f"postgresql+{driver}://", 1)

    return url

def get_engine():
    """
    Retrieves or lazily initializes the SQLAlchemy database engine with connection pooling.
    Uses pool_pre_ping=True to safely handle Neon serverless auto-suspend/reconnect.
    """
    global _cached_engine
    if _cached_engine is not None:
        return _cached_engine

    # Check config or re-read environment
    db_url = os.getenv("DATABASE_URL", DATABASE_URL).strip()
    if not db_url:
        return None

    normalized_url = normalize_database_url(db_url)
    try:
        _cached_engine = create_engine(
            normalized_url,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10
        )
        logger.info("[DB] SQLAlchemy database engine successfully initialized.")
        return _cached_engine
    except Exception as e:
        logger.warning(f"[DB] Could not initialize database engine: {e}")
        return None

def get_session_factory():
    """Returns the SQLAlchemy sessionmaker bound to the current engine."""
    global _cached_session_factory
    if _cached_session_factory is not None:
        return _cached_session_factory

    engine = get_engine()
    if engine is None:
        return None

    _cached_session_factory = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False
    )
    return _cached_session_factory

@contextmanager
def get_db_session():
    """
    Context manager providing a transactional database session.
    Commits on success, rolls back on error, and always closes the session.
    """
    factory = get_session_factory()
    if factory is None:
        raise RuntimeError("Database engine is not configured.")
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def check_db_connectivity() -> Tuple[bool, Optional[str]]:
    """
    Tests live database connectivity using a lightweight query ('SELECT 1').
    Returns (is_connected, error_message).
    Never exposes credentials or connection strings.
    """
    engine = get_engine()
    if engine is None:
        return False, "DATABASE_URL is not configured."

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
            return True, None
    except Exception as e:
        err_msg = str(e)
        # Sanitize error to ensure passwords/tokens are never leaked in logs
        sanitized_err = re.sub(r":\/\/[^:]+:[^@]+@", "://***:***@", err_msg)
        logger.warning(f"[DB] Health check query failed: {sanitized_err}")
        return False, sanitized_err

def init_db() -> bool:
    """
    Creates tables (projects, analyses) safely in the database if they do not exist.
    """
    engine = get_engine()
    if engine is None:
        logger.info("[DB] Skipped table creation: DATABASE_URL not set.")
        return False

    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("[DB] Database tables ('projects', 'analyses') verified / created successfully.")
        return True
    except Exception as e:
        sanitized_err = re.sub(r":\/\/[^:]+:[^@]+@", "://***:***@", str(e))
        logger.error(f"[DB ERROR] Table creation failed: {sanitized_err}")
        return False
