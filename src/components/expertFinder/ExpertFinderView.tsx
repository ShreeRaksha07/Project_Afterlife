import React, { useState } from 'react';
import {
  Users2,
  GraduationCap,
  Briefcase,
  GitPullRequest,
  Code2,
  Palette,
  Cpu,
  Users,
  HelpCircle,
  Clock
} from 'lucide-react';
import type { ExpertFinderResult, PersonaInfo, RepoDetails, SupportCategory, SupportEntity } from '../../types';
import { RepoUrlInput } from '../common/RepoUrlInput';
import { PersonaBanner } from '../common/PersonaBanner';
import { LoadingState } from '../common/LoadingState';

interface ExpertFinderViewProps {
  persona: PersonaInfo;
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  repoDetails: RepoDetails | null;
  result: ExpertFinderResult | null;
}

export const ExpertFinderView: React.FC<ExpertFinderViewProps> = ({
  persona,
  currentUrl,
  onAnalyze,
  isLoading,
  repoDetails,
  result
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | SupportCategory>('ALL');

  const getEntityIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Code2': return <Code2 size={20} color="var(--primary)" />;
      case 'Users': return <Users size={20} color="var(--accent-blue)" />;
      case 'GraduationCap': return <GraduationCap size={20} color="var(--accent-emerald)" />;
      case 'Palette': return <Palette size={20} color="var(--accent-amber)" />;
      case 'Cpu': return <Cpu size={20} color="var(--primary)" />;
      case 'GitPullRequest': return <GitPullRequest size={20} color="var(--accent-cyan)" />;
      case 'Briefcase': return <Briefcase size={20} color="var(--accent-rose)" />;
      default: return <Users2 size={20} color="var(--primary)" />;
    }
  };

  const allEntities: SupportEntity[] = result
    ? [...result.mustHave, ...result.shouldHave, ...result.niceToHave]
    : [];

  const displayedEntities = allEntities.filter((item) =>
    activeTab === 'ALL' ? true : item.category === activeTab
  );

  return (
    <div>
      {/* Persona Banner */}
      <PersonaBanner persona={persona} repoDetails={repoDetails} />

      {/* GitHub URL Input */}
      <RepoUrlInput
        currentUrl={currentUrl}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        moduleTitle="Expert & Support Finder"
      />

      {isLoading && (
        <LoadingState repoUrl={currentUrl} personaTitle={persona.title} />
      )}

      {!isLoading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users2 size={44} color="var(--accent-emerald)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Support Ecosystem Identified
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Enter your public GitHub repository URL above to discover which mentors, institutional partners, and user communities you should connect with.
          </p>
        </div>
      )}

      {!isLoading && result && (
        <div>
          {/* Mentor Guidance Tip */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-lavender)',
              borderLeft: '5px solid var(--accent-emerald)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-emerald">Incubator Mentor Tip</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>How to Approach Experts</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{result.mentorGuidance}"
            </p>
          </div>

          {/* Project Needs Summary Grid */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h4 className="card-title">
                <HelpCircle size={18} color="var(--primary)" />
                <span>Project Needs Assessment</span>
              </h4>
              <span className="badge badge-purple">Ecosystem Scan</span>
            </div>

            <div className="grid-4" style={{ marginBottom: 0 }}>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Technical Needs</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.technical}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Domain Validation</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.domain}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Business Model</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.business}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>User Testing</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.testing}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Deployment</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.deployment}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Industry Alliances</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.industry}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Grants & E-Cell</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.fundingIncubation}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Community Outreach</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{result.projectNeedsSummary.community}</div>
              </div>
            </div>
          </div>

          {/* Section: Who Can Help? with Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                Who Can Help?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Ecosystem support types categorized by development timeline urgency.
              </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card-muted)', padding: 4, borderRadius: 8 }}>
              <button
                onClick={() => setActiveTab('ALL')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'ALL' ? '#ffffff' : 'transparent',
                  color: activeTab === 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'ALL' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                All Support ({allEntities.length})
              </button>
              <button
                onClick={() => setActiveTab('MUST HAVE')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'MUST HAVE' ? '#ffffff' : 'transparent',
                  color: activeTab === 'MUST HAVE' ? 'var(--accent-rose)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'MUST HAVE' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                🔴 Must Have ({result.mustHave.length})
              </button>
              <button
                onClick={() => setActiveTab('SHOULD HAVE')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'SHOULD HAVE' ? '#ffffff' : 'transparent',
                  color: activeTab === 'SHOULD HAVE' ? 'var(--accent-amber)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'SHOULD HAVE' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                🟡 Should Have ({result.shouldHave.length})
              </button>
              <button
                onClick={() => setActiveTab('NICE TO HAVE')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'NICE TO HAVE' ? '#ffffff' : 'transparent',
                  color: activeTab === 'NICE TO HAVE' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'NICE TO HAVE' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                🟢 Nice To Have ({result.niceToHave.length})
              </button>
            </div>
          </div>

          {/* Support Entity Cards Grid */}
          <div className="grid-2">
            {displayedEntities.map((item) => {
              const isMust = item.category === 'MUST HAVE';
              const isShould = item.category === 'SHOULD HAVE';
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    borderTop: `4px solid ${
                      isMust ? 'var(--accent-rose)' : isShould ? 'var(--accent-amber)' : 'var(--accent-emerald)'
                    }`
                  }}
                >
                  <div className="card-header" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--bg-app)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {getEntityIcon(item.iconName)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.who}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Ecosystem Partner
                        </div>
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        isMust ? 'badge-rose' : isShould ? 'badge-amber' : 'badge-emerald'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Why They Are Needed:
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                        {item.whyNeeded}
                      </p>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        What Help They Can Provide:
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                        {item.whatHelpTheyCanProvide}
                      </p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 4,
                        paddingTop: 10,
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                        <Clock size={13} />
                        <span>When: <strong>{item.whenToApproach}</strong></span>
                      </div>
                      <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                        {item.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ethics & Realism Notice */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <HelpCircle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Note on Mentorship:</strong> This module deliberately identifies support roles, departments, and communities rather than generating synthetic names or contacts. Connect with your campus Innovation Cell or local open-source groups to find mentors matching these exact profiles.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
