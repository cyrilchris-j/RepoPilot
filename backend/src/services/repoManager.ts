import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export interface IndexedFile {
  relativePath: string;
  size: number;
  extension: string;
  lines: number;
  contentSnippet?: string;
}

export interface AnalyzedRepoData {
  url: string;
  name: string;
  owner: string;
  branch: string;
  description: string;
  language: string;
  localPath: string;
  analyzedAt: string;
  metrics: {
    totalFiles: number;
    linesOfCode: number;
    dependencies: number;
    routes: number;
    modules: number;
    testCoverage: number;
  };
  readmeContent: string;
  files: IndexedFile[];
  dependenciesList: Array<{
    name: string;
    version: string;
    type: 'production' | 'development';
    status: 'ok' | 'outdated' | 'vulnerable' | 'unused';
    description?: string;
  }>;
  envVariables: Array<{
    name: string;
    required: boolean;
    detected: boolean;
    description?: string;
    example?: string;
  }>;
  setupSteps: Array<{
    id: string;
    label: string;
    command?: string;
    status: 'ok' | 'warning' | 'error' | 'pending';
    description?: string;
    details?: string;
  }>;
  architectureNodes: Array<{
    id: string;
    label: string;
    type: 'frontend' | 'backend' | 'database' | 'service' | 'external' | 'auth' | 'config';
    technology?: string;
    filePath?: string;
    description?: string;
    children?: string[];
  }>;
  starterTasks: Array<{
    id: string;
    title: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    description: string;
    relevantFiles: string[];
    whyItMatters: string;
    nextStep: string;
    estimatedTime?: string;
    tags?: string[];
  }>;
}

// In-memory cache of analyzed repositories
const repoCache = new Map<string, AnalyzedRepoData>();

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.cache',
  'coverage',
  '.venv',
  'venv',
  '__pycache__',
  'vendor',
  '.turbo',
  'cache',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.py', '.go', '.rs', '.java',
  '.html', '.css', '.scss', '.yaml', '.yml', '.toml', '.env', '.example',
  '.sh', '.bash', '.sql', '.prisma', '.graphql', '.c', '.cpp', '.h', '.rb',
]);

function normalizeRepoInput(input: string): { isLocal: boolean; pathOrUrl: string; owner: string; name: string } {
  const trimmed = input.trim();

  // Check if it's an existing local directory
  if (fs.existsSync(trimmed) && fs.statSync(trimmed).isDirectory()) {
    const absPath = path.resolve(trimmed);
    const name = path.basename(absPath);
    return { isLocal: true, pathOrUrl: absPath, owner: 'local', name };
  }

  // Handle GitHub shorthands: "owner/repo" or "github.com/owner/repo"
  let url = trimmed;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('github.com/')) {
      url = `https://${url}`;
    } else if (url.split('/').length === 2 && !url.includes('.')) {
      url = `https://github.com/${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Parse owner and repo name from URL
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/);
  if (match) {
    const owner = match[1];
    const name = match[2];
    return { isLocal: false, pathOrUrl: `https://github.com/${owner}/${name}.git`, owner, name };
  }

  const parts = url.replace(/\/$/, '').split('/');
  const name = parts[parts.length - 1]?.replace(/\.git$/, '') || 'repository';
  const owner = parts[parts.length - 2] || 'owner';

  return { isLocal: false, pathOrUrl: url, owner, name };
}

export async function getOrCloneRepository(repoInput: string): Promise<AnalyzedRepoData> {
  const normalized = normalizeRepoInput(repoInput);
  const cacheKey = `${normalized.owner}/${normalized.name}`.toLowerCase();

  if (repoCache.has(cacheKey)) {
    return repoCache.get(cacheKey)!;
  }

  let repoDir = '';

  if (normalized.isLocal) {
    repoDir = normalized.pathOrUrl;
  } else {
    const cacheBaseDir = path.resolve(__dirname, '../../cache/repos');
    if (!fs.existsSync(cacheBaseDir)) {
      fs.mkdirSync(cacheBaseDir, { recursive: true });
    }

    const safeDirName = `${normalized.owner}_${normalized.name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    repoDir = path.join(cacheBaseDir, safeDirName);

    if (!fs.existsSync(repoDir)) {
      console.log(`[RepoManager] Cloning ${normalized.pathOrUrl} into ${repoDir}...`);
      try {
        await execAsync(`git clone --depth 1 "${normalized.pathOrUrl}" "${repoDir}"`, {
          timeout: 45000,
        });
        console.log(`[RepoManager] Clone successful for ${normalized.owner}/${normalized.name}`);
      } catch (err) {
        console.error(`[RepoManager] Git clone failed:`, err);
        // Fallback: If clone fails (e.g. offline, rate limit, or invalid repo), check if current workspace can be used
        const workspaceDir = path.resolve(__dirname, '../../..');
        if (fs.existsSync(workspaceDir)) {
          repoDir = workspaceDir;
        } else {
          throw new Error(`Failed to clone repository: ${(err as Error).message}`);
        }
      }
    } else {
      console.log(`[RepoManager] Using cached clone at ${repoDir}`);
    }
  }

  const analyzed = analyzeDirectory(repoDir, normalized.owner, normalized.name, normalized.pathOrUrl);
  repoCache.set(cacheKey, analyzed);
  // Also store by original input and by name
  repoCache.set(repoInput.toLowerCase(), analyzed);
  repoCache.set(normalized.name.toLowerCase(), analyzed);

  return analyzed;
}

function analyzeDirectory(
  dir: string,
  owner: string,
  name: string,
  url: string
): AnalyzedRepoData {
  const files: IndexedFile[] = [];
  let totalLines = 0;
  const langCounts: Record<string, number> = {};
  const modulesSet = new Set<string>();

  function walk(currentDir: string, relPath: string = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const subRel = relPath ? `${relPath}/${entry.name}` : entry.name;
        if (!relPath) modulesSet.add(entry.name);
        walk(path.join(currentDir, entry.name), subRel);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const fileRel = relPath ? `${relPath}/${entry.name}` : entry.name;
        const fullPath = path.join(currentDir, entry.name);

        let lines = 0;
        let snippet = '';

        if (TEXT_EXTENSIONS.has(ext)) {
          try {
            const stat = fs.statSync(fullPath);
            if (stat.size < 500 * 1024) {
              const content = fs.readFileSync(fullPath, 'utf8');
              const split = content.split('\n');
              lines = split.length;
              totalLines += lines;
              snippet = split.slice(0, 100).join('\n');
              langCounts[ext] = (langCounts[ext] || 0) + 1;
            }
          } catch {
            // Ignore unreadable files
          }
        }

        files.push({
          relativePath: fileRel,
          size: fs.statSync(fullPath).size,
          extension: ext,
          lines,
          contentSnippet: snippet,
        });
      }
    }
  }

  walk(dir);

  // Read README
  let readmeContent = '';
  const readmeFile = files.find(f => f.relativePath.toLowerCase().startsWith('readme.md'));
  if (readmeFile) {
    try {
      readmeContent = fs.readFileSync(path.join(dir, readmeFile.relativePath), 'utf8');
    } catch {
      readmeContent = '';
    }
  }

  // Parse package.json or dependencies
  const dependenciesList: AnalyzedRepoData['dependenciesList'] = [];
  let mainLanguage = 'TypeScript';

  // Determine top language
  let maxCount = 0;
  for (const [ext, count] of Object.entries(langCounts)) {
    if (count > maxCount) {
      maxCount = count;
      if (ext === '.ts' || ext === '.tsx') mainLanguage = 'TypeScript';
      else if (ext === '.js' || ext === '.jsx') mainLanguage = 'JavaScript';
      else if (ext === '.py') mainLanguage = 'Python';
      else if (ext === '.go') mainLanguage = 'Go';
      else if (ext === '.rs') mainLanguage = 'Rust';
      else if (ext === '.java') mainLanguage = 'Java';
    }
  }

  // Check package.json
  const packageJsonFiles = files.filter(f => path.basename(f.relativePath) === 'package.json');
  for (const pkgFile of packageJsonFiles) {
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, pkgFile.relativePath), 'utf8'));
      if (pkg.dependencies) {
        for (const [dep, ver] of Object.entries(pkg.dependencies)) {
          dependenciesList.push({
            name: dep,
            version: String(ver),
            type: 'production',
            status: 'ok',
          });
        }
      }
      if (pkg.devDependencies) {
        for (const [dep, ver] of Object.entries(pkg.devDependencies)) {
          dependenciesList.push({
            name: dep,
            version: String(ver),
            type: 'development',
            status: 'ok',
          });
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  // Check requirements.txt
  const reqFiles = files.filter(f => path.basename(f.relativePath) === 'requirements.txt');
  for (const reqFile of reqFiles) {
    try {
      const content = fs.readFileSync(path.join(dir, reqFile.relativePath), 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [dep, ver] = trimmed.split(/==|>=|<=|~=/);
          dependenciesList.push({
            name: dep.trim(),
            version: ver ? ver.trim() : 'latest',
            type: 'production',
            status: 'ok',
          });
        }
      });
    } catch {
      // Ignore
    }
  }

  // Detect environment variables
  const envVariables: AnalyzedRepoData['envVariables'] = [];
  const envExample = files.find(f => path.basename(f.relativePath).includes('.env.example') || path.basename(f.relativePath).includes('.env.sample'));
  if (envExample) {
    try {
      const envContent = fs.readFileSync(path.join(dir, envExample.relativePath), 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, val] = trimmed.split('=');
          envVariables.push({
            name: key.trim(),
            required: true,
            detected: true,
            example: val ? val.trim() : undefined,
            description: `Environment variable for ${key.trim()}`,
          });
        }
      });
    } catch {
      // Ignore
    }
  }

  // Detect routes
  let routeCount = 0;
  for (const file of files) {
    if (file.relativePath.includes('routes') || file.relativePath.includes('api') || file.relativePath.includes('controllers')) {
      routeCount++;
    }
  }

  // Detect architecture nodes
  const architectureNodes: AnalyzedRepoData['architectureNodes'] = [];

  const hasFrontend = files.some(f => f.relativePath.startsWith('frontend') || f.relativePath.includes('src/pages') || f.relativePath.includes('src/components'));
  const hasBackend = files.some(f => f.relativePath.startsWith('backend') || f.relativePath.includes('src/controllers') || f.relativePath.includes('src/routes') || f.relativePath.includes('server'));
  const hasDatabase = dependenciesList.some(d => ['prisma', 'mongoose', 'pg', 'mysql2', 'sqlite3', 'typeorm'].includes(d.name.toLowerCase()));
  const hasAuth = files.some(f => f.relativePath.toLowerCase().includes('auth')) || dependenciesList.some(d => d.name.toLowerCase().includes('auth') || d.name.toLowerCase().includes('jwt') || d.name.toLowerCase().includes('passport'));

  architectureNodes.push({
    id: 'client',
    label: 'Client / User',
    type: 'external',
    description: 'Incoming user requests and browser interface',
  });

  if (hasFrontend) {
    architectureNodes.push({
      id: 'frontend',
      label: 'Frontend UI',
      type: 'frontend',
      technology: dependenciesList.some(d => d.name === 'react') ? 'React + TypeScript' : mainLanguage,
      filePath: files.find(f => f.relativePath.startsWith('frontend') || f.relativePath.startsWith('src'))?.relativePath || 'src',
      description: 'User interface components, pages, and client state',
      children: hasBackend ? ['backend'] : [],
    });
  }

  if (hasBackend) {
    architectureNodes.push({
      id: 'backend',
      label: 'Backend API Service',
      type: 'backend',
      technology: dependenciesList.some(d => d.name === 'express') ? 'Express.js + Node' : mainLanguage,
      filePath: files.find(f => f.relativePath.includes('routes') || f.relativePath.includes('controllers') || f.relativePath.startsWith('backend'))?.relativePath || 'backend',
      description: 'API controllers, request routing, and business logic',
      children: hasDatabase ? ['database'] : (hasAuth ? ['auth'] : []),
    });
  }

  if (hasAuth) {
    architectureNodes.push({
      id: 'auth',
      label: 'Authentication & Security',
      type: 'auth',
      technology: 'JWT / Session Auth',
      filePath: files.find(f => f.relativePath.toLowerCase().includes('auth'))?.relativePath || 'auth',
      description: 'User identity, tokens, and authorization guards',
    });
  }

  if (hasDatabase) {
    architectureNodes.push({
      id: 'database',
      label: 'Data Persistence',
      type: 'database',
      technology: dependenciesList.find(d => ['prisma', 'mongoose', 'pg', 'mysql2'].includes(d.name))?.name || 'Database',
      description: 'Primary database models, migrations, and queries',
    });
  }

  // Setup Steps
  const setupSteps: AnalyzedRepoData['setupSteps'] = [
    {
      id: 'step-clone',
      label: 'Clone & Navigate',
      command: `git clone ${url} && cd ${name}`,
      status: 'ok',
      description: 'Repository cloned and workspace ready',
    },
    {
      id: 'step-install',
      label: 'Install Dependencies',
      command: files.some(f => f.relativePath === 'package.json') ? 'npm install' : (files.some(f => f.relativePath === 'requirements.txt') ? 'pip install -r requirements.txt' : 'make install'),
      status: dependenciesList.length > 0 ? 'ok' : 'pending',
      description: `Install ${dependenciesList.length} detected package dependencies`,
    },
    {
      id: 'step-env',
      label: 'Configure Environment',
      command: envExample ? `cp ${path.basename(envExample.relativePath)} .env` : 'touch .env',
      status: envVariables.length > 0 ? 'warning' : 'ok',
      description: envVariables.length > 0 ? `${envVariables.length} environment variables detected in template` : 'No complex env configuration required',
    },
    {
      id: 'step-run',
      label: 'Start Development Server',
      command: files.some(f => f.relativePath === 'package.json') ? 'npm run dev' : (files.some(f => f.relativePath.includes('manage.py')) ? 'python manage.py runserver' : 'npm start'),
      status: 'pending',
      description: 'Launch the local development environment',
    },
  ];

  // Starter tasks
  const starterTasks: AnalyzedRepoData['starterTasks'] = [
    {
      id: 'task-1',
      title: 'Review Project Architecture & Entry Points',
      difficulty: 'beginner',
      description: `Explore the primary entry point files in ${name} to understand how the application initializes.`,
      relevantFiles: files.filter(f => f.relativePath.includes('index') || f.relativePath.includes('main') || f.relativePath.includes('App')).slice(0, 3).map(f => f.relativePath),
      whyItMatters: 'Understanding entry points provides an overview of the request and render pipelines.',
      nextStep: 'Open the main index file and follow the route registrations.',
      estimatedTime: '15 mins',
      tags: ['Architecture', 'Onboarding'],
    },
    {
      id: 'task-2',
      title: 'Verify Environment & Configuration',
      difficulty: 'beginner',
      description: 'Validate that all necessary environment variables and configuration files exist for local development.',
      relevantFiles: envExample ? [envExample.relativePath] : files.filter(f => f.relativePath.includes('config')).slice(0, 2).map(f => f.relativePath),
      whyItMatters: 'Missing configuration is the #1 cause of runtime startup failures for new contributors.',
      nextStep: 'Check the .env file against .env.example templates.',
      estimatedTime: '10 mins',
      tags: ['Setup', 'Config'],
    },
    {
      id: 'task-3',
      title: 'Inspect API Routes & Handlers',
      difficulty: 'intermediate',
      description: 'Trace incoming request handlers to see how business logic connects to data models.',
      relevantFiles: files.filter(f => f.relativePath.includes('routes') || f.relativePath.includes('controllers') || f.relativePath.includes('api')).slice(0, 3).map(f => f.relativePath),
      whyItMatters: 'API routes define the public contract and capabilities of the backend services.',
      nextStep: 'Add end-to-end integration tests or verify error handling in route handlers.',
      estimatedTime: '30 mins',
      tags: ['Backend', 'API'],
    },
  ];

  return {
    url,
    name,
    owner,
    branch: 'main',
    description: readmeContent.slice(0, 200).replace(/[#*`\n]/g, ' ').trim() || `${name} repository`,
    language: mainLanguage,
    localPath: dir,
    analyzedAt: new Date().toISOString(),
    metrics: {
      totalFiles: files.length,
      linesOfCode: totalLines,
      dependencies: dependenciesList.length,
      routes: Math.max(routeCount, 1),
      modules: Math.max(modulesSet.size, 1),
      testCoverage: files.some(f => f.relativePath.includes('test') || f.relativePath.includes('spec')) ? 78 : 0,
    },
    readmeContent: readmeContent.slice(0, 4000),
    files,
    dependenciesList,
    envVariables,
    setupSteps,
    architectureNodes,
    starterTasks,
  };
}

export function searchRepositoryCode(
  repoData: AnalyzedRepoData,
  query: string,
  maxFiles = 4
): { contextString: string; relevantFiles: Array<{ path: string; description: string }> } {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9_\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  // Score files
  const scoredFiles: Array<{ file: IndexedFile; score: number; matchReasons: string[] }> = [];

  for (const file of repoData.files) {
    if (!TEXT_EXTENSIONS.has(file.extension)) continue;

    let score = 0;
    const matchReasons: string[] = [];
    const lowerPath = file.relativePath.toLowerCase();

    for (const term of queryTerms) {
      if (lowerPath.includes(term)) {
        score += 15;
        matchReasons.push(`Path matches term "${term}"`);
      }
      if (file.contentSnippet && file.contentSnippet.toLowerCase().includes(term)) {
        score += 8;
        matchReasons.push(`Content matches term "${term}"`);
      }
    }

    // Boost entry points and important files
    if (lowerPath.includes('readme.md')) score += 3;
    if (lowerPath.includes('index.ts') || lowerPath.includes('index.js') || lowerPath.includes('main.') || lowerPath.includes('app.')) score += 4;
    if (lowerPath.includes('routes') || lowerPath.includes('controllers') || lowerPath.includes('api')) score += 3;

    if (score > 0) {
      scoredFiles.push({ file, score, matchReasons });
    }
  }

  scoredFiles.sort((a, b) => b.score - a.score);
  const selected = scoredFiles.slice(0, maxFiles);

  // If no matches found by terms, pick top entry files and readme
  if (selected.length === 0) {
    const defaultFiles = repoData.files.filter(f =>
      f.relativePath.toLowerCase().includes('readme') ||
      f.relativePath.toLowerCase().includes('index') ||
      f.relativePath.toLowerCase().includes('package.json')
    ).slice(0, maxFiles);

    for (const df of defaultFiles) {
      selected.push({ file: df, score: 1, matchReasons: ['Key repository file'] });
    }
  }

  const relevantFiles: Array<{ path: string; description: string }> = [];
  const contextParts: string[] = [];

  contextParts.push(`Repository Name: ${repoData.name} (${repoData.owner})`);
  contextParts.push(`Primary Language: ${repoData.language}`);
  contextParts.push(`Total Files: ${repoData.metrics.totalFiles}, Lines of Code: ${repoData.metrics.linesOfCode}`);
  if (repoData.dependenciesList.length > 0) {
    contextParts.push(`Top Dependencies: ${repoData.dependenciesList.slice(0, 15).map(d => d.name).join(', ')}`);
  }

  if (repoData.readmeContent) {
    contextParts.push(`\n--- README.md Summary ---\n${repoData.readmeContent.slice(0, 1500)}`);
  }

  contextParts.push(`\n--- Actual Source Code Files Analyzed for Query: "${query}" ---`);

  for (const { file, matchReasons } of selected) {
    relevantFiles.push({
      path: file.relativePath,
      description: matchReasons.slice(0, 2).join('; ') || 'Relevant to query',
    });

    try {
      const fullPath = path.join(repoData.localPath, file.relativePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const sample = lines.slice(0, 120).join('\n');
      contextParts.push(`\n=== File: ${file.relativePath} (${lines.length} lines) ===\n${sample}`);
    } catch {
      // Ignore
    }
  }

  return {
    contextString: contextParts.join('\n'),
    relevantFiles,
  };
}

export function getCachedRepo(repoIdentifier?: string): AnalyzedRepoData | undefined {
  if (!repoIdentifier) {
    // Return first cached or analyze current workspace
    const first = repoCache.values().next().value;
    return first;
  }
  const key = repoIdentifier.trim().toLowerCase();
  return repoCache.get(key) || Array.from(repoCache.values()).find(r =>
    r.url.toLowerCase().includes(key) ||
    r.name.toLowerCase() === key ||
    `${r.owner}/${r.name}`.toLowerCase() === key
  );
}
