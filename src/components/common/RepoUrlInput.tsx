import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { validateGithubUrl } from '../../services/githubService';
import { GithubIcon } from './GithubIcon';

interface RepoUrlInputProps {
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  moduleTitle?: string;
}

export const RepoUrlInput: React.FC<RepoUrlInputProps> = ({
  currentUrl,
  onAnalyze,
  isLoading,
  moduleTitle
}) => {
  const [inputValue, setInputValue] = useState(currentUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setInputValue(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);

    const validation = validateGithubUrl(inputValue);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter a valid GitHub repository URL.');
      return;
    }

    setErrorMessage(null);
    onAnalyze(inputValue.trim());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (errorMessage && hasInteracted) {
      const check = validateGithubUrl(val);
      if (check.valid || val.trim().length === 0) {
        setErrorMessage(null);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      const validation = validateGithubUrl(inputValue);
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Please enter a valid GitHub repository URL.');
      }
    }
  };

  return (
    <div className="repo-input-card">
      <div className="repo-input-header">
        <label htmlFor="repo-url-input" className="repo-input-label">
          <GithubIcon size={16} />
          <span>GitHub Repository URL</span>
          {moduleTitle && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400 }}>
              (for {moduleTitle})
            </span>
          )}
        </label>
        <span className="repo-input-hint">Public repository required</span>
      </div>

      <form onSubmit={handleSubmit} className="repo-input-form" noValidate>
        <div className="repo-input-field-wrapper">
          <GithubIcon size={18} className="repo-input-icon" />
          <input
            id="repo-url-input"
            type="url"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="https://github.com/username/project-name"
            className={`repo-input-field ${errorMessage ? 'has-error' : ''}`}
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={errorMessage ? 'true' : 'false'}
            aria-describedby={errorMessage ? 'repo-input-error' : undefined}
          />
          {errorMessage && (
            <div id="repo-input-error" className="repo-input-error" role="alert">
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="analyze-btn"
          disabled={isLoading}
          aria-label="Analyze Repository"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="loading-spinner-ring" style={{ width: 16, height: 16, margin: 0, borderWidth: 2 }} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Repository</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
