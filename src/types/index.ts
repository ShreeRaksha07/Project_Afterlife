// TypeScript Interfaces for Project Afterlife

export type ModuleId = 'dashboard' | 'analyzer' | 'techAdvisor' | 'expertFinder' | 'afterlifePlanner';

export interface RepoDetails {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  languages: Record<string, number>;
  topics: string[];
  defaultBranch: string;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  readmeContent: string;
  rootFiles: string[];
  detectedStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    devops?: string[];
    testing?: string[];
    aiMl?: string[];
    hasDocker: boolean;
    hasTests: boolean;
    hasCiCd: boolean;
    hasEnvExample: boolean;
    hasLicense: boolean;
    packageJson?: Record<string, unknown>;
  };
}

// Module 1 Types
export type MaturityLevel = 'Idea' | 'Prototype' | 'MVP' | 'Advanced Prototype' | 'Production Ready';

export interface ProjectScores {
  overall: number;
  functionality: number;
  codeQuality: number;
  documentation: number;
  innovation: number;
  userExperience: number;
  scalability: number;
}

export interface AnalyzerResult {
  projectOverview: string;
  problemIdentified: string;
  technologyStack: string[];
  mainFeatures: string[];
  projectStructure: string[];
  strengths: string[];
  areasRequiringImprovement: string[];
  technicalIssues: string[];
  innovationPotential: string;
  scalabilityAssessment: string;
  score: ProjectScores;
  maturity: MaturityLevel;
  recommendedNextStep: string;
  assumptions: string[];
}

// Module 2 Types
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface TechTableRow {
  currentTech: string;
  recommendedTech: string;
  why: string;
  priority: PriorityLevel;
  action: 'keep' | 'upgrade' | 'add' | 'replace';
}

export interface CategoryRecommendation {
  category: string;
  current: string;
  recommended: string;
  why: string;
  tradeoffs: string;
  action: 'keep' | 'upgrade' | 'add';
}

export interface TechAdvisorResult {
  existingAudit: {
    frontend: string;
    backend: string;
    database: string;
    apis: string;
    authentication: string;
    hosting: string;
    testing: string;
    aiMl: string;
  };
  comparisonTable: TechTableRow[];
  categoryRecommendations: CategoryRecommendation[];
  minimumTechnologyUpgrade: {
    summary: string;
    steps: string[];
    estimatedEffort: string;
  };
  futureTechnologyUpgrade: {
    summary: string;
    steps: string[];
    estimatedEffort: string;
  };
  architectAdvice: string;
}

// Module 3 Types
export type SupportCategory = 'MUST HAVE' | 'SHOULD HAVE' | 'NICE TO HAVE';

export interface SupportEntity {
  id: string;
  who: string;
  category: SupportCategory;
  whyNeeded: string;
  whatHelpTheyCanProvide: string;
  whenToApproach: string;
  priority: PriorityLevel;
  iconName?: string;
}

export interface ExpertFinderResult {
  projectNeedsSummary: {
    technical: string;
    domain: string;
    business: string;
    testing: string;
    deployment: string;
    industry: string;
    fundingIncubation: string;
    community: string;
  };
  mustHave: SupportEntity[];
  shouldHave: SupportEntity[];
  niceToHave: SupportEntity[];
  mentorGuidance: string;
}

// Module 4 Types
export interface MilestonePlan {
  title: string;
  days: number;
  objective: string;
  tasks: string[];
  deliverable: string;
}

export interface RoadmapItem {
  id: string;
  phase: 'NOW' | 'NEXT' | 'LATER';
  title: string;
  description: string;
  targetDays: string;
  keyAction: string;
  badge: string;
}

export interface PlannerResult {
  currentStage: string;
  biggestBlockers: string[];
  mostImportantImprovements: string[];
  targetUsers: string[];
  realWorldUseCases: string[];
  pilotOpportunities: string[];
  validationStrategy: string;
  longTermPossibilities: string;
  top5Actions: {
    number: number;
    title: string;
    description: string;
    impact: string;
  }[];
  thirtyDayPlan: MilestonePlan;
  sixtyDayPlan: MilestonePlan;
  ninetyDayPlan: MilestonePlan;
  roadmap: RoadmapItem[];
}

export interface PersonaInfo {
  id: string;
  title: string;
  subtitle: string;
  experience: string;
  badge: string;
  description: string;
  promptSnippet: string;
  systemPrompt: string;
}
