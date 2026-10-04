import React from 'react';
import {
  SearchCode,
  Award,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  FileText,
  TrendingUp,
  Compass,
  HelpCircle,
  FolderTree,
  Lightbulb
} from 'lucide-react';
import type { AnalyzerResult, MaturityLevel, PersonaInfo, RepoDetails } from '../../types';
import { RepoUrlInput } from '../common/RepoUrlInput';
import { PersonaBanner } from '../common/PersonaBanner';
import { LoadingState } from '../common/LoadingState';

interface AnalyzerViewProps {
  persona: PersonaInfo;
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  repoDetails: RepoDetails | null;
  result: AnalyzerResult | null;
}

export const AnalyzerView: React.FC<AnalyzerViewProps> = ({
  persona,
  currentUrl,
  onAnalyze,
  isLoading,
  repoDetails,
  result
}) => {
  const getMaturityClass = (level: MaturityLevel) => {
    switch (level) {
      case 'Idea': return 'maturity-idea';
      case 'Prototype': return 'maturity-prototype';
      case 'MVP': return 'maturity-mvp';
      case 'Advanced Prototype': return 'maturity-advanced';
      case 'Production Ready': return 'maturity-production';
      default: return 'maturity-prototype';
    }
  };

  return (
    <div>
      {/* Persona Banner */}
      <PersonaBanner persona={persona} repoDetails={repoDetails} />

      {/* GitHub URL Input - present in ALL four modules */}
      <RepoUrlInput
        currentUrl={currentUrl}
        onAnalyze={onAnalyze}
        isLoading={isLoading}
        moduleTitle="Project Analyzer"
      />

      {isLoading && (
        <LoadingState repoUrl={currentUrl} personaTitle={persona.title} />
      )}

      {!isLoading && !result && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <SearchCode size={44} color="var(--primary)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Analysis Generated Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Enter your public GitHub repository URL above and click <strong>Analyze Repository</strong> to generate an objective hackathon evaluation.
          </p>
        </div>
      )}

      {!isLoading && result && (
        <div>
          {/* Top Score & Maturity Hero Card */}
          <div className="score-card">
            <div className="score-main">
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#cbd5e1', marginBottom: 4 }}>
                Overall Project Score
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="score-number">{result.score.overall}</span>
                <span className="score-denominator">/ 100</span>
              </div>
              <div className={`maturity-badge ${getMaturityClass(result.maturity)}`}>
                <Award size={14} />
                <span>{result.maturity}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 8 }}>
                Assessed by Senior Project Reviewer
              </div>
            </div>

            <div className="score-breakdown-grid">
              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>Functionality (25%)</span>
                  <strong>{result.score.functionality}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-purple" style={{ width: `${result.score.functionality}%` }} />
                </div>
              </div>

              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>Code Quality (20%)</span>
                  <strong>{result.score.codeQuality}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-blue" style={{ width: `${result.score.codeQuality}%` }} />
                </div>
              </div>

              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>Documentation (15%)</span>
                  <strong>{result.score.documentation}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-emerald" style={{ width: `${result.score.documentation}%` }} />
                </div>
              </div>

              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>Innovation (15%)</span>
                  <strong>{result.score.innovation}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-amber" style={{ width: `${result.score.innovation}%` }} />
                </div>
              </div>

              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>User Experience (10%)</span>
                  <strong>{result.score.userExperience}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-cyan" style={{ width: `${result.score.userExperience}%` }} />
                </div>
              </div>

              <div className="score-bar-item">
                <div className="score-bar-header">
                  <span>Scalability (15%)</span>
                  <strong>{result.score.scalability}/100</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill fill-rose" style={{ width: `${result.score.scalability}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Next Step Banner */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-lavender)',
              borderLeft: '5px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Compass size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>
                Recommended Next Step
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                {result.recommendedNextStep}
              </div>
            </div>
          </div>

          {/* Project Overview & Problem Identified */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <FileText size={18} color="var(--primary)" />
                  <span>Project Overview</span>
                </h4>
                <span className="badge badge-purple">Verified Repository</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.projectOverview}
              </p>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Detected Tech Stack:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.technologyStack.map((tech, i) => (
                    <span key={i} className="badge badge-blue">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Lightbulb size={18} color="var(--accent-amber)" />
                  <span>Problem Identified</span>
                </h4>
                <span className="badge badge-amber">Core Premise</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.problemIdentified}
              </p>

              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Main Features Extracted:
                </div>
                <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {result.mainFeatures.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Project Structure & Scalability */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <FolderTree size={18} color="var(--accent-cyan)" />
                  <span>Project Structure</span>
                </h4>
                <span className="badge badge-blue">Root Hierarchy</span>
              </div>
              <div
                style={{
                  background: 'var(--bg-card-muted)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                {result.projectStructure.map((item, i) => (
                  <div key={i}>{item}</div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <TrendingUp size={18} color="var(--accent-emerald)" />
                  <span>Scalability & Innovation</span>
                </h4>
                <span className="badge badge-emerald">Architectural Analysis</span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Innovation Potential:
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {result.innovationPotential}
                </p>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Scalability Assessment:
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {result.scalabilityAssessment}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Areas Requiring Improvement */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  <span>Strengths</span>
                </h4>
                <span className="badge badge-emerald">Key Wins</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.strengths.map((str, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <AlertTriangle size={18} color="var(--accent-rose)" />
                  <span>Areas Requiring Improvement</span>
                </h4>
                <span className="badge badge-rose">Gaps Identified</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.areasRequiringImprovement.map((imp, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <AlertTriangle size={16} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Issues & Labeled Assumptions */}
          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <Cpu size={18} color="var(--accent-blue)" />
                  <span>Technical Issues</span>
                </h4>
                <span className="badge badge-amber">Codebase Audit</span>
              </div>
              <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.technicalIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>

            <div className="card">
              <div className="card-header">
                <h4 className="card-title">
                  <HelpCircle size={18} color="var(--text-muted)" />
                  <span>Labeled Assumptions</span>
                </h4>
                <span className="badge badge-purple">No Hallucinations</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>
                Per evaluation constraints, the reviewer avoids inventing unverified claims. The following assumptions were deduced strictly from the repository files:
              </p>
              <ul style={{ paddingLeft: 18, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.assumptions.map((asm, i) => (
                  <li key={i}>{asm}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
