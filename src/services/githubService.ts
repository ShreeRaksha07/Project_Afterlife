import type { RepoDetails } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  owner?: string;
  repo?: string;
}

export function validateGithubUrl(rawUrl: string): ValidationResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Please enter a GitHub repository URL.'
    };
  }

  const githubPattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/;
  const match = trimmed.match(githubPattern);

  if (!match) {
    return {
      valid: false,
      error: 'Please enter a valid GitHub repository URL.'
    };
  }

  const owner = match[1];
  let repo = match[2];
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  if (!owner || !repo) {
    return {
      valid: false,
      error: 'Please enter a valid GitHub repository URL.'
    };
  }

  return {
    valid: true,
    owner,
    repo
  };
}

export async function fetchRepositoryDetails(rawUrl: string): Promise<RepoDetails> {
  const validation = validateGithubUrl(rawUrl);
  if (!validation.valid || !validation.owner || !validation.repo) {
    throw new Error(validation.error || 'Please enter a valid GitHub repository URL.');
  }

  const { owner, repo } = validation;
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

  try {
    // 1. Fetch main repo metadata
    const repoRes = await fetch(baseUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (repoRes.status === 404) {
      throw new Error(
        'This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct.'
      );
    }

    if (repoRes.status === 403) {
      const errorData = await repoRes.json().catch(() => ({}));
      if (errorData.message && errorData.message.includes('rate limit')) {
        throw new Error(
          'GitHub API rate limit reached for unauthenticated requests. Please wait a few minutes or try again shortly.'
        );
      }
      throw new Error(
        'This repository could not be analyzed. Access was forbidden (it may be private or rate limited).'
      );
    }

    if (!repoRes.ok) {
      throw new Error(
        'This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct.'
      );
    }

    const repoData = await repoRes.json();

    // 2. Fetch languages breakdown
    let languages: Record<string, number> = {};
    try {
      const langRes = await fetch(`${baseUrl}/languages`);
      if (langRes.ok) {
        languages = await langRes.json();
      }
    } catch {
      // Non-critical, continue
    }

    // 3. Fetch root directory contents
    let rootFiles: string[] = [];
    try {
      const contentsRes = await fetch(`${baseUrl}/contents`);
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          rootFiles = contents.map((item: { name: string }) => item.name);
        }
      }
    } catch {
      // Non-critical
    }

    // 4. Fetch README if present
    let readmeContent = '';
    try {
      const readmeRes = await fetch(`${baseUrl}/readme`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      });
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        if (readmeData.content) {
          readmeContent = decodeBase64Utf8(readmeData.content);
        }
      }
    } catch {
      // Non-critical
    }

    // 5. Detect Stack indicators
    const detected = detectStackFromFiles(rootFiles, languages, readmeContent);

    return {
      owner,
      name: repoData.name || repo,
      fullName: repoData.full_name || `${owner}/${repo}`,
      url: repoData.html_url || `https://github.com/${owner}/${repo}`,
      description: repoData.description || 'No description provided by repository author.',
      stars: repoData.stargazers_count ?? 0,
      forks: repoData.forks_count ?? 0,
      openIssues: repoData.open_issues_count ?? 0,
      language: repoData.language || Object.keys(languages)[0] || 'Unknown',
      languages,
      topics: Array.isArray(repoData.topics) ? repoData.topics : [],
      defaultBranch: repoData.default_branch || 'main',
      license: repoData.license?.name || null,
      createdAt: repoData.created_at || new Date().toISOString(),
      updatedAt: repoData.pushed_at || repoData.updated_at || new Date().toISOString(),
      readmeContent,
      rootFiles,
      detectedStack: detected
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('This repository could not be analyzed. Please make sure the GitHub repository is public and the URL is correct.');
  }
}

function decodeBase64Utf8(base64Str: string): string {
  try {
    const cleanStr = base64Str.replace(/\n/g, '');
    const binary = atob(cleanStr);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function detectStackFromFiles(
  files: string[],
  languages: Record<string, number>,
  readme: string
) {
  const lowerFiles = files.map((f) => f.toLowerCase());
  const lowerReadme = readme.toLowerCase();

  const hasDocker = lowerFiles.some((f) => f.includes('dockerfile') || f.includes('docker-compose'));
  const hasTests = lowerFiles.some(
    (f) => f.includes('test') || f.includes('spec') || f.includes('jest') || f.includes('pytest')
  );
  const hasCiCd = lowerFiles.includes('.github') || lowerFiles.includes('.gitlab-ci.yml');
  const hasEnvExample = lowerFiles.some((f) => f.includes('.env.example') || f.includes('.env.sample'));
  const hasLicense = lowerFiles.some((f) => f.includes('license') || f.includes('copying'));

  const frontend: string[] = [];
  const backend: string[] = [];
  const database: string[] = [];
  const testing: string[] = [];
  const aiMl: string[] = [];

  // Frontend heuristics
  if (lowerReadme.includes('react') || (lowerFiles.includes('package.json') && lowerReadme.includes('react')) || 'TypeScript' in languages || 'JavaScript' in languages) {
    if (lowerReadme.includes('react')) frontend.push('React');
  }
  if (lowerReadme.includes('next.js') || lowerReadme.includes('nextjs')) frontend.push('Next.js');
  if (lowerReadme.includes('vue')) frontend.push('Vue.js');
  if (lowerReadme.includes('tailwind')) frontend.push('Tailwind CSS');
  if (lowerReadme.includes('vite')) frontend.push('Vite');
  if (lowerFiles.includes('index.html') && frontend.length === 0) frontend.push('HTML/CSS/JS');

  // Backend heuristics
  if (lowerReadme.includes('express') || lowerFiles.includes('server.js') || lowerFiles.includes('app.js')) backend.push('Node.js / Express');
  if (lowerReadme.includes('fastapi')) backend.push('FastAPI');
  if (lowerReadme.includes('flask')) backend.push('Flask');
  if (lowerReadme.includes('django')) backend.push('Django');
  if (lowerReadme.includes('spring') || lowerFiles.includes('pom.xml')) backend.push('Spring Boot');
  if (lowerFiles.includes('go.mod')) backend.push('Go HTTP / Gin');

  // Database heuristics
  if (lowerReadme.includes('mongodb') || lowerReadme.includes('mongoose')) database.push('MongoDB');
  if (lowerReadme.includes('postgresql') || lowerReadme.includes('postgres')) database.push('PostgreSQL');
  if (lowerReadme.includes('mysql')) database.push('MySQL');
  if (lowerReadme.includes('sqlite')) database.push('SQLite');
  if (lowerReadme.includes('firebase') || lowerReadme.includes('firestore')) database.push('Firebase / Firestore');
  if (lowerReadme.includes('supabase')) database.push('Supabase');

  // AI / ML heuristics
  if (
    lowerReadme.includes('gemini') ||
    lowerReadme.includes('openai') ||
    lowerReadme.includes('langchain') ||
    lowerReadme.includes('pytorch') ||
    lowerReadme.includes('tensorflow') ||
    lowerReadme.includes('huggingface') ||
    lowerReadme.includes('scikit-learn')
  ) {
    if (lowerReadme.includes('openai')) aiMl.push('OpenAI API');
    if (lowerReadme.includes('gemini')) aiMl.push('Gemini AI');
    if (lowerReadme.includes('langchain')) aiMl.push('LangChain');
    if (lowerReadme.includes('pytorch')) aiMl.push('PyTorch');
    if (lowerReadme.includes('tensorflow')) aiMl.push('TensorFlow');
  }

  // Testing heuristics
  if (hasTests) {
    if (lowerReadme.includes('jest')) testing.push('Jest');
    if (lowerReadme.includes('pytest')) testing.push('PyTest');
    if (lowerReadme.includes('cypress')) testing.push('Cypress');
  }

  return {
    frontend: frontend.length ? frontend : ['Vanilla HTML/JS or Unspecified UI'],
    backend: backend.length ? backend : ['Express/Node or Monolithic scripts'],
    database: database.length ? database : ['Local Storage / JSON file / Unspecified'],
    testing: testing.length ? testing : (hasTests ? ['Unit test files detected'] : ['No automated tests']),
    aiMl: aiMl.length ? aiMl : [],
    hasDocker,
    hasTests,
    hasCiCd,
    hasEnvExample,
    hasLicense
  };
}
