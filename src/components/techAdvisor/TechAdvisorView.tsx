import React, { useState } from 'react';
import {
  Layers,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Server,
  Database,
  Lock,
  Cloud,
  TestTube,
  Sparkles,
  GitBranch,
  Terminal
} from 'lucide-react';
import type { PersonaInfo, PriorityLevel, RepoDetails, TechAdvisorResult } from '../../types';
import { RepoUrlInput } from '../common/RepoUrlInput';
import { PersonaBanner } from '../common/PersonaBanner';
import { LoadingState } from '../common/LoadingState';

interface TechAdvisorViewProps {
  persona: PersonaInfo;
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  repoDetails: RepoDetails | null;
  result: TechAdvisorResult | null;
}

export const TechAdvisorView: React.FC<TechAdvisorViewProps> = ({
  persona,
  currentUrl,
  onAnalyze,
  isLoading,
  repoDetails,
  result
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const getPriorityClass = (priority: PriorityLevel) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend': return <Zap size={16} color="var(--primary)" />;
      case 'backend': return <Server size={16} color="var(--accent-blue)" />;
      case 'database': return <Database size={16} color="var(--accent-cyan)" />;
      case 'authentication': return <Lock size={16} color="var(--accent-amber)" />;
      case 'cloud & deployment': return <Cloud size={16} color="var(--accent-blue)" />;
      case 'testing': return <TestTube size={16} color="var(--accent-emerald)" />;
      case 'ai integration': return <Sparkles size={16} color="var(--primary)" />;
      case 'security': return <ShieldCheck size={16} color="var(--accent-rose)" />;
      case 'devops': return <GitBranch size={16} color="var(--accent-cyan)" />;
      default: return <Layers size={16} color="var(--primary)" />;
    }
  };

  const filteredRows = result
    ? result.comparisonTable.filter((r) =>
        filterPriority === 'all' ? true : r.priority.toLowerCase() === filterPriority.toLowerCase()
      )
    : [];

  return (
    <div>
      {/* Persona Banner */}
      <PersonaBanner persona={persona} repoDetails={repoDetails} />

      {/* GitHub URL Input */}
      <RepoUrlInput
        currentUrl={currentUrl}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        moduleTitle="Technology Advisor"
      />

      {isLoading && (
        <LoadingState repoUrl={currentUrl} personaTitle={persona.title} />
      )}

      {!isLoading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Layers size={44} color="var(--accent-blue)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Architectural Advisory Generated
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Provide your GitHub repository URL above to inspect existing technologies and receive reasoned architectural recommendations.
          </p>
        </div>
      )}

      {!isLoading && result && (
        <div>
          {/* Architect Guidance Banner */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-lavender)',
              borderLeft: '5px solid var(--accent-blue)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-blue">Principal Architect Directive</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pragmatic Upgrade Philosophy</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{result.architectAdvice}"
            </p>
          </div>

          {/* Current Tech Audit Grid */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h4 className="card-title">
                <Terminal size={18} color="var(--primary)" />
                <span>Existing Architecture Audit</span>
              </h4>
              <span className="badge badge-purple">Inspected Components</span>
            </div>

            <div className="grid-4" style={{ marginBottom: 0 }}>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Frontend</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.frontend}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Backend</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.backend}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Database</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.database}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Authentication</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.authentication}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Hosting</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.hosting}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Testing</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.testing}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>AI / ML</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.aiMl}</div>
              </div>
              <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>APIs</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{result.existingAudit.apis}</div>
              </div>
            </div>
          </div>

          {/* Upgrades Highlights: Minimum Upgrade vs Future Upgrade */}
          <div className="grid-2">
            <div
              className="card"
              style={{
                border: '1px solid #c7d2fe',
                background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)'
              }}
            >
              <div className="card-header">
                <h4 className="card-title" style={{ color: '#4338ca' }}>
                  <Zap size={18} />
                  <span>Minimum Technology Upgrade</span>
                </h4>
                <span className="badge badge-purple">{result.minimumTechnologyUpgrade.estimatedEffort}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 14 }}>
                {result.minimumTechnologyUpgrade.summary}
              </p>
              <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.minimumTechnologyUpgrade.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>

            <div
              className="card"
              style={{
                border: '1px solid #bae6fd',
                background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)'
              }}
            >
              <div className="card-header">
                <h4 className="card-title" style={{ color: '#0369a1' }}>
                  <Cloud size={18} />
                  <span>Future Technology Upgrade</span>
                </h4>
                <span className="badge badge-blue">{result.futureTechnologyUpgrade.estimatedEffort}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 14 }}>
                {result.futureTechnologyUpgrade.summary}
              </p>
              <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.futureTechnologyUpgrade.steps.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technology Comparison Table */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h4 className="card-title">
                <Layers size={18} color="var(--primary)" />
                <span>Technology Comparison Matrix</span>
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filter Priority:</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    background: '#fff'
                  }}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="tech-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Current Technology</th>
                    <th style={{ width: '25%' }}>Recommended Technology</th>
                    <th>Why (Technical Reason & Trade-offs)</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, i) => {
                    const isKeep = row.action === 'keep';
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {row.currentTech}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isKeep ? (
                              <CheckCircle size={15} color="var(--accent-emerald)" />
                            ) : (
                              <ArrowUpRight size={15} color="var(--primary)" />
                            )}
                            <span style={{ fontWeight: 600, color: isKeep ? 'var(--accent-emerald)' : 'var(--primary)' }}>
                              {row.recommendedTech}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {row.why}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`priority-pill ${getPriorityClass(row.priority)}`}>
                            {row.priority}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category-by-Category Recommendations */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Architectural Domain Breakdown
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Detailed rationale and trade-offs for each technical layer of the application.
            </p>
          </div>

          <div className="grid-2">
            {result.categoryRecommendations.map((cat, i) => (
              <div key={i} className="card">
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getCategoryIcon(cat.category)}
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cat.category}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      cat.action === 'keep' ? 'badge-emerald' : cat.action === 'upgrade' ? 'badge-blue' : 'badge-purple'
                    }`}
                  >
                    {cat.action === 'keep' ? 'Keep Suitable' : cat.action === 'upgrade' ? 'Upgrade' : 'Add Component'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Recommendation:
                    </span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 1 }}>
                      {cat.recommended}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Why:
                    </span>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 1 }}>{cat.why}</p>
                  </div>

                  <div style={{ background: 'var(--bg-app)', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--accent-amber)', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Trade-offs:
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: 1 }}>{cat.tradeoffs}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
