from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Project(Base):
    """
    Table 1: projects
    Stores core metadata for analyzed GitHub repositories.
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    github_url = Column(String(512), nullable=False, index=True)
    repository_name = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    language = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    analyses = relationship(
        "Analysis",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="desc(Analysis.created_at)"
    )

    def to_dict(self, include_analyses: bool = False) -> Dict[str, Any]:
        data = {
            "id": self.id,
            "github_url": self.github_url,
            "repository_name": self.repository_name,
            "description": self.description,
            "language": self.language,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_analyses:
            data["analyses"] = [a.to_dict() for a in self.analyses]
        return data


class Analysis(Base):
    """
    Table 2: analyses
    Stores AI-generated analysis outputs linked to projects.
    """
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    module_name = Column(String(64), nullable=False, index=True)
    analysis_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    project = relationship("Project", back_populates="analyses")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "project_id": self.project_id,
            "module_name": self.module_name,
            "analysis_result": self.analysis_result,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
