import React, { useState } from 'react';
import { UserCheck, Code, Sparkles } from 'lucide-react';
import type { PersonaInfo, RepoDetails } from '../../types';
import { PromptModal } from './PromptModal';
import { buildPromptContext } from '../../services/promptService';

interface PersonaBannerProps {
  persona: PersonaInfo;
  repoDetails: RepoDetails | null;
}

export const PersonaBanner: React.FC<PersonaBannerProps> = ({
  persona,
  repoDetails
}) => {
  const [showPromptModal, setShowPromptModal] = useState(false);

  const promptData = repoDetails
    ? buildPromptContext(repoDetails, persona.id)
    : {
        systemPrompt: persona.systemPrompt,
        userPrompt: 'No repository loaded yet. Provide a GitHub URL to inject repository context.'
      };

  return (
    <>
      <div className="persona-banner">
        <div className="persona-left">
          <div className="persona-avatar">
            <UserCheck size={22} />
          </div>
          <div className="persona-info">
            <div className="persona-label-row">
              <span className="persona-tag">
                <Sparkles size={11} style={{ marginRight: 4 }} />
                Active AI Persona
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {persona.experience}
              </span>
            </div>
            <div className="persona-title">{persona.title}</div>
            <div className="persona-experience">{persona.subtitle}</div>
            <div className="persona-quote">"{persona.description}"</div>
          </div>
        </div>

        <button
          onClick={() => setShowPromptModal(true)}
          className="view-prompt-btn"
          title="Inspect the exact system prompt and context injected into this persona"
        >
          <Code size={14} />
          <span>Inspect Persona Prompt</span>
        </button>
      </div>

      {showPromptModal && (
        <PromptModal
          title={`Persona System Prompt: ${persona.title}`}
          persona={persona}
          systemPrompt={promptData.systemPrompt}
          userPrompt={promptData.userPrompt}
          onClose={() => setShowPromptModal(false)}
        />
      )}
    </>
  );
};
