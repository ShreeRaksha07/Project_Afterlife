import React from 'react';
import { Sparkles, CheckCircle2, GitBranch } from 'lucide-react';

interface LoadingStateProps {
  repoUrl: string;
  personaTitle: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  repoUrl,
  personaTitle
}) => {
  return (
    <div className="loading-box">
      <div className="loading-spinner-ring" />
      <h3 className="loading-title">Analyzing Repository</h3>
      <p className="loading-step-text">
        Engaging <strong>{personaTitle}</strong> to evaluate <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{repoUrl}</code>...
      </p>

      <div className="loading-steps-list">
        <div className="loading-step-item active">
          <CheckCircle2 size={14} color="var(--primary)" />
          <span>1. GitHub REST API Query</span>
        </div>
        <div className="loading-step-item active">
          <GitBranch size={14} color="var(--primary)" />
          <span>2. Codebase & README Parsing</span>
        </div>
        <div className="loading-step-item active">
          <Sparkles size={14} color="var(--primary)" />
          <span>3. Persona Heuristics & Scoring</span>
        </div>
      </div>
    </div>
  );
};
