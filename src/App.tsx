import React, { useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import type {
  AnalyzerResult,
  ExpertFinderResult,
  ModuleId,
  PlannerResult,
  RepoDetails,
  TechAdvisorResult
} from './types';
import { Sidebar } from './components/common/Sidebar';
import { GithubIcon } from './components/common/GithubIcon';
import { ErrorAlert } from './components/common/ErrorAlert';
import { DashboardView } from './components/dashboard/DashboardView';
import { AnalyzerView } from './components/analyzer/AnalyzerView';
import { TechAdvisorView } from './components/techAdvisor/TechAdvisorView';
import { ExpertFinderView } from './components/expertFinder/ExpertFinderView';
import { PlannerView } from './components/afterlifePlanner/PlannerView';
import { MODULE_PERSONAS } from './services/promptService';
import { fetchRepositoryDetails } from './services/githubService';
import {
  analyzeProjectWithPersona,
  adviseTechStackWithPersona,
  findExpertsWithPersona,
  planAfterlifeWithPersona
} from './services/aiService';

export const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis states for each module
  const [repoDetails, setRepoDetails] = useState<RepoDetails | null>(null);
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(null);
  const [techAdvisorResult, setTechAdvisorResult] = useState<TechAdvisorResult | null>(null);
  const [expertFinderResult, setExpertFinderResult] = useState<ExpertFinderResult | null>(null);
  const [plannerResult, setPlannerResult] = useState<PlannerResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentUrl(url);

    try {
      // 1. Fetch real public repository details from GitHub
      const details = await fetchRepositoryDetails(url);
      setRepoDetails(details);

      // 2. Synthesize all 4 persona-driven analyses based on the real repository data
      const analyzerRes = analyzeProjectWithPersona(details);
      const techAdvisorRes = adviseTechStackWithPersona(details);
      const expertFinderRes = findExpertsWithPersona(details);
      const plannerRes = planAfterlifeWithPersona(details);

      setAnalyzerResult(analyzerRes);
      setTechAdvisorResult(techAdvisorRes);
      setExpertFinderResult(expertFinderRes);
      setPlannerResult(plannerRes);

      // If user launched analysis from the dashboard, transition them directly to Project Analyzer
      if (currentModule === 'dashboard') {
        setCurrentModule('analyzer');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          'This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        analyzedRepoName={repoDetails ? repoDetails.fullName : undefined}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="nav-toggle-btn"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="status-pill">
                <Sparkles size={12} />
                <span>Project Afterlife</span>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'none' }}>
                Hackathon Continuity Engine
              </span>
            </div>
          </div>

          <div className="navbar-status">
            {repoDetails ? (
              <div className="active-repo-badge" title={repoDetails.fullName}>
                <GithubIcon size={14} />
                <span>{repoDetails.fullName}</span>
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Enter any public GitHub URL to begin
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {errorMessage && (
            <ErrorAlert
              message={errorMessage}
              onRetry={currentUrl ? () => handleAnalyze(currentUrl) : undefined}
            />
          )}

          {currentModule === 'dashboard' && (
            <DashboardView
              onSelectModule={(mod) => setCurrentModule(mod)}
              currentUrl={currentUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              repoDetails={repoDetails}
            />
          )}

          {currentModule === 'analyzer' && (
            <AnalyzerView
              persona={MODULE_PERSONAS.analyzer}
              currentUrl={currentUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              repoDetails={repoDetails}
              result={analyzerResult}
            />
          )}

          {currentModule === 'techAdvisor' && (
            <TechAdvisorView
              persona={MODULE_PERSONAS.techAdvisor}
              currentUrl={currentUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              repoDetails={repoDetails}
              result={techAdvisorResult}
            />
          )}

          {currentModule === 'expertFinder' && (
            <ExpertFinderView
              persona={MODULE_PERSONAS.expertFinder}
              currentUrl={currentUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              repoDetails={repoDetails}
              result={expertFinderResult}
            />
          )}

          {currentModule === 'afterlifePlanner' && (
            <PlannerView
              persona={MODULE_PERSONAS.afterlifePlanner}
              currentUrl={currentUrl}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              repoDetails={repoDetails}
              result={plannerResult}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
