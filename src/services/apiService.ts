import type {
  AnalyzerResult,
  ExpertFinderResult,
  PlannerResult,
  RepoDetails,
  TechAdvisorResult
} from '../types';

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  groq_configured: boolean;
  groq_model?: string | null;
}

export interface FullAnalysisResponse {
  repoDetails: RepoDetails;
  analyzerResult: AnalyzerResult;
  techAdvisorResult: TechAdvisorResult;
  expertFinderResult: ExpertFinderResult;
  plannerResult: PlannerResult;
  error?: string;
}

export interface ModularAnalysisResponse {
  moduleId: string;
  repoDetails: RepoDetails;
  result: AnalyzerResult | TechAdvisorResult | ExpertFinderResult | PlannerResult;
  error?: string;
}

/**
 * Service for communicating with the Flask backend API.
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error(`Backend health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Runs full analysis for all 4 modules via POST /api/analyze
 */
export async function analyzeProjectViaBackend(githubUrl: string): Promise<FullAnalysisResponse> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ github_url: githubUrl })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze repository via backend API.');
  }

  return data as FullAnalysisResponse;
}

/**
 * Runs single module analysis via POST /api/analyze/:module_id
 */
export async function analyzeModuleViaBackend(
  moduleId: 'module1' | 'module2' | 'module3' | 'module4' | string,
  githubUrl: string
): Promise<ModularAnalysisResponse> {
  const response = await fetch(`/api/analyze/${moduleId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ github_url: githubUrl })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Failed to analyze ${moduleId} via backend API.`);
  }

  return data as ModularAnalysisResponse;
}
