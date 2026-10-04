import React from 'react';
import { X, Sparkles, Terminal, FileText, CheckCircle, Shield } from 'lucide-react';
import type { PersonaInfo } from '../../types';

interface PromptModalProps {
  title: string;
  persona: PersonaInfo;
  systemPrompt: string;
  userPrompt: string;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  title,
  persona,
  systemPrompt,
  userPrompt,
  onClose
}) => {
  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 className="modal-title">{title}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ marginBottom: 14, background: 'var(--bg-app)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} color="var(--primary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Assigned Persona: <strong>{persona.title}</strong> ({persona.subtitle})
            </span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 6 }}>
              <Terminal size={15} color="var(--primary)" />
              <span>Persona System Prompt (Role Definition)</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
              This system instruction primes the AI with strict domain constraints, evaluation criteria, and persona tone.
            </p>
            <pre className="code-box">{systemPrompt}</pre>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: 6 }}>
              <FileText size={15} color="var(--accent-blue)" />
              <span>Injected Repository Context & User Prompt</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Extracted live from the user's public GitHub repository API (metadata, languages, directory tree, dependencies, and README).
            </p>
            <pre className="code-box" style={{ maxHeight: '220px' }}>{userPrompt}</pre>
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--bg-lavender)', borderRadius: '8px', border: '1px solid var(--border-lavender)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <CheckCircle size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>Prompt Engineering Architecture:</strong> Every module features a custom-designed persona and tailored prompt schema rather than generic chat completions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
