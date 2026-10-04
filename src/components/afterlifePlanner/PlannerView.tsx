import React from 'react';
import {
  Rocket,
  Target,
  Compass,
  TrendingUp,
  ShieldAlert,
  Zap
} from 'lucide-react';
import type { PersonaInfo, PlannerResult, RepoDetails } from '../../types';
import { RepoUrlInput } from '../common/RepoUrlInput';
import { PersonaBanner } from '../common/PersonaBanner';
import { LoadingState } from '../common/LoadingState';

interface PlannerViewProps {
  persona: PersonaInfo;
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  repoDetails: RepoDetails | null;
  result: PlannerResult | null;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  persona,
  currentUrl,
  onAnalyze,
  isLoading,
  repoDetails,
  result
}) => {
  const filterPhaseItems = (phase: 'NOW' | 'NEXT' | 'LATER') => {
    return result ? result.roadmap.filter((r) => r.phase === phase) : [];
  };

  return (
    <div>
      {/* Persona Banner */}
      <PersonaBanner persona={persona} repoDetails={repoDetails} />

      {/* GitHub URL Input */}
      <RepoUrlInput
        currentUrl={currentUrl}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        moduleTitle="Afterlife Planner"
      />

      {isLoading && (
        <LoadingState repoUrl={currentUrl} personaTitle={persona.title} />
      )}

      {!isLoading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Rocket size={44} color="var(--accent-amber)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Afterlife Roadmap Created Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Enter your public GitHub repository URL above to generate a realistic 30/60/90-day revival plan and top actionable priorities.
          </p>
        </div>
      )}

      {!isLoading && result && (
        <div>
          {/* Current Stage & Realistic Disclaimer */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-lavender)',
              borderLeft: '5px solid var(--accent-amber)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 22px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-amber">Evaluated Project Stage</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{result.currentStage}</strong>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resource-Constrained Student Roadmap</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Growth Strategist Note:</strong> This roadmap is engineered specifically for student developers with limited budgets and academic commitments. It focuses on small, verifiable milestones without assuming external venture capital or viral traction.
            </p>
          </div>

          {/* Top 5 Actions Card */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div className="card-header">
              <h4 className="card-title">
                <Zap size={18} color="var(--accent-amber)" />
                <span>Top 5 Actions To Give This Project An Afterlife</span>
              </h4>
              <span className="badge badge-amber">High-Impact Priorities</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {result.top5Actions.map((action) => (
                <div
                  key={action.number}
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    background: 'var(--bg-app)',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--accent-amber)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      flexShrink: 0
                    }}
                  >
                    {action.number}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {action.title}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
                      {action.description}
                    </p>
                    <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={12} />
                      <span>Impact: {action.impact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30 / 60 / 90 Day Milestone Plans */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              Phased 90-Day Execution Blueprint
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Structured student-friendly sprints to transform code into an adopted product.
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: 28 }}>
            {/* 30-Day Plan */}
            <div className="card" style={{ borderTop: '4px solid #3b82f6' }}>
              <div className="card-header" style={{ marginBottom: 10 }}>
                <span className="badge badge-blue">Days 1 - 30</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Phase 1</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {result.thirtyDayPlan.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 36 }}>
                <strong>Objective:</strong> {result.thirtyDayPlan.objective}
              </p>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Core Sprint Tasks:
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {result.thirtyDayPlan.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', background: 'var(--bg-app)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                <strong style={{ color: '#2563eb' }}>Key Deliverable:</strong>
                <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{result.thirtyDayPlan.deliverable}</div>
              </div>
            </div>

            {/* 60-Day Plan */}
            <div className="card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div className="card-header" style={{ marginBottom: 10 }}>
                <span className="badge badge-purple">Days 31 - 60</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Phase 2</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {result.sixtyDayPlan.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 36 }}>
                <strong>Objective:</strong> {result.sixtyDayPlan.objective}
              </p>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Core Sprint Tasks:
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {result.sixtyDayPlan.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', background: 'var(--bg-app)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                <strong style={{ color: '#7c3aed' }}>Key Deliverable:</strong>
                <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{result.sixtyDayPlan.deliverable}</div>
              </div>
            </div>

            {/* 90-Day Plan */}
            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div className="card-header" style={{ marginBottom: 10 }}>
                <span className="badge badge-emerald">Days 61 - 90</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Phase 3</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {result.ninetyDayPlan.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 36 }}>
                <strong>Objective:</strong> {result.ninetyDayPlan.objective}
              </p>

              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                Core Sprint Tasks:
              </div>
              <ul style={{ paddingLeft: 16, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {result.ninetyDayPlan.tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto', background: 'var(--bg-app)', padding: 10, borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                <strong style={{ color: '#059669' }}>Key Deliverable:</strong>
                <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{result.ninetyDayPlan.deliverable}</div>
              </div>
            </div>
          </div>

          {/* Interactive Roadmap Timeline: NOW, NEXT, LATER */}
          <div className="card" style={{ marginBottom: 28 }}>
            <div className="card-header">
              <h4 className="card-title">
                <Compass size={18} color="var(--primary)" />
                <span>Roadmap Timeline (NOW • NEXT • LATER)</span>
              </h4>
              <span className="badge badge-purple">Execution Tracking</span>
            </div>

            <div className="timeline-section">
              {/* NOW Phase */}
              <div className="timeline-phase">
                <div className="phase-header phase-now">
                  <div className="phase-title" style={{ color: '#1d4ed8' }}>
                    1. NOW (Immediate 1 - 30 Days)
                  </div>
                  <span className="badge badge-blue">Baseline Foundation</span>
                </div>
                <div className="phase-items">
                  {filterPhaseItems('NOW').map((item) => (
                    <div key={item.id} className="roadmap-card">
                      <div className="roadmap-card-title">{item.title}</div>
                      <div className="roadmap-card-desc">{item.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.targetDays}</span>
                        <span className="badge badge-blue">{item.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEXT Phase */}
              <div className="timeline-phase">
                <div className="phase-header phase-next">
                  <div className="phase-title" style={{ color: '#6d28d9' }}>
                    2. NEXT (Intermediate 31 - 60 Days)
                  </div>
                  <span className="badge badge-purple">Adoption & Quality</span>
                </div>
                <div className="phase-items">
                  {filterPhaseItems('NEXT').map((item) => (
                    <div key={item.id} className="roadmap-card">
                      <div className="roadmap-card-title">{item.title}</div>
                      <div className="roadmap-card-desc">{item.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.targetDays}</span>
                        <span className="badge badge-purple">{item.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LATER Phase */}
              <div className="timeline-phase">
                <div className="phase-header phase-later">
                  <div className="phase-title" style={{ color: '#047857' }}>
                    3. LATER (Scale 61 - 90+ Days)
                  </div>
                  <span className="badge badge-emerald">Continuity & Growth</span>
                </div>
                <div className="phase-items">
                  {filterPhaseItems('LATER').map((item) => (
                    <div key={item.id} className="roadmap-card">
                      <div className="roadmap-card-title">{item.title}</div>
                      <div className="roadmap-card-desc">{item.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.targetDays}</span>
                        <span className="badge badge-emerald">{item.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Target Users, Pilot Opportunities, Blockers */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <ShieldAlert size={18} color="var(--accent-rose)" />
                  <span>Biggest Blockers</span>
                </h4>
                <span className="badge badge-rose">Hurdles to Clear</span>
              </div>
              <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.biggestBlockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Most Important Improvements:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.mostImportantImprovements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Target size={18} color="var(--accent-blue)" />
                  <span>Target Users & Pilot Opportunities</span>
                </h4>
                <span className="badge badge-blue">Traction Strategy</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Target User Cohorts:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {result.targetUsers.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Campus & Community Pilots:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {result.pilotOpportunities.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
