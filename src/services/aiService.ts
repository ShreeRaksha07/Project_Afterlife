import type {
  AnalyzerResult,
  ExpertFinderResult,
  MaturityLevel,
  PlannerResult,
  RepoDetails,
  TechAdvisorResult
} from '../types';

/**
 * Intelligent Persona Engine for Project Afterlife
 * Analyzes real public GitHub repository attributes (languages, files, README, dependencies, issues)
 * and generates structured results according to each module's assigned AI persona.
 */

export function analyzeProjectWithPersona(repo: RepoDetails): AnalyzerResult {
  const hasReadme = repo.readmeContent.length > 50;
  const readmeLength = repo.readmeContent.length;
  const hasTests = repo.detectedStack.hasTests;
  const hasDocker = repo.detectedStack.hasDocker;
  const hasLicense = repo.detectedStack.hasLicense;
  const fileCount = repo.rootFiles.length;
  const primaryLang = repo.language || 'Codebase';

  // Compute calculated scores based on real repository characteristics
  let docScore = 40;
  if (hasReadme) docScore += Math.min(45, Math.floor(readmeLength / 60));
  if (repo.description && repo.description !== 'No description provided by repository author.') docScore += 10;
  if (hasLicense) docScore += 5;
  docScore = Math.min(95, Math.max(35, docScore));

  let codeScore = 55;
  if (fileCount > 5) codeScore += 10;
  if (hasTests) codeScore += 15;
  if (repo.detectedStack.hasCiCd) codeScore += 10;
  if (repo.detectedStack.hasEnvExample) codeScore += 5;
  codeScore = Math.min(92, Math.max(45, codeScore));

  let funcScore = 65;
  if (hasReadme && readmeLength > 500) funcScore += 10;
  if (repo.stars > 5) funcScore += 5;
  if (repo.openIssues === 0 && repo.stars > 0) funcScore += 5;
  funcScore = Math.min(90, Math.max(50, funcScore));

  const innovScore = Math.min(94, Math.max(68, 75 + (repo.topics.length > 0 ? 8 : 0) + (repo.detectedStack.aiMl && repo.detectedStack.aiMl.length > 0 ? 10 : 0)));
  const uxScore = Math.min(88, Math.max(52, 60 + (repo.detectedStack.frontend && repo.detectedStack.frontend.length > 0 ? 15 : 5)));
  
  let scaleScore = 45;
  if (hasDocker) scaleScore += 18;
  if (hasTests) scaleScore += 12;
  if (repo.detectedStack.backend && repo.detectedStack.backend.length > 0) scaleScore += 10;
  scaleScore = Math.min(88, Math.max(40, scaleScore));

  const overallScore = Math.round(
    (funcScore * 0.25) +
    (codeScore * 0.20) +
    (docScore * 0.15) +
    (innovScore * 0.15) +
    (uxScore * 0.10) +
    (scaleScore * 0.15)
  );

  // Determine maturity classification
  let maturity: MaturityLevel = 'Prototype';
  if (overallScore < 55) maturity = 'Idea';
  else if (overallScore < 70) maturity = 'Prototype';
  else if (overallScore < 82) maturity = 'MVP';
  else if (overallScore < 90) maturity = 'Advanced Prototype';
  else maturity = 'Production Ready';

  // Extract problem and features from README or synthesize
  const problemStatement = repo.description && repo.description.length > 15
    ? `Addresses: "${repo.description}". Built as an applied software solution using ${primaryLang}.`
    : `A software solution leveraging ${primaryLang} to automate workflows and provide interactive tooling for targeted end-users.`;

  const features: string[] = [];
  if (repo.detectedStack.frontend?.length) {
    features.push(`Interactive UI client built with ${repo.detectedStack.frontend.join(', ')}`);
  }
  if (repo.detectedStack.backend?.length) {
    features.push(`Backend service handling business logic via ${repo.detectedStack.backend.join(', ')}`);
  }
  if (repo.detectedStack.aiMl?.length) {
    features.push(`AI/Machine Learning integration using ${repo.detectedStack.aiMl.join(', ')}`);
  }
  features.push(`Core repository codebase orchestrated in ${primaryLang}`);
  if (repo.topics.length) {
    features.push(`Domain focus areas: ${repo.topics.join(', ')}`);
  } else {
    features.push('Modularity for future domain expansion and feature iteration');
  }

  const strengths: string[] = [
    `Established foundational architecture utilizing ${primaryLang} and modern toolchains`,
    hasReadme ? `Structured documentation present with ${readmeLength} characters of descriptive guidance` : `Clean initial repository layout ready for formal documentation`,
    hasDocker ? 'Containerization ready via Dockerfile for reproducible developer environments' : 'Lightweight codebase with low initialization overhead for rapid prototyping',
    repo.topics.length ? `Clear domain positioning with relevant tags: ${repo.topics.join(', ')}` : 'Flexible architecture adaptable to multiple real-world use cases'
  ];

  const improvements: string[] = [
    hasTests ? 'Expand test coverage to include end-to-end integration and edge-case testing' : 'Establish automated unit and regression testing suite (zero tests currently detected in root)',
    repo.detectedStack.hasEnvExample ? 'Audit secret management and configuration validation' : 'Add a `.env.example` template to prevent leaking credentials and ease setup',
    repo.detectedStack.hasCiCd ? 'Extend GitHub Actions workflow to run linting and automatic deployment' : 'Introduce GitHub Actions CI/CD to verify pull requests and build status automatically',
    'Add structured input validation and centralized error handling middleware'
  ];

  const technicalIssues: string[] = [
    hasTests ? 'Test coverage lacks stress and concurrency benchmarks' : 'High regression risk: absence of automated test suite leaves manual verification as only check',
    repo.detectedStack.hasDocker ? 'Container image lacks multi-stage build optimization' : 'Environment portability risk: missing Dockerfile or container configuration',
    'State management and persistence strategy requires decoupled isolation for multi-user workloads'
  ];

  const assumptions: string[] = [
    `Assumed ${primaryLang} is the primary target execution runtime based on GitHub repository language distribution`,
    hasTests ? 'Assumed existing test files correspond to functional unit tests' : 'Assumed no formal automated testing pipeline exists due to lack of standard test scripts in root',
    'Assumed single-environment deployment without multi-tenant security guarantees based on repository files'
  ];

  return {
    projectOverview: `${repo.fullName} is an open-source project written predominantly in ${primaryLang}. It provides ${repo.description || 'a focused technical prototype'} with a structured codebase comprising ${fileCount} root artifacts.`,
    problemIdentified: problemStatement,
    technologyStack: [
      primaryLang,
      ...(repo.detectedStack.frontend || []),
      ...(repo.detectedStack.backend || []),
      ...(repo.detectedStack.database || []),
      ...(repo.detectedStack.aiMl || [])
    ],
    mainFeatures: features,
    projectStructure: repo.rootFiles.slice(0, 12).map((f) => `• ${f}`),
    strengths,
    areasRequiringImprovement: improvements,
    technicalIssues,
    innovationPotential: `Strong hackathon premise. The project shows clear technical initiative in combining ${primaryLang} with ${repo.topics.join('/') || 'modern software workflows'}. By hardening reliability and UX, this project can comfortably transition into a production-grade student startup or portfolio centerpiece.`,
    scalabilityAssessment: `Current architecture is well-suited for single-tenant demonstration or light prototype usage. To scale to concurrent production users, it will require asynchronous worker queues, database indexing, and stateless container orchestration.`,
    score: {
      overall: overallScore,
      functionality: funcScore,
      codeQuality: codeScore,
      documentation: docScore,
      innovation: innovScore,
      userExperience: uxScore,
      scalability: scaleScore
    },
    maturity,
    recommendedNextStep: hasTests
      ? 'Package the core API as a deployable microservice and configure automated CI/CD staging previews.'
      : 'Create a comprehensive test harness and add an environment configuration template (.env.example) before adding new features.',
    assumptions
  };
}

export function adviseTechStackWithPersona(repo: RepoDetails): TechAdvisorResult {
  const primaryLang = repo.language || 'JavaScript';
  const detected = repo.detectedStack;
  const isPython = primaryLang.toLowerCase().includes('python');
  const isJsTs = primaryLang.toLowerCase().includes('javascript') || primaryLang.toLowerCase().includes('typescript');

  const currentFrontend = detected.frontend?.join(', ') || (isJsTs ? 'React / HTML5' : 'Web Interface / Templates');
  const currentBackend = detected.backend?.join(', ') || (isPython ? 'Python Script / Framework' : 'Node.js runtime');
  const currentDb = detected.database?.join(', ') || 'Local storage / JSON / Embedded DB';

  const rows = [
    {
      currentTech: currentFrontend,
      recommendedTech: isJsTs ? 'Keep the existing technology (React / TypeScript)' : 'Next.js 15 or Vite + React',
      why: isJsTs
        ? 'Keep existing technology: It provides strong component modularity and extensive community ecosystem. Add TypeScript strict mode for type safety.'
        : 'Provides superior student developer velocity, pre-built component libraries, and effortless hosting on Vercel.',
      priority: 'Medium' as const,
      action: isJsTs ? ('keep' as const) : ('upgrade' as const)
    },
    {
      currentTech: currentBackend,
      recommendedTech: isPython ? 'Keep the existing technology (FastAPI / Python)' : (isJsTs ? 'Node.js with Express or Hono' : 'FastAPI (Python)'),
      why: isPython
        ? 'Keep existing technology: FastAPI offers native async performance, Pydantic type validation, and automatic OpenAPI interactive documentation.'
        : 'Ensures non-blocking I/O, rapid JSON API routing, and high portability with low memory footprint.',
      priority: 'High' as const,
      action: 'keep' as const
    },
    {
      currentTech: currentDb,
      recommendedTech: 'PostgreSQL (via Supabase or Neon Serverless)',
      why: 'Hackathons frequently rely on SQLite or flat JSON files. PostgreSQL provides ACID compliance, relational integrity, JSONB support, and zero-maintenance serverless tiers.',
      priority: 'High' as const,
      action: 'upgrade' as const
    },
    {
      currentTech: 'Direct API Keys / Hardcoded Config',
      recommendedTech: 'Zod / Pydantic Schema Validation + Doppler/Vault',
      why: 'Prevents runtime crashes caused by undefined environment variables and eliminates security vulnerabilities from leaked hackathon API keys.',
      priority: 'High' as const,
      action: 'add' as const
    },
    {
      currentTech: detected.hasDocker ? 'Docker Container' : 'Manual Local Execution',
      recommendedTech: detected.hasDocker ? 'Keep the existing technology (Multi-Stage Dockerfile)' : 'Docker + GitHub Actions CI',
      why: detected.hasDocker
        ? 'Keep existing technology: Containerization ensures consistency across team development environments.'
        : 'Eliminates "works on my machine" issues for mentors and prospective users by delivering a single-command setup.',
      priority: 'Medium' as const,
      action: detected.hasDocker ? ('keep' as const) : ('add' as const)
    },
    {
      currentTech: detected.hasTests ? 'Basic Test Runner' : 'No Automated Tests Detected',
      recommendedTech: isPython ? 'Pytest + Coverage.py' : 'Vitest + Playwright',
      why: 'Automated regression verification is the single most critical filter separating an abandoned hackathon repo from an active software product.',
      priority: 'High' as const,
      action: 'add' as const
    }
  ];

  const categoryRecs = [
    {
      category: 'Frontend',
      current: currentFrontend,
      recommended: isJsTs ? 'Keep existing React/TypeScript setup, upgrade build to Vite' : 'Vite + React with Tailwind CSS',
      why: 'Avoids heavy frontend rewrites while granting sub-second hot module reloading and small bundle footprints.',
      tradeoffs: 'Migrating from Create-React-App to Vite requires updating environment variable prefixes (REACT_APP_ to VITE_).',
      action: 'keep' as const
    },
    {
      category: 'Backend',
      current: currentBackend,
      recommended: isPython ? 'FastAPI with Pydantic v2' : 'Node.js + Hono / Express with modular controllers',
      why: 'Maintains low server latency and automated Swagger/OpenAPI documentation generation.',
      tradeoffs: 'Async Python requires handling database session lifecycle cleanly.',
      action: 'keep' as const
    },
    {
      category: 'Database',
      current: currentDb,
      recommended: 'Managed PostgreSQL (Supabase or Neon)',
      why: 'Provides generous free tier for students with relational foreign keys, row-level security, and automatic backups.',
      tradeoffs: 'Requires setting up migrations using Prisma, Drizzle, or Alembic.',
      action: 'upgrade' as const
    },
    {
      category: 'Authentication',
      current: 'None or Hardcoded Tokens',
      recommended: 'Clerk or Supabase Auth',
      why: 'Provides plug-and-play user sign-in, OAuth (Google/GitHub), and session management in under 30 minutes without rolling custom insecure crypto.',
      tradeoffs: 'External provider dependency, though free tier easily supports college project volumes.',
      action: 'add' as const
    },
    {
      category: 'Cloud & Deployment',
      current: 'Localhost development',
      recommended: 'Frontend on Vercel/Cloudflare Pages, Backend on Render/Railway',
      why: 'Instant continuous deployment on git push with custom SSL and zero server management for student budgets.',
      tradeoffs: 'Free tiers on some hosts put inactive instances to sleep after 15 minutes of idle time.',
      action: 'add' as const
    },
    {
      category: 'Testing',
      current: detected.hasTests ? 'Partial tests' : 'Zero automated tests',
      recommended: isPython ? 'Pytest + GitHub Actions CI' : 'Vitest for Unit + Playwright for E2E',
      why: 'Guarantees core user flows never break when students add new features post-hackathon.',
      tradeoffs: 'Writing comprehensive tests requires an upfront time investment of ~1 weekend.',
      action: 'add' as const
    },
    {
      category: 'AI Integration',
      current: detected.aiMl?.length ? detected.aiMl.join(', ') : 'Not directly implemented',
      recommended: 'Vercel AI SDK or LangChain with Structured JSON Schema output',
      why: 'Streaming responses and enforced JSON schemas make AI features 5x more reliable than unstructured regex parsing.',
      tradeoffs: 'Requires token budgeting and fallback retry handling for rate limits.',
      action: detected.aiMl?.length ? ('keep' as const) : ('add' as const)
    },
    {
      category: 'Security',
      current: 'Development defaults',
      recommended: 'Helmet headers, CORS whitelist, environment variable validation via Zod',
      why: 'Protects backend endpoints from cross-origin abuse and credential leakage.',
      tradeoffs: 'Must specify exact frontend origins instead of wildcard (*).',
      action: 'add' as const
    },
    {
      category: 'DevOps',
      current: detected.hasCiCd ? 'GitHub Actions detected' : 'Manual deployments',
      recommended: 'GitHub Actions workflow for Lint + TypeCheck + Unit Tests on Pull Request',
      why: 'Catches breaking syntax errors before code merges into the default branch.',
      tradeoffs: 'Adds a 1-2 minute verification step on every pull request.',
      action: detected.hasCiCd ? ('keep' as const) : ('add' as const)
    },
    {
      category: 'Architecture',
      current: 'Monolithic hackathon script / app',
      recommended: 'Layered Modular Architecture (Controllers -> Services -> Data Access)',
      why: 'Allows two or three student contributors to work in parallel on database, UI, and business logic without git merge conflicts.',
      tradeoffs: 'Slightly higher file count, but drastically improves maintainability.',
      action: 'upgrade' as const
    }
  ];

  return {
    existingAudit: {
      frontend: currentFrontend,
      backend: currentBackend,
      database: currentDb,
      apis: 'REST endpoints (JSON payloads)',
      authentication: 'Currently unauthenticated or demo tokens',
      hosting: 'Local machine (localhost)',
      testing: detected.hasTests ? 'Unit test files identified' : 'No automated testing detected',
      aiMl: detected.aiMl?.length ? detected.aiMl.join(', ') : 'None detected'
    },
    comparisonTable: rows,
    categoryRecommendations: categoryRecs,
    minimumTechnologyUpgrade: {
      summary: 'Pragmatic, low-friction upgrades achievable in 1-2 weekends without rewriting core logic.',
      steps: [
        'Add a `.env.example` file and replace all hardcoded strings with environment variables.',
        'Install Vitest/Pytest and create 3 smoke tests covering the main user workflow.',
        'Connect free managed PostgreSQL database via Supabase or Neon instead of local JSON/SQLite.',
        'Deploy the frontend to Vercel and backend to Render with continuous git deployment.'
      ],
      estimatedEffort: '8 - 14 hours total'
    },
    futureTechnologyUpgrade: {
      summary: 'Production-ready architecture designed for 10,000+ monthly active users and multi-contributor growth.',
      steps: [
        'Migrate to strict TypeScript across full stack with end-to-end type safety via tRPC or OpenAPI client.',
        'Implement Redis / Upstash caching for high-frequency database reads and API rate-limiting.',
        'Deploy multi-stage Docker containers to AWS ECS or Google Cloud Run behind a Cloudflare CDN.',
        'Implement telemetry and error tracing using Sentry and OpenTelemetry.'
      ],
      estimatedEffort: '4 - 6 weeks part-time'
    },
    architectAdvice:
      'Resist the temptation to rewrite your entire project in a trendy new framework. The core hackathon code has momentum—focus your energy on plugging the 3 critical holes: persistent storage, automated testing, and a live public URL.'
  };
}

export function findExpertsWithPersona(repo: RepoDetails): ExpertFinderResult {
  const primaryLang = repo.language || 'Software';
  const hasAI = (repo.detectedStack.aiMl && repo.detectedStack.aiMl.length > 0) || repo.readmeContent.toLowerCase().includes('ai');

  const mustHave = [
    {
      id: 'exp-1',
      who: 'Senior Technical Peer / Graduate Mentor',
      category: 'MUST HAVE' as const,
      whyNeeded: `The project has solid foundational code in ${primaryLang}, but needs architectural code review to clean up hackathon shortcuts and prevent technical debt.`,
      whatHelpTheyCanProvide: 'Conduct a thorough pull request review, identify memory leaks or unhandled promises, and recommend clean module boundaries.',
      whenToApproach: 'Immediately (Week 1) before introducing new features.',
      priority: 'High' as const,
      iconName: 'Code2'
    },
    {
      id: 'exp-2',
      who: 'Target End-User / Student Tester Cohort',
      category: 'MUST HAVE' as const,
      whyNeeded: 'Hackathon projects are frequently built on assumptions made during 36-hour sprints without testing real usability with non-developers.',
      whatHelpTheyCanProvide: 'Run through the project onboarding workflow without developer assistance and point out confusing UI flows and dead ends.',
      whenToApproach: 'Within the first 14 days, as soon as a live deployment link is accessible.',
      priority: 'High' as const,
      iconName: 'Users'
    }
  ];

  const shouldHave = [
    {
      id: 'exp-3',
      who: 'College Innovation & Incubation Cell (IIC / E-Cell)',
      category: 'SHOULD HAVE' as const,
      whyNeeded: 'University incubation cells provide institutional backing, free cloud credit grants (AWS/Azure/GCP), and hackathon continuation stipends.',
      whatHelpTheyCanProvide: 'Access to student entrepreneurship grants, faculty mentorship credits, legal patent advice, and letters of recommendation.',
      whenToApproach: 'During Month 2 once the MVP has demonstrated stable live usage.',
      priority: 'Medium' as const,
      iconName: 'GraduationCap'
    },
    {
      id: 'exp-4',
      who: 'UI/UX Student Designer',
      category: 'SHOULD HAVE' as const,
      whyNeeded: 'Engineers build functional layouts, but visual polish, consistent typography, and mobile responsiveness dramatically elevate perceived value.',
      whatHelpTheyCanProvide: 'Create a lightweight Figma design system, standardize color palettes, and design responsive mobile layouts.',
      whenToApproach: 'Weeks 3 to 5 when core functionality is stabilized.',
      priority: 'Medium' as const,
      iconName: 'Palette'
    },
    ...(hasAI
      ? [
          {
            id: 'exp-5',
            who: 'Applied AI / ML Practitioner',
            category: 'SHOULD HAVE' as const,
            whyNeeded: 'AI API calls can be brittle, slow, or expensive if prompt token budgets and fallback models are not optimized.',
            whatHelpTheyCanProvide: 'Implement structured schema outputs, model fallback chains, and semantic caching to slash API latency and cost.',
            whenToApproach: 'Month 2 during AI pipeline refactoring.',
            priority: 'Medium' as const,
            iconName: 'Cpu'
          }
        ]
      : [])
  ];

  const niceToHave = [
    {
      id: 'exp-6',
      who: 'Open Source Community Contributors',
      category: 'NICE TO HAVE' as const,
      whyNeeded: 'External contributors can help maintain dependencies, fix edge-case bugs, and write documentation once the repo has good hygiene.',
      whatHelpTheyCanProvide: 'Submit pull requests for issue labels like "good first issue", translate documentation, and test across different OS platforms.',
      whenToApproach: 'Month 3 after publishing a clean CONTRIBUTING.md and Code of Conduct.',
      priority: 'Low' as const,
      iconName: 'GitPullRequest'
    },
    {
      id: 'exp-7',
      who: 'Domain Subject Matter Specialist (Industry Partner)',
      category: 'NICE TO HAVE' as const,
      whyNeeded: `Validates whether ${repo.name}'s problem-solution fit aligns with real enterprise or commercial sector workflows.`,
      whatHelpTheyCanProvide: 'Provide real-world pilot feedback, identify regulatory/compliance standards, and explore future sponsorship.',
      whenToApproach: 'Month 3 when preparing for public pilot testing.',
      priority: 'Low' as const,
      iconName: 'Briefcase'
    }
  ];

  return {
    projectNeedsSummary: {
      technical: `Code review and refactoring for ${primaryLang} modules, database migrations, and CI pipeline setup.`,
      domain: `Validation of problem assumptions against the target market (${repo.topics.join(', ') || 'end-user workflows'}).`,
      business: 'Structuring a sustainable value proposition and non-profit or student venture roadmap.',
      testing: 'Usability testing sessions with 5-10 real users to discover navigational friction.',
      deployment: 'Moving from local environment to persistent cloud hosting with continuous deployment.',
      industry: 'Feedback from domain practitioners to explore pilot deployment potential.',
      fundingIncubation: 'Securing university incubator seed grants and student cloud credits.',
      community: 'Establishing open-source contribution guidelines to invite fellow student contributors.'
    },
    mustHave,
    shouldHave,
    niceToHave,
    mentorGuidance:
      'When approaching mentors or incubation cells, do not say "Can you look at my project?". Instead, say: "We built this prototype at a hackathon, deployed it live here, and have identified 2 specific technical hurdles in our architecture. Could we get 15 minutes of your guidance on solving these specific issues?" Specific questions get immediate responses.'
  };
}

export function planAfterlifeWithPersona(repo: RepoDetails): PlannerResult {
  const primaryLang = repo.language || 'Software';
  const hasTests = repo.detectedStack.hasTests;

  const top5Actions = [
    {
      number: 1,
      title: 'Deploy to a Public URL & Eliminate Localhost Dependency',
      description: 'Host your frontend on Vercel/Cloudflare and backend on Render so anyone can test your project with a single click without installing dependencies.',
      impact: 'Immediate 10x boost in project visibility and shareability.'
    },
    {
      number: 2,
      title: 'Replace Mock Data with a Persistent Cloud Database',
      description: 'Connect a free PostgreSQL database (Supabase or Neon) so user actions and data survive browser refreshes and server restarts.',
      impact: 'Transforms a visual mock into a functional application.'
    },
    {
      number: 3,
      title: 'Establish a Baseline Automated Test Suite',
      description: `Write 3 to 5 automated unit tests in ${primaryLang} covering your most critical user journey (e.g. signup, submitting data, generating results).`,
      impact: 'Prevents regressions and gives you confidence to add features without breaking existing code.'
    },
    {
      number: 4,
      title: 'Conduct 5 Recorded User Testing Sessions',
      description: 'Watch 5 fellow students try to accomplish the project\'s primary goal without explaining anything. Write down every moment they hesitate or click the wrong button.',
      impact: 'Uncovers the real UX flaws that developers are blind to.'
    },
    {
      number: 5,
      title: 'Draft a Clear Problem/Solution Showcase README',
      description: 'Add a 60-second Loom demo video link, architecture diagram, live demo badge, and step-by-step contribution instructions to your GitHub repository.',
      impact: 'Makes your repository stand out to recruiters, hackathon judges, and open-source contributors.'
    }
  ];

  const thirtyDay = {
    title: 'Phase 1: Stabilization & Public Availability',
    days: 30,
    objective: 'Transform the raw hackathon prototype into a stable, deployed, zero-friction web application that works consistently for any visitor.',
    tasks: [
      'Clean up codebase: remove console.logs, commented-out dead code, and temporary hackathon mock files.',
      'Create `.env.example` and sanitize any hardcoded API secrets or tokens.',
      'Deploy the frontend and backend to free-tier cloud hosting with automatic git deployment.',
      hasTests ? 'Verify all existing tests pass on GitHub Actions' : 'Create 3 smoke tests verifying core API endpoints.',
      'Record a concise 90-second video demo walkthrough and embed it at the top of your GitHub README.'
    ],
    deliverable: 'A live, publicly accessible URL with automated deployment and a clean GitHub README.'
  };

  const sixtyDay = {
    title: 'Phase 2: Validation & Usability Refinement',
    days: 60,
    objective: 'Test the application with 15-20 real users, gather concrete feedback, and implement the top requested improvements.',
    tasks: [
      'Onboard 10-15 target users (classmates, club members, or online community members) to use the tool.',
      'Log usability blockers and prioritize the top 3 UX friction points.',
      'Integrate production error monitoring (e.g. Sentry free tier) to catch live crashes automatically.',
      'Implement authentication (Clerk or Supabase) to allow individual user accounts and saved history.',
      'Optimize database queries and API response times for smooth user interaction.'
    ],
    deliverable: 'An authenticated, user-tested MVP with active student pilot usage and telemetry.'
  };

  const ninetyDay = {
    title: 'Phase 3: Ecosystem Expansion & Continuity',
    days: 90,
    objective: 'Transition the project from an individual student repository into a sustainable community project or university incubation venture.',
    tasks: [
      'Submit the validated project to your college Innovation & Incubation Cell (IIC) or student grant program.',
      'Publish a comprehensive CONTRIBUTING.md and label beginner-friendly issues to onboard fellow students.',
      'Present project outcomes to college department heads or student clubs as an adopted internal tool.',
      'Write a technical case study / blog post detailing architectural lessons learned.',
      'Set up a standing maintenance schedule (1 hour weekly) to review pull requests and update dependencies.'
    ],
    deliverable: 'Institutional adoption, open-source contributors, or formal incubation milestone.'
  };

  const roadmap: PlannerResult['roadmap'] = [
    {
      id: 'road-1',
      phase: 'NOW',
      title: 'Fix Deployment & Storage Foundations',
      description: 'Get off localhost. Deploy to free cloud hosting and link a serverless PostgreSQL database.',
      targetDays: 'Days 1 - 14',
      keyAction: 'Push live Vercel/Render URLs and sanitize environment variables.',
      badge: 'Immediate Priority'
    },
    {
      id: 'road-2',
      phase: 'NOW',
      title: 'Test Core Journey with 5 Users',
      description: 'Observe non-developer peers navigating the app to catch glaring UX flaws.',
      targetDays: 'Days 15 - 30',
      keyAction: 'Document 5 user friction points and fix top 2.',
      badge: 'Foundational'
    },
    {
      id: 'road-3',
      phase: 'NEXT',
      title: 'Implement Authentication & State Retention',
      description: 'Allow users to log in, save their preferences, and resume their work.',
      targetDays: 'Days 31 - 60',
      keyAction: 'Integrate Clerk or Supabase Auth with secure session cookies.',
      badge: 'Core Feature'
    },
    {
      id: 'road-4',
      phase: 'NEXT',
      title: 'Automated CI/CD Quality Gateways',
      description: 'Ensure pull requests must pass linter and test suites before merging.',
      targetDays: 'Days 45 - 60',
      keyAction: 'Add GitHub Actions check for build and test commands.',
      badge: 'Engineering Hygiene'
    },
    {
      id: 'road-5',
      phase: 'LATER',
      title: 'Campus / Community Pilot Rollout',
      description: 'Offer the tool to a student organization, lab, or academic course as a formal pilot.',
      targetDays: 'Days 61 - 90',
      keyAction: 'Conduct a 2-week active pilot and measure repeat usage.',
      badge: 'Adoption'
    },
    {
      id: 'road-6',
      phase: 'LATER',
      title: 'Institutional Incubation Application',
      description: 'Present traction and pilot data to university E-Cell or student grants for continued funding.',
      targetDays: 'Days 75 - 90+',
      keyAction: 'Submit pitch deck and live demo to campus incubator.',
      badge: 'Sustainability'
    }
  ];

  return {
    currentStage: repo.stars > 10 || hasTests ? 'Functional Prototype / Early MVP' : 'Hackathon Sprint Prototype',
    biggestBlockers: [
      'Lack of public deployment makes sharing and testing cumbersome for external reviewers.',
      hasTests ? 'Limited edge-case test coverage' : 'Zero automated tests leaves code susceptible to regressions during updates.',
      'Unstructured feedback loop: no systematic method to collect bug reports or feature requests from pilot users.'
    ],
    mostImportantImprovements: [
      'Migrate from local persistence to a cloud-hosted database (e.g. Supabase / PostgreSQL).',
      'Implement user session authentication so people can save their progress.',
      'Improve responsive layout so the app works seamlessly on mobile devices.'
    ],
    targetUsers: [
      'Undergraduate and graduate students seeking automated productivity tooling',
      'Campus clubs, hackathon organizers, and academic laboratory researchers',
      'Junior developers exploring open-source portfolio projects'
    ],
    realWorldUseCases: [
      `Automating manual student workflows using ${primaryLang} routines`,
      'Demonstration benchmark for academic coursework or capstone project submission',
      'Modular base template for future student developer hackathons'
    ],
    pilotOpportunities: [
      'Pilot with 15 classmates in a relevant computer science or engineering elective course',
      'Partner with a college student tech club (ACM, IEEE, GDSC) for interactive workshop testing',
      'Post on relevant student developer Discord communities and Reddit r/hackathons for beta testers'
    ],
    validationStrategy:
      'Deploy the application live, invite 20 target users to complete a specific task, and measure task completion rate and qualitative feedback score without intervention.',
    longTermPossibilities:
      'If validated with consistent student usage, this project can evolve into a recognized open-source tool, a college department utility, or a venture-backed student startup. Maintain realistic expectations: focus first on utility for 10 users before worrying about 10,000.',
    top5Actions,
    thirtyDayPlan: thirtyDay,
    sixtyDayPlan: sixtyDay,
    ninetyDayPlan: ninetyDay,
    roadmap
  };
}
