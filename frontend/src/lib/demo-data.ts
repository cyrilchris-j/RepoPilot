import type {
  Repository,
  RepositoryMetrics,
  ArchitectureNode,
  ArchitectureEdge,
  Dependency,
  EnvVariable,
  SetupStep,
  StarterTask,
  AnalysisActivity,
  GitInsights,
} from '../types';

// Demo repository data — clearly labeled as sample/demo data
export const DEMO_REPO: Repository = {
  url: 'github.com/vercel/next.js',
  name: 'next.js',
  owner: 'vercel',
  branch: 'canary',
  description: 'The React Framework for the Web',
  language: 'TypeScript',
  stars: 128000,
  analyzedAt: new Date().toISOString(),
  status: 'complete',
};

export const DEMO_METRICS: RepositoryMetrics = {
  totalFiles: 3842,
  dependencies: 147,
  routes: 89,
  modules: 312,
  linesOfCode: 284720,
  testCoverage: 74,
};

export const DEMO_ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'client',
    label: 'Client Browser',
    type: 'external',
    description: 'End-user browser environment',
  },
  {
    id: 'nextjs-frontend',
    label: 'Next.js App Router',
    type: 'frontend',
    technology: 'React + TypeScript',
    filePath: 'packages/next/src/client',
    description: 'Client-side rendering, routing, and hydration',
    children: ['api-routes', 'middleware'],
  },
  {
    id: 'middleware',
    label: 'Edge Middleware',
    type: 'service',
    technology: 'Edge Runtime',
    filePath: 'packages/next/src/server/middleware-routine.ts',
    description: 'Request interception and transformation at the edge',
    children: ['api-routes'],
  },
  {
    id: 'api-routes',
    label: 'API Routes',
    type: 'backend',
    technology: 'Node.js',
    filePath: 'packages/next/src/server/route-modules/app-route',
    description: 'Serverless API endpoints and route handlers',
    children: ['auth', 'database'],
  },
  {
    id: 'auth',
    label: 'Auth Layer',
    type: 'auth',
    technology: 'NextAuth.js',
    filePath: 'packages/next-auth',
    description: 'Session management, JWT validation, OAuth providers',
    children: ['database'],
  },
  {
    id: 'database',
    label: 'Data Store',
    type: 'database',
    technology: 'Prisma + PostgreSQL',
    filePath: 'prisma/schema.prisma',
    description: 'Primary data persistence layer',
  },
  {
    id: 'build',
    label: 'Build System',
    type: 'service',
    technology: 'Turbopack / Webpack',
    filePath: 'packages/next/src/build',
    description: 'Asset bundling, code splitting, static generation',
    children: ['cdn'],
  },
  {
    id: 'cdn',
    label: 'Static Assets / CDN',
    type: 'service',
    technology: 'Vercel Edge Network',
    description: 'Global asset distribution and caching',
  },
];

export const DEMO_ARCHITECTURE_EDGES: ArchitectureEdge[] = [
  { from: 'client', to: 'nextjs-frontend', label: 'HTTP/WS' },
  { from: 'client', to: 'cdn', label: 'Assets' },
  { from: 'nextjs-frontend', to: 'middleware', label: 'Request' },
  { from: 'nextjs-frontend', to: 'api-routes', label: 'fetch()' },
  { from: 'middleware', to: 'api-routes', label: 'Rewrite' },
  { from: 'api-routes', to: 'auth', label: 'Verify' },
  { from: 'api-routes', to: 'database', label: 'Query' },
  { from: 'auth', to: 'database', label: 'Session' },
  { from: 'build', to: 'cdn', label: 'Deploy' },
];

export const DEMO_DEPENDENCIES: Dependency[] = [
  { name: 'react', version: '18.3.1', type: 'production', status: 'ok', description: 'UI component library', license: 'MIT' },
  { name: 'react-dom', version: '18.3.1', type: 'production', status: 'ok', description: 'React DOM renderer', license: 'MIT' },
  { name: 'typescript', version: '5.1.6', type: 'development', status: 'outdated', latestVersion: '5.4.5', description: 'TypeScript compiler', license: 'Apache-2.0' },
  { name: 'next', version: '15.0.0', type: 'production', status: 'ok', description: 'React framework', license: 'MIT' },
  { name: 'prisma', version: '5.8.0', type: 'development', status: 'outdated', latestVersion: '5.11.0', description: 'Database ORM', license: 'Apache-2.0' },
  { name: '@prisma/client', version: '5.8.0', type: 'production', status: 'outdated', latestVersion: '5.11.0', description: 'Prisma runtime client', license: 'Apache-2.0' },
  { name: 'zod', version: '3.22.4', type: 'production', status: 'ok', description: 'Schema validation', license: 'MIT' },
  { name: 'axios', version: '1.3.0', type: 'production', status: 'vulnerable', latestVersion: '1.6.8', description: 'HTTP client — known CVE in this version', license: 'MIT', auditAdvisory: 'CVE-2023-45857: Cross-Site Request Forgery (CSRF) via data parameter' },
  { name: 'lodash', version: '4.17.21', type: 'production', status: 'unused', description: 'Utility library — no imports detected', license: 'MIT' },
  { name: 'tailwindcss', version: '3.4.1', type: 'development', status: 'ok', description: 'Utility-first CSS', license: 'MIT' },
  { name: 'eslint', version: '8.56.0', type: 'development', status: 'ok', description: 'Code linter', license: 'MIT' },
  { name: 'jest', version: '29.7.0', type: 'development', status: 'ok', description: 'Testing framework', license: 'MIT' },
];

export const DEMO_ENV_VARIABLES: EnvVariable[] = [
  { name: 'DATABASE_URL', required: true, detected: true, description: 'PostgreSQL connection string', example: 'postgresql://user:pass@host:5432/db' },
  { name: 'NEXTAUTH_SECRET', required: true, detected: false, description: 'NextAuth.js secret for JWT signing', example: 'openssl rand -base64 32' },
  { name: 'NEXTAUTH_URL', required: true, detected: true, description: 'Public URL of your application', example: 'http://localhost:3000' },
  { name: 'GITHUB_CLIENT_ID', required: false, detected: false, description: 'GitHub OAuth app client ID', example: 'Iv1.abc123def456' },
  { name: 'GITHUB_CLIENT_SECRET', required: false, detected: false, description: 'GitHub OAuth app client secret', example: '***' },
  { name: 'REDIS_URL', required: false, detected: true, description: 'Redis connection for session caching', example: 'redis://localhost:6379' },
];

export const DEMO_SETUP_STEPS: SetupStep[] = [
  { id: 'git', label: 'Git Version Control', command: 'git --version', status: 'ok', description: 'Version control system', details: 'v2.42.0 detected' },
  { id: 'clone', label: 'Clone repository', command: 'git clone https://github.com/cyrilchris-j/RepoPilot.git', status: 'ok', description: 'Repository checkout', details: 'main branch active' },
  { id: 'node', label: 'Node.js ≥ 18.17', status: 'ok', description: 'Runtime environment', details: 'v20.11.0 detected' },
  { id: 'pnpm', label: 'pnpm package manager', status: 'ok', description: 'Dependency manager', details: 'v8.14.0 detected' },
  { id: 'install', label: 'Install dependencies', command: 'pnpm install', status: 'ok', description: '147 packages resolved' },
  { id: 'env', label: 'Environment variables', status: 'warning', description: '2 required variables missing', details: 'NEXTAUTH_SECRET, GITHUB_CLIENT_ID not set' },
  { id: 'db', label: 'Database connection', command: 'pnpm prisma db push', status: 'ok', description: 'Schema synchronized' },
  { id: 'dev', label: 'Start development server', command: 'pnpm dev', status: 'pending', description: 'Ready to run' },
];

export const DEMO_STARTER_TASKS: StarterTask[] = [
  {
    id: '1',
    title: 'Trace the authentication flow',
    difficulty: 'beginner',
    description: 'Follow a request from login button through middleware, session creation, and database storage to understand how NextAuth.js integrates.',
    relevantFiles: ['packages/next-auth/src/providers/', 'packages/next-auth/src/core/', 'packages/next/src/server/app-render/'],
    whyItMatters: 'Authentication touches the entire request lifecycle. Understanding it unlocks the ability to add new providers or modify session behavior.',
    nextStep: 'Add console logs at each auth stage and submit a login request. Trace the call stack.',
    estimatedTime: '2–3 hours',
    tags: ['auth', 'security', 'sessions'],
  },
  {
    id: '2',
    title: 'Fix the deprecated TypeScript configuration',
    difficulty: 'beginner',
    description: 'The project uses TypeScript 5.1.6 while 5.4.5 is available. Update the config and resolve any breaking changes.',
    relevantFiles: ['tsconfig.json', 'packages/next/tsconfig.json'],
    whyItMatters: 'Keeping TypeScript current prevents future breaking changes and enables newer language features across the codebase.',
    nextStep: 'Run `pnpm tsc --noEmit` to surface current type errors before upgrading.',
    estimatedTime: '1–2 hours',
    tags: ['typescript', 'maintenance', 'dependencies'],
  },
  {
    id: '3',
    title: 'Understand App Router middleware chain',
    difficulty: 'intermediate',
    description: 'Map how edge middleware intercepts requests before they reach route handlers. Identify where auth checks, redirects, and rewrites are applied.',
    relevantFiles: ['packages/next/src/server/middleware-routine.ts', 'packages/next/src/server/web/sandbox/'],
    whyItMatters: 'Middleware is the correct place to handle cross-cutting concerns like auth gates, A/B testing, and i18n routing.',
    nextStep: 'Create a test middleware that logs request headers and deploy to a local route.',
    estimatedTime: '3–4 hours',
    tags: ['middleware', 'edge-runtime', 'routing'],
  },
  {
    id: '4',
    title: 'Remove unused lodash dependency',
    difficulty: 'beginner',
    description: 'Lodash is listed as a production dependency but no imports were detected. Confirm removal is safe and submit a cleanup PR.',
    relevantFiles: ['package.json', 'packages/next/package.json'],
    whyItMatters: 'Unused dependencies increase bundle size and introduce unneeded attack surface.',
    nextStep: 'Run `pnpm why lodash` to confirm zero dependents, then remove and run the test suite.',
    estimatedTime: '30–60 minutes',
    tags: ['cleanup', 'bundle-size', 'dependencies'],
  },
  {
    id: '5',
    title: 'Patch the axios vulnerability',
    difficulty: 'intermediate',
    description: 'axios 1.3.0 contains a known SSRF vulnerability (CVE). Upgrade to 1.6.8+ and ensure all usages remain compatible.',
    relevantFiles: ['package.json', 'packages/next/src/server/'],
    whyItMatters: 'Security vulnerabilities in HTTP clients can expose server-side request forgery attack vectors.',
    nextStep: 'Check the axios changelog between 1.3.0 and 1.6.8 for breaking changes before upgrading.',
    estimatedTime: '1–2 hours',
    tags: ['security', 'vulnerability', 'dependencies'],
  },
  {
    id: '6',
    title: 'Implement Turbopack incremental build profiling',
    difficulty: 'advanced',
    description: 'Turbopack\'s incremental compilation engine has profiling hooks. Instrument a build trace and analyze the hot path for a large page.',
    relevantFiles: ['packages/next/src/build/webpack/', 'packages/next/src/server/dev/'],
    whyItMatters: 'Understanding build performance enables high-impact optimization contributions to one of Next.js\'s core competitive features.',
    nextStep: 'Enable `TURBOPACK_PROFILING=1` and analyze the flamegraph output.',
    estimatedTime: '1–2 days',
    tags: ['performance', 'turbopack', 'build'],
  },
];

export const DEMO_ACTIVITY: AnalysisActivity[] = [
  { id: '1', timestamp: '2s ago', message: 'Repository index complete — 3,842 files processed', type: 'success' },
  { id: '2', timestamp: '4s ago', message: 'Dependency graph resolved — 147 packages analyzed', type: 'info' },
  { id: '3', timestamp: '6s ago', message: 'Architecture map built — 8 nodes, 9 relationships', type: 'success' },
  { id: '4', timestamp: '8s ago', message: 'WARNING: 2 env variables unset — startup will fail', type: 'warning' },
  { id: '5', timestamp: '10s ago', message: 'SECURITY: axios@1.3.0 has known CVE — upgrade required', type: 'error' },
  { id: '6', timestamp: '14s ago', message: 'Setup validation complete — 1 warning, 1 error', type: 'info' },
  { id: '7', timestamp: '18s ago', message: 'Developer workspace ready', type: 'success' },
];

export const DEMO_GIT_INSIGHTS: GitInsights = {
  hotspots: [
    { path: 'packages/next/src/server/next-server.ts', commits: 48, churnScore: 'high' },
    { path: 'packages/next/src/client/router.ts', commits: 36, churnScore: 'high' },
    { path: 'packages/next/src/build/webpack-config.ts', commits: 24, churnScore: 'medium' },
    { path: 'packages/next/src/export/index.ts', commits: 19, churnScore: 'medium' },
    { path: 'packages/next/src/server/middleware-runner.ts', commits: 14, churnScore: 'low' },
  ],
  contributors: [
    { name: 'Tim Neutkens', commits: 342, percentage: 42 },
    { name: 'Shu Ding', commits: 184, percentage: 23 },
    { name: 'Jiachi Liu', commits: 112, percentage: 14 },
    { name: 'JJ Kasper', commits: 95, percentage: 12 },
    { name: 'Community Contributors', commits: 74, percentage: 9 },
  ],
  recentCommits: [
    { hash: 'a4f91b', message: 'fix(turbopack): correct app router streaming chunking logic', author: 'Tim Neutkens', date: '3 hours ago' },
    { hash: '7c82de', message: 'feat(edge): optimize middleware evaluation latency', author: 'Shu Ding', date: 'Yesterday' },
    { hash: 'e201aa', message: 'chore(deps): update swc-loader to v1.3.102', author: 'Jiachi Liu', date: '2 days ago' },
    { hash: '3d90fc', message: 'docs: clarify custom server routing hooks', author: 'JJ Kasper', date: '3 days ago' },
  ],
  totalCommits: 807,
};

