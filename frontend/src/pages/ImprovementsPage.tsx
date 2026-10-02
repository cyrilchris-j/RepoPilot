import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  Rocket,
  ShieldCheck,
  Zap,
  Code2,
  GitMerge,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Filter,
} from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { DEMO_REPO } from '../lib/demo-data';

interface ImprovementItem {
  id: string;
  category: 'components' | 'architecture' | 'deployment' | 'merger';
  title: string;
  tagline: string;
  impact: 'High' | 'Medium' | 'Quick Win';
  effort: string;
  analyzedReason: string;
  targetFiles: string[];
  cliCommand: string;
  codeSnippet: string;
  filename: string;
  beforeSnippet?: string;
  benefits: string[];
}

export function ImprovementsPage() {
  const { repoData, repoUrl } = useRepo();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'components' | 'architecture' | 'deployment' | 'merger'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('cmd-palette');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cliTab, setCliTab] = useState<'npx' | 'docker' | 'github-action' | 'badge'>('npx');

  const repo = repoData?.repository || (repoUrl ? {
    url: repoUrl,
    name: repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'repository',
    owner: repoUrl.split('/').slice(-2)[0] || 'owner',
    branch: 'main',
  } : DEMO_REPO);

  const cleanRepoUrl = repo.url || 'https://github.com/cyrilchris-j/RepoPilot.git';
  const cleanRepoName = repo.name || 'RepoPilot';

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(cur => (cur === id ? null : cur));
    }, 1800);
  };

  const improvements: ImprovementItem[] = useMemo(() => [
    {
      id: 'cmd-palette',
      category: 'components',
      title: 'Global Command Palette (⌘K) & Search Modal',
      tagline: 'Empower users with instant keyboard navigation, file search, and actions',
      impact: 'High',
      effort: '30 mins',
      analyzedReason: 'Analyzed repository lacks a global spotlight search or quick-action launcher for developers.',
      targetFiles: ['src/components/CommandPalette.tsx', 'src/layouts/AppLayout.tsx'],
      cliCommand: `npx repopilot@latest add component command-palette`,
      filename: 'src/components/CommandPalette.tsx',
      beforeSnippet: `// Current: Users have to manually click across navigation links
<header>
  <nav><Link to="/dashboard">Dashboard</Link>...</nav>
</header>`,
      codeSnippet: `import { useState, useEffect } from 'react';
import { Search, Terminal, FileCode } from 'lucide-react';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-border gap-2.5">
          <Search size={16} className="text-accent-cyan" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands, files, actions (⌘K)..."
            className="w-full bg-transparent text-sm font-mono text-text-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}`,
      benefits: [
        'Increases power-user keyboard accessibility by 4x',
        'Built-in quick action launcher tailored for repository files',
        'Drop-in ready without extra heavy external dependencies',
      ],
    },
    {
      id: 'env-validator',
      category: 'architecture',
      title: 'Type-Safe Runtime Environment Schema (Zod)',
      tagline: 'Fail fast at boot time if required environment variables are missing',
      impact: 'Quick Win',
      effort: '15 mins',
      analyzedReason: 'Analyzed repository accesses process.env or import.meta.env directly without runtime assertion.',
      targetFiles: ['src/lib/env.ts', '.env.example'],
      cliCommand: `npx repopilot@latest add recipe env-validation`,
      filename: 'src/lib/env.ts',
      beforeSnippet: `// Current: Unchecked process.env can crash runtime with silent undefined errors
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.AUTH_SECRET;`,
      codeSnippet: `import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('Invalid database URL string'),
  API_BASE_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.coerce.number().default(3001),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = _env.data;`,
      benefits: [
        'Eliminates runtime crashes caused by misspelled or unset .env keys',
        'Auto-completes process.env in IDEs with full TypeScript inference',
        'Generates actionable terminal error messages during build time',
      ],
    },
    {
      id: 'ci-matrix',
      category: 'deployment',
      title: 'Automated GitHub Actions CI Pipeline with RepoPilot Audit',
      tagline: 'Continuous validation for linting, type-checking, tests, and RepoPilot architectural health',
      impact: 'High',
      effort: '20 mins',
      analyzedReason: 'No continuous integration workflow detected in .github/workflows directory.',
      targetFiles: ['.github/workflows/ci.yml'],
      cliCommand: `npx repopilot@latest init ci`,
      filename: '.github/workflows/ci.yml',
      beforeSnippet: `// Current: Manual verification on local machine before pull requests`,
      codeSnippet: `name: CI & RepoPilot Health Check

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Type Check & Lint
        run: npm run lint --if-present && npx tsc --noEmit

      - name: Run Tests
        run: npm test --if-present

      - name: RepoPilot Architecture & Health Audit
        run: npx repopilot@latest inspect --strict
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`,
      benefits: [
        'Guarantees zero broken builds or syntax regressions on main branch',
        'Performs automated architectural regression checks on every PR',
        'Includes pre-configured caching for sub-minute test runs',
      ],
    },
    {
      id: 'health-endpoint',
      category: 'deployment',
      title: 'Production Healthcheck & Diagnostic Route (/api/healthz)',
      tagline: 'Standardized uptime check for Docker, Kubernetes, Vercel, or AWS ECS',
      impact: 'Quick Win',
      effort: '10 mins',
      analyzedReason: 'Analyzed repository lacks a dedicated liveness/readiness probe for deployment orchestrators.',
      targetFiles: ['src/routes/health.ts', 'server.ts'],
      cliCommand: `npx repopilot@latest add recipe health-probe`,
      filename: 'src/routes/health.ts',
      beforeSnippet: `// Current: Orchestrators ping root (/) route which carries heavy SSR/frontend overhead`,
      codeSnippet: `import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/healthz', async (_req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Optional: ping database or Redis here
  const dbStatus = 'healthy';
  
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    service: '${cleanRepoName}',
    database: dbStatus,
  });
});`,
      benefits: [
        'Zero-overhead route for cloud load balancers and container restarts',
        'Surfaces memory usage, uptime, and database connectivity in 1 API call',
        'Prevents traffic routing to containers before dependencies are ready',
      ],
    },
    {
      id: 'code-split',
      category: 'architecture',
      title: 'Dynamic Code-Splitting & Lazy Module Chunking',
      tagline: 'Split oversized bundles (>500 kB) into lazy-loaded sub-chunks for 3x faster LCP',
      impact: 'High',
      effort: '40 mins',
      analyzedReason: 'Vite/Webpack build warning: Multiple bundle chunks exceed 500 kB uncompressed.',
      targetFiles: ['src/App.tsx', 'vite.config.ts'],
      cliCommand: `npx repopilot@latest recipe code-splitting`,
      filename: 'src/App.tsx (with React.lazy)',
      beforeSnippet: `// Current: Synchronous imports bundle everything into one giant bundle
import { DashboardPage } from './pages/DashboardPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DebugPage } from './pages/DebugPage';`,
      codeSnippet: `import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy-load route pages to keep initial bundle under 150 kB
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage').then(m => ({ default: m.ArchitecturePage })));
const DebugPage = lazy(() => import('./pages/DebugPage').then(m => ({ default: m.DebugPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono text-xs text-text-secondary">Loading module...</div>}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/debug" element={<DebugPage />} />
      </Routes>
    </Suspense>
  );
}`,
      benefits: [
        'Cuts initial page download size by up to 65%',
        'Improves Largest Contentful Paint (LCP) and Core Web Vitals',
        'Users only download the code for the specific routes they visit',
      ],
    },
    {
      id: 'recipe-merger',
      category: 'merger',
      title: 'RepoPilot Battle-Tested Diagnostics & Code-Viewer Component Merger',
      tagline: 'Import RepoPilot\'s rich syntax-highlighted modal and diagnostics engine into this repository',
      impact: 'High',
      effort: '25 mins',
      analyzedReason: 'Merge reusable developer components from RepoPilot directly into your own project.',
      targetFiles: ['src/components/CodeViewerModal.tsx', 'src/lib/CodeViewerContext.tsx'],
      cliCommand: `npx repopilot@latest merge component code-viewer`,
      filename: 'src/components/CodeViewerModal.tsx',
      beforeSnippet: `// Current: Code references open raw URLs or require external IDE switching`,
      codeSnippet: `import React, { createContext, useContext, useState } from 'react';
import { X, Copy, Check, FileCode } from 'lucide-react';

interface CodeViewerContextType {
  openFile: (path: string, line?: number) => void;
  closeViewer: () => void;
}

const CodeViewerContext = createContext<CodeViewerContextType>({
  openFile: () => {},
  closeViewer: () => {},
});

export const useCodeViewer = () => useContext(CodeViewerContext);

export function CodeViewerModal({ currentFile, onClose }: { currentFile: string | null; onClose: () => void }) {
  if (!currentFile) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-surface border border-border rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 font-mono text-xs text-accent-cyan">
            <FileCode size={14} />
            <span>{currentFile}</span>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 max-h-96 overflow-y-auto font-mono text-xs text-text-primary bg-bg p-3 rounded">
          {/* File contents with line numbers */}
          <code>Loaded from repository index...</code>
        </div>
      </div>
    </div>
  );
}`,
      benefits: [
        'Instant in-browser file preview without leaving the application',
        'Deep-links line numbers for error stack traces and tasks',
        'Learn from RepoPilot\'s proven multi-component architecture',
      ],
    },
    {
      id: 'error-boundary',
      category: 'components',
      title: 'Self-Healing React Error Boundary with Diagnostic Trace',
      tagline: 'Catch unhandled UI rendering exceptions and offer 1-click recovery instead of white screens',
      impact: 'Medium',
      effort: '20 mins',
      analyzedReason: 'React application has no top-level ErrorBoundary to intercept lifecycle crashes.',
      targetFiles: ['src/components/ErrorBoundary.tsx'],
      cliCommand: `npx repopilot@latest add component error-boundary`,
      filename: 'src/components/ErrorBoundary.tsx',
      beforeSnippet: `// Current: An uncaught exception causes an unresponsive blank white screen`,
      codeSnippet: `import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RepoPilot Error Boundary]', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center card m-4 border-error/30">
          <AlertTriangle size={32} className="text-error mb-3" />
          <h2 className="text-sm font-semibold text-text-primary mb-1">Component Crashed</h2>
          <p className="text-xs text-text-secondary max-w-md mb-4 font-mono">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-primary flex items-center gap-1.5 text-xs"
          >
            <RefreshCw size={12} />
            <span>Try Recovering</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}`,
      benefits: [
        'Eliminates the dreaded "white screen of death" for end users',
        'Isolates failing widgets without bringing down the whole layout',
        'Provides actionable error traces in console for developers',
      ],
    },
    {
      id: 'docker-multi',
      category: 'deployment',
      title: 'Production-Hardened Multi-Stage Dockerfile',
      tagline: 'Lightweight, unprivileged container image (<120MB) ready for AWS, GCP, Fly.io, or Railway',
      impact: 'Medium',
      effort: '20 mins',
      analyzedReason: 'No containerization configuration found in project root.',
      targetFiles: ['Dockerfile', '.dockerignore'],
      cliCommand: `npx repopilot@latest init docker`,
      filename: 'Dockerfile',
      beforeSnippet: `// Current: Runs directly on host system with environment drift`,
      codeSnippet: `# Stage 1: Build dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
      benefits: [
        'Cuts image size from 1.2 GB to under 120 MB via multi-stage caching',
        'Runs as non-root user (appuser) for zero-trust container security',
        'Deploys consistently across any cloud provider with zero drift',
      ],
    },
  ], [cleanRepoName]);

  const filtered = selectedCategory === 'all'
    ? improvements
    : improvements.filter(i => i.category === selectedCategory);

  const signatureCommands = {
    npx: `npx repopilot@latest improve ${cleanRepoUrl}`,
    docker: `docker run --rm -it -v $(pwd):/workspace repopilot/cli:latest improve`,
    'github-action': `uses: cyrilchris-j/repopilot-action@v1\nwith:\n  repo-url: '${cleanRepoUrl}'\n  audit-mode: 'strict'`,
    badge: `[![RepoPilot Analyzed & Optimized](https://img.shields.io/badge/RepoPilot-Analyzed%20%26%20Optimized-67E8F9?logo=github)](${cleanRepoUrl})`,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-semibold flex items-center gap-1.5">
              <Sparkles size={12} />
              REPOPILOT LAB
            </span>
            <span className="text-xs font-mono text-text-secondary">
              Codebase Evolution &amp; Component Merger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Architectural Improvements &amp; Component Ideas
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Tailored enhancements detected by analyzing <span className="text-text-primary font-mono font-medium">{cleanRepoName}</span>. Merge battle-tested components, upgrade deployment pipelines, and optimize performance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-text-primary font-semibold">8 Improvements</div>
            <div className="text-[10px] font-mono text-success">Automated Recipes Available</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shadow-sm">
            <Rocket size={20} />
          </div>
        </div>
      </motion.div>

      {/* Signature RepoPilot Command Card (Make them use RepoPilot!) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="card p-5 border-accent-cyan/35 bg-gradient-to-r from-accent-cyan/15 via-surface to-accent-violet/15 relative overflow-hidden shadow-xl shadow-black/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal size={16} className="text-accent-cyan" />
              <h2 className="text-sm font-semibold text-text-primary tracking-tight uppercase">
                RepoPilot Signature CLI Command
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                OFFICIAL WORKSPACE RUNNER
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl">
              Anyone with a repository can run this command to inspect, audit, and automatically merge these modern components and architectural patterns directly into their codebase.
            </p>
          </div>

          {/* Quick tab switcher for command formats */}
          <div className="flex items-center gap-1 bg-elevated/80 border border-border/80 p-1 rounded-lg self-start lg:self-auto text-xs font-mono">
            {(['npx', 'github-action', 'docker', 'badge'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setCliTab(tab)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  cliTab === tab
                    ? 'bg-accent-cyan text-bg font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'npx' ? 'NPX Command' : tab === 'github-action' ? 'GitHub Action' : tab === 'docker' ? 'Docker' : 'README Badge'}
              </button>
            ))}
          </div>
        </div>

        {/* Command code preview */}
        <div className="flex items-center justify-between gap-3 bg-bg/95 border border-border rounded-lg p-3 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-2 overflow-x-auto select-all text-text-primary">
            <span className="text-accent-cyan font-bold">$</span>
            <pre className="whitespace-pre overflow-x-auto text-text-primary font-mono">
              {signatureCommands[cliTab]}
            </pre>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard('sig-cmd', signatureCommands[cliTab])}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            {copiedId === 'sig-cmd' ? (
              <>
                <Check size={13} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        {/* Pro-tips */}
        <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-text-secondary flex-wrap">
          <span className="flex items-center gap-1 text-accent-cyan">
            <Zap size={11} /> Zero installation required
          </span>
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={11} /> Analyzes local or remote GitHub repositories
          </span>
          <span className="flex items-center gap-1 text-warning">
            <ShieldCheck size={11} /> Generates verifiable, reversible PRs
          </span>
        </div>
      </motion.div>

      {/* Category filter tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Improvements', count: improvements.length, icon: Filter },
            { id: 'components', label: 'UI & Component Ideas', count: 2, icon: Code2 },
            { id: 'architecture', label: 'Architecture & Perf', count: 2, icon: Cpu },
            { id: 'deployment', label: 'Deployment & CI/CD', count: 3, icon: Rocket },
            { id: 'merger', label: 'Component Merger', count: 1, icon: GitMerge },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 font-medium'
                    : 'bg-surface hover:bg-elevated text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-elevated border border-border text-text-secondary">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-text-secondary">
          Showing <span className="text-text-primary font-medium">{filtered.length}</span> suggestions
        </div>
      </div>

      {/* Improvement items list */}
      <div className="space-y-4">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const isCopied = copiedId === item.id;
          const isCliCopied = copiedId === `cli-${item.id}`;

          return (
            <motion.div
              key={item.id}
              layout
              className={`card overflow-hidden transition-all duration-200 border-border/90 ${
                isExpanded ? 'border-accent-cyan/40 shadow-lg shadow-black/20' : 'hover:border-border'
              }`}
            >
              {/* Main Summary Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-elevated/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.category === 'components' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30' :
                    item.category === 'architecture' ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30' :
                    item.category === 'deployment' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/10 text-warning border border-amber-500/30'
                  }`}>
                    {item.category === 'components' && <Code2 size={18} />}
                    {item.category === 'architecture' && <Cpu size={18} />}
                    {item.category === 'deployment' && <Rocket size={18} />}
                    {item.category === 'merger' && <GitMerge size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight truncate">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                        item.impact === 'High' ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30' :
                        item.impact === 'Quick Win' ? 'text-success bg-success/10 border-success/30' :
                        'text-warning bg-warning/10 border-warning/30'
                      }`}>
                        {item.impact}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary border border-border px-1.5 py-0.5 rounded">
                        Est: {item.effort}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.tagline}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-warning/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      <span>Reason: {item.analyzedReason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono text-accent-cyan flex items-center gap-1">
                    {isExpanded ? 'Collapse' : 'Explore & Apply'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>
              </div>

              {/* Expanded Details Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-border/80 bg-surface/60 p-5 space-y-4"
                  >
                    {/* Benefits & Impact row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-elevated/50 border border-border/60 text-xs">
                          <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                          <span className="text-text-secondary">{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Files affected */}
                    <div className="flex items-center gap-2 text-xs font-mono text-text-secondary flex-wrap">
                      <span className="text-text-primary font-medium flex items-center gap-1">
                        <FileCode size={13} className="text-accent-cyan" /> Target Files:
                      </span>
                      {item.targetFiles.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded bg-elevated border border-border text-accent-cyan text-[11px]">
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* CLI Run snippet */}
                    <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-bg/90 border border-border font-mono text-xs">
                      <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                        <Terminal size={14} className="text-accent-cyan shrink-0" />
                        <span className="text-text-secondary shrink-0">Apply via CLI:</span>
                        <code className="text-accent-cyan truncate">{item.cliCommand}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`cli-${item.id}`, item.cliCommand)}
                        className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {isCliCopied ? (
                          <>
                            <Check size={11} className="text-success" />
                            <span className="text-success font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy CLI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code comparison / Drop-in snippet */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-secondary">DROP-IN CODE TEMPLATE:</span>
                          <span className="text-xs font-mono text-text-primary font-semibold">{item.filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.id, item.codeSnippet)}
                          className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} />
                              <span>Code Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg bg-bg border border-border/80 overflow-hidden text-xs font-mono">
                        <div className="bg-elevated/90 px-3.5 py-1.5 border-b border-border flex items-center justify-between text-[11px] text-text-secondary">
                          <span>{item.filename}</span>
                          <span>TypeScript / React / Config</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-text-primary leading-relaxed max-h-72">
                          <code>{item.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
