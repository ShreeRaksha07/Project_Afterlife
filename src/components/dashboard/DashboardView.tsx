import React from 'react';
import {
  SearchCode,
  Layers,
  Users2,
  Rocket,
  ArrowRight
} from 'lucide-react';
import type { ModuleId, RepoDetails } from '../../types';
import { RepoUrlInput } from '../common/RepoUrlInput';

interface DashboardViewProps {
  onSelectModule: (module: ModuleId) => void;
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  repoDetails: RepoDetails | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectModule,
  currentUrl,
  onAnalyze,
  isLoading,
  repoDetails
}) => {
  const moduleCards = [
    {
      id: 'analyzer' as ModuleId,
      icon: SearchCode,
      name: 'Project Analyzer',
      shortName: 'Analyze My Project',
      iconEmoji: '🔍',
      persona: 'Senior Software Project Reviewer',
      description:
        'Comprehensive 100-point project evaluation, code maturity classification, architecture audit, strengths, and labeled gaps.',
      color: 'var(--primary)',
      bg: 'var(--bg-lavender)'
    },
    {
      id: 'techAdvisor' as ModuleId,
      icon: Layers,
      name: 'Technology Advisor',
      shortName: 'Improve My Tech Stack',
      iconEmoji: '🛠️',
      persona: 'Principal Software Architect',
      description:
        'Comparative technology audit with explicit "keep vs upgrade" guidance, trade-offs, and Minimum vs Future Technology Upgrades.',
      color: 'var(--accent-blue)',
      bg: '#eff6ff'
    },
    {
      id: 'expertFinder' as ModuleId,
      icon: Users2,
      name: 'Expert & Support Finder',
      shortName: 'Find The Help I Need',
      iconEmoji: '🤝',
      persona: 'Startup Incubation & Innovation Mentor',
      description:
        'Categorized ecosystem support (Must Have, Should Have, Nice to Have) connecting you with technical mentors, incubation cells, and pilot users.',
      color: 'var(--accent-emerald)',
      bg: '#ecfdf5'
    },
    {
      id: 'afterlifePlanner' as ModuleId,
      icon: Rocket,
      name: 'Afterlife Planner',
      shortName: "Plan My Project's Afterlife",
      iconEmoji: '🚀',
      persona: 'Product Growth & Innovation Strategist',
      description:
        'Pragmatic 30-Day, 60-Day, and 90-Day execution plans with Top 5 Actions and an interactive Now/Next/Later roadmap.',
      color: 'var(--accent-amber)',
      bg: '#fffbeb'
    }
  ];

  return (
    <div>
      {/* GitHub Repository Input */}
      <RepoUrlInput
        currentUrl={currentUrl}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        moduleTitle="All Modules"
      />

      {/* Active Repo Confirmation if loaded */}
      {repoDetails && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-lavender)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-purple">Active Repository Loaded</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {repoDetails.fullName}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4 }}>
              Primary Language: <strong>{repoDetails.language}</strong> • Stars: <strong>{repoDetails.stars}</strong> • Open Issues: <strong>{repoDetails.openIssues}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onSelectModule('analyzer')}
              className="analyze-btn"
              style={{ padding: '8px 14px', height: 'auto', fontSize: '12px' }}
            >
              <span>Explore Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Workflow Section: ANALYZE -> IMPROVE -> CONNECT -> REVIVE */}
      <div className="workflow-section">
        <div className="workflow-title-row">
          <span className="workflow-heading">The Afterlife Methodology</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>4-Phase Progression</span>
        </div>

        <div className="workflow-track">
          <div className="workflow-step active">
            <div className="workflow-step-num">1</div>
            <div className="workflow-step-name">ANALYZE</div>
            <div className="workflow-step-sub">Evaluate code & documentation</div>
          </div>
          <div className="workflow-arrow">→</div>

          <div className="workflow-step">
            <div className="workflow-step-num">2</div>
            <div className="workflow-step-name">IMPROVE</div>
            <div className="workflow-step-sub">Upgrade architecture pragmatically</div>
          </div>
          <div className="workflow-arrow">→</div>

          <div className="workflow-step">
            <div className="workflow-step-num">3</div>
            <div className="workflow-step-name">CONNECT</div>
            <div className="workflow-step-sub">Find incubation & mentors</div>
          </div>
          <div className="workflow-arrow">→</div>

          <div className="workflow-step">
            <div className="workflow-step-num">4</div>
            <div className="workflow-step-name">REVIVE</div>
            <div className="workflow-step-sub">Execute 30/60/90-day roadmap</div>
          </div>
        </div>
      </div>

      {/* 4 Module Cards */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Persona-Driven Modules
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Select any module to inspect your project from a dedicated expert perspective.
        </p>
      </div>

      <div className="grid-2">
        {moduleCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.bg,
                      color: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: card.color,
                      background: card.bg,
                      padding: '3px 8px',
                      borderRadius: 10
                    }}
                  >
                    {card.persona.split(' ')[0]} Persona
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {card.name}
                </h3>

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Persona: {card.persona}
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {card.description}
                </p>
              </div>

              <button
                onClick={() => onSelectModule(card.id)}
                className="analyze-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  background: card.color,
                  marginTop: 'auto'
                }}
              >
                <span>Analyze Project</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
