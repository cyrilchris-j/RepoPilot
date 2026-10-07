import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo } from '../lib/RepoContext';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  GitBranch,
  Terminal,
  Zap,
  Shield,
  ShieldCheck,
  Eye,
  ChevronRight,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ScanningLine } from '../components/ui/CodeBlock';

// ── Animated counter ────────────────────────────────────────────────────────
function Counter({ target, duration = 1.8 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); return; }
      setValue(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

// ── Mini architecture node ──────────────────────────────────────────────────
// ── Mini architecture node ──────────────────────────────────────────────────
function ArchNode({
  label,
  sub,
  type = 'default',
  active = true,
}: {
  label: string;
  sub: string;
  type?: 'frontend' | 'backend' | 'db' | 'auth' | 'default';
  active?: boolean;
}) {
  const activeStyles = {
    frontend: 'border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan shadow-sm shadow-accent-cyan/10',
    backend:  'border-accent-violet/60 bg-accent-violet/10 text-accent-violet shadow-sm shadow-accent-violet/10',
    db:       'border-success/60 bg-success/10 text-success shadow-sm shadow-success/10',
    auth:     'border-warning/60 bg-warning/10 text-warning shadow-sm shadow-warning/10',
    default:  'border-border bg-elevated text-text-secondary',
  };

  const inactiveStyle = 'border-border/40 bg-surface/40 text-text-secondary/35';

  return (
    <div
      className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all duration-400 select-none ${
        active ? activeStyles[type] : inactiveStyle
      }`}
    >
      <div className="font-medium tracking-tight leading-none">{label}</div>
      <div className={`text-[10px] mt-1 font-sans ${active ? 'opacity-80' : 'opacity-40'}`}>{sub}</div>
    </div>
  );
}

// ── Hero product preview ────────────────────────────────────────────────────
interface HeroStep {
  text: string;
  phase: 'scanning' | 'analyzing' | 'complete';
  files?: number;
  deps?: number;
  routes?: number;
  config?: number;
  revealNode?: 'frontend' | 'backend' | 'leaves';
}

const HERO_STEPS: HeroStep[] = [
  { text: 'Connecting to github.com/vercel/next.js...', phase: 'scanning' },
  { text: 'Cloning repository index & metadata...', phase: 'scanning' },
  { text: 'Scanning 3,842 source files...', phase: 'scanning', files: 3842, revealNode: 'frontend' },
  { text: 'Resolving dependency graph (147 packages)...', phase: 'analyzing', deps: 147, revealNode: 'backend' },
  { text: 'Building architecture & route map...', phase: 'analyzing', routes: 89, revealNode: 'leaves' },
  { text: 'Analyzing environment configuration...', phase: 'analyzing', config: 6 },
  { text: 'Synthesizing developer workspace...', phase: 'analyzing' },
  { text: 'Analysis complete. Developer workspace ready.', phase: 'complete' },
];

function HeroPreview() {
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'complete'>('scanning');
  const [log, setLog] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ files: 0, deps: 0, routes: 0, config: 0 });
  const [activeNodes, setActiveNodes] = useState({ frontend: false, backend: false, leaves: false });
  const [runId, setRunId] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal log as new lines arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [log]);

  // Stepped animation sequence
  useEffect(() => {
    setPhase('scanning');
    setLog([]);
    setMetrics({ files: 0, deps: 0, routes: 0, config: 0 });
    setActiveNodes({ frontend: false, backend: false, leaves: false });

    let i = 0;
    const interval = setInterval(() => {
      if (i >= HERO_STEPS.length) {
        clearInterval(interval);
        return;
      }

      const step = HERO_STEPS[i];
      setLog(prev => [...prev, step.text]);
      setPhase(step.phase);

      if (step.files) setMetrics(m => ({ ...m, files: step.files! }));
      if (step.deps) setMetrics(m => ({ ...m, deps: step.deps! }));
      if (step.routes) setMetrics(m => ({ ...m, routes: step.routes! }));
      if (step.config) setMetrics(m => ({ ...m, config: step.config! }));

      if (step.revealNode === 'frontend') {
        setActiveNodes(n => ({ ...n, frontend: true }));
      } else if (step.revealNode === 'backend') {
        setActiveNodes(n => ({ ...n, backend: true }));
      } else if (step.revealNode === 'leaves') {
        setActiveNodes(n => ({ ...n, leaves: true }));
      }

      i++;
      if (i === HERO_STEPS.length) {
        setPhase('complete');
        clearInterval(interval);
      }
    }, 550);

    return () => clearInterval(interval);
  }, [runId]);

  const handleReplay = () => {
    setRunId(r => r + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl shadow-black/60 max-w-xl w-full flex flex-col">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-elevated border-b border-border select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/70" />
          </div>
          <span className="text-xs font-mono text-text-secondary ml-2 font-medium">repopilot — analysis</span>
        </div>

        <div className="flex items-center gap-2">
          {phase === 'complete' && (
            <button
              onClick={handleReplay}
              type="button"
              className="flex items-center gap-1 text-[11px] font-mono text-text-secondary hover:text-accent-cyan px-2 py-0.5 rounded hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
              title="Replay analysis animation"
            >
              <RotateCcw size={11} />
              <span>Replay</span>
            </button>
          )}
          <StatusBadge
            status={phase === 'complete' ? 'complete' : 'analyzing'}
            size="sm"
            label={phase === 'scanning' ? 'SCANNING' : phase === 'analyzing' ? 'ANALYZING' : 'ANALYZED'}
          />
        </div>
      </div>

      {/* Repo identity */}
      <div className="px-4 py-2.5 border-b border-border/80 bg-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-accent-cyan shrink-0" />
          <span className="font-mono text-xs font-medium text-text-primary">github.com/vercel/next.js</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary">
          <span className="px-1.5 py-0.5 rounded bg-elevated border border-border/60 text-[10px]">canary</span>
          <span>TypeScript</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 py-2.5 border-b border-border/80 grid grid-cols-4 gap-2 bg-elevated/20">
        {[
          { label: 'FILES', value: metrics.files },
          { label: 'DEPS', value: metrics.deps },
          { label: 'ROUTES', value: metrics.routes },
          { label: 'CONFIG', value: metrics.config },
        ].map(({ label, value }) => (
          <div key={label} className="text-center py-0.5">
            <div className="font-mono text-sm font-semibold text-text-primary transition-all">
              {value > 0 ? (
                value.toLocaleString()
              ) : (
                <span className="text-text-secondary/40 font-normal">⋯</span>
              )}
            </div>
            <div className="text-[9px] font-mono text-text-secondary/70 tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Architecture diagram (always stable height) */}
      <div className="px-4 py-3.5 border-b border-border/80 bg-gradient-to-b from-surface to-bg/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-text-secondary/80 tracking-widest uppercase">
            Discovered Architecture
          </span>
          <span className="text-[10px] font-mono text-accent-cyan/80">
            {phase === 'complete' ? 'Topology Mapped' : activeNodes.frontend ? 'Mapping...' : 'Detecting...'}
          </span>
        </div>

        <div className="flex flex-col items-center">
          {/* React Frontend */}
          <ArchNode
            label="React Frontend"
            sub="Next.js App Router"
            type="frontend"
            active={activeNodes.frontend}
          />

          {/* Stem to API Routes */}
          <div
            className={`w-px h-3 transition-colors duration-400 ${
              activeNodes.backend ? 'bg-accent-cyan/70' : 'bg-border/60'
            }`}
          />

          {/* API Routes */}
          <ArchNode
            label="API Routes"
            sub="Edge & Node Runtime"
            type="backend"
            active={activeNodes.backend}
          />

          {/* Branching fork */}
          <div className="w-52 h-4 relative flex items-center justify-center">
            <svg className="w-52 h-4 overflow-visible" viewBox="0 0 208 16" fill="none">
              <path
                d="M 104 0 L 104 6 M 40 6 L 168 6 M 40 6 L 40 16 M 168 6 L 168 16"
                stroke={activeNodes.leaves ? '#67E8F9' : '#242A35'}
                strokeWidth="1.2"
                strokeLinecap="round"
                className="transition-colors duration-400"
              />
            </svg>
          </div>

          {/* Bottom leaves */}
          <div className="flex gap-4">
            <ArchNode
              label="Auth Layer"
              sub="NextAuth.js v5"
              type="auth"
              active={activeNodes.leaves}
            />
            <ArchNode
              label="PostgreSQL"
              sub="via Prisma ORM"
              type="db"
              active={activeNodes.leaves}
            />
          </div>
        </div>
      </div>

      {/* Terminal log console */}
      <div className="p-3 bg-bg/50">
        <div className="rounded-lg bg-[#07090E] border border-border/80 overflow-hidden shadow-inner flex flex-col">
          {/* Console topbar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0B0F17] border-b border-border/50 text-[10px] font-mono text-text-secondary select-none">
            <div className="flex items-center gap-1.5">
              <Terminal size={11} className="text-accent-cyan" />
              <span>analysis.log</span>
            </div>
            <span className="text-[9px] text-text-secondary/60">
              {phase === 'complete' ? 'FINISHED' : 'STREAMING'}
            </span>
          </div>

          {/* Console lines container */}
          <div
            ref={terminalRef}
            className="p-2.5 h-24 overflow-y-auto space-y-1 font-mono text-[11px] scroll-smooth"
          >
            {log.map((line, i) => {
              const isLast = i === log.length - 1;
              const isDone = line.includes('complete');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -3 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-1.5 leading-relaxed ${
                    isDone
                      ? 'text-success font-medium'
                      : isLast && phase !== 'complete'
                      ? 'text-accent-cyan'
                      : 'text-text-secondary'
                  }`}
                >
                  <span className={`shrink-0 select-none ${isDone ? 'text-success' : 'text-accent-cyan/80'}`}>
                    {isDone ? '✓' : '›'}
                  </span>
                  <span className="break-all">{line}</span>
                </motion.div>
              );
            })}
            {phase !== 'complete' && (
              <div className="flex items-center gap-1 pl-4 h-3.5">
                <span className="inline-block w-1.5 h-3 bg-accent-cyan animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>

      {phase !== 'complete' && <ScanningLine />}
    </div>
  );
}

// ── Section: Problem ────────────────────────────────────────────────────────
function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  useInView(ref, { once: true });

  const steps = [
    { label: 'Clone Repository', status: 'ok' },
    { label: 'Explore File Tree', status: 'ok' },
    { label: 'Search for Entry Point', status: 'warning' },
    { label: 'Read Documentation', status: 'warning' },
    { label: 'Configure Environment', status: 'error' },
    { label: 'npm install', status: 'ok' },
    { label: 'npm run dev', status: 'error' },
    { label: 'Search Stack Overflow', status: 'warning' },
    { label: 'Debug Configuration', status: 'warning' },
    { label: 'Ask a Colleague', status: 'warning' },
    { label: 'Understand Architecture', status: 'ok' },
    { label: 'Start Contributing', status: 'ok' },
  ];

  return (
    <section id="workflow" ref={ref} className="py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3">
          <span className="section-label">01 — The Problem</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
          THE UNKNOWN CODEBASE
        </h2>
        <p className="text-text-secondary max-w-xl mb-16 leading-relaxed">
          Joining an unfamiliar repository means hours of manual investigation before writing a single line of code.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Flow diagram */}
          <div className="space-y-1">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  step.status === 'ok' ? 'bg-success' :
                  step.status === 'warning' ? 'bg-warning' : 'bg-error'
                }`} />
                <div className={`text-sm font-mono ${
                  step.status === 'error' ? 'text-error' :
                  step.status === 'warning' ? 'text-warning' : 'text-text-secondary'
                }`}>{step.label}</div>
                {step.status !== 'ok' && (
                  <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    step.status === 'error' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                  }`}>
                    {step.status === 'error' ? 'BLOCKED' : 'SLOW'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-text-primary mb-2">
                <Counter target={2} />–<Counter target={8} />h
              </div>
              <div className="text-sm text-text-secondary">
                average developer onboarding time for a new repository
              </div>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-error mb-2">
                <Counter target={60} />%
              </div>
              <div className="text-sm text-text-secondary">
                of that time spent understanding structure rather than writing code
              </div>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-warning mb-2">
                <Counter target={3} />×
              </div>
              <div className="text-sm text-text-secondary">
                more likely to introduce bugs in unfamiliar codebases
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Section: Solution ───────────────────────────────────────────────────────
function SolutionSection() {
  const features = [
    { id: '01', label: 'Architecture Map', desc: 'Visualize how components, services, and data flow connect', accent: 'text-accent-cyan', border: 'border-accent-cyan/20' },
    { id: '02', label: 'Setup Assistant', desc: 'Step-by-step environment validation and configuration guidance', accent: 'text-accent-violet', border: 'border-accent-violet/20' },
    { id: '03', label: 'Debug Agent', desc: 'AI-powered error analysis with file-level context', accent: 'text-success', border: 'border-success/20' },
    { id: '04', label: 'Codebase Q&A', desc: 'Ask natural language questions, get file-aware answers', accent: 'text-warning', border: 'border-warning/20' },
    { id: '05', label: 'Starter Tasks', desc: 'AI-generated contribution path ranked by difficulty', accent: 'text-accent-cyan', border: 'border-accent-cyan/20' },
    { id: '06', label: 'Dependency Intel', desc: 'Detect outdated, vulnerable, and unused packages', accent: 'text-error', border: 'border-error/20' },
  ];

  return (
    <section id="architecture" className="py-24 px-6 border-t border-border bg-surface">
      <div className="max-w-5xl mx-auto">
        <div className="mb-3">
          <span className="section-label">02 — The Solution</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
          FROM UNKNOWN TO ACTIONABLE
        </h2>
        <p className="text-text-secondary max-w-xl mb-16 leading-relaxed">
          RepoPilot converts an unfamiliar repository into a complete developer workspace in seconds.
        </p>

        {/* Flow */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-16">
          {[
            { label: 'Repository', sub: 'any GitHub URL', color: 'text-text-secondary' },
            null,
            { label: 'RepoPilot', sub: 'AI Analysis Engine', color: 'text-accent-cyan' },
            null,
            { label: 'Workspace', sub: 'Developer-Ready', color: 'text-success' },
          ].map((item, i) => (
            item === null ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="hidden md:block text-text-secondary"
              >
                <ArrowRight size={20} />
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`card px-6 py-4 text-center ${item.color === 'text-accent-cyan' ? 'border-accent-cyan/30 bg-accent-cyan/5' : ''}`}
              >
                <div className={`text-base font-semibold ${item.color}`}>{item.label}</div>
                <div className="text-xs text-text-secondary font-mono mt-0.5">{item.sub}</div>
              </motion.div>
            )
          ))}
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
              className={`card-elevated p-5 border ${f.border}`}
            >
              <div className={`text-[10px] font-mono tracking-widest mb-2 ${f.accent}`}>{f.id}</div>
              <div className="text-sm font-semibold text-text-primary mb-1.5">{f.label}</div>
              <div className="text-xs text-text-secondary leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Landing page ─────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const { setRepoUrl } = useRepo();
  const [repoInput, setRepoInput] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const url = repoInput.trim() || 'github.com/vercel/next.js';
    setRepoUrl(url);
    navigate('/analyzing', { state: { repoUrl: url } });
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Navigation */}
      <header className={`sticky top-0 z-30 transition-all duration-300 ${navScrolled ? 'bg-bg/90 backdrop-blur border-b border-border' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2" fill="#67E8F9" />
                  <path d="M7 2v3M7 9v3M2 7h3M9 7h3" stroke="#67E8F9" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M3.5 3.5l2 2M8.5 8.5l2 2M10.5 3.5l-2 2M5.5 8.5l-2 2" stroke="#67E8F9" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight">RepoPilot</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <a href="#product" className="btn-ghost text-xs">Product</a>
              <a href="#workflow" className="btn-ghost text-xs">Workflow</a>
              <a href="#architecture" className="btn-ghost text-xs">Architecture</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SYSTEM ONLINE
            </div>
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-elevated/70 hover:bg-elevated hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors group shadow-xs"
              title="Admin Dashboard — View repository usage and user suggestions"
            >
              <ShieldCheck size={14} className="text-accent-cyan group-hover:scale-105 transition-transform" />
              <span className="font-medium font-sans">Admin</span>
            </Link>
            <Link to="/app" className="btn-primary text-xs px-4 py-2">
              Open App <ArrowRight size={12} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="product" className="pt-16 md:pt-24 pb-20 px-6 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-cyan/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start lg:items-center">
            {/* Left: Editorial */}
            <div className="flex-1 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5"
              >
                <StatusBadge status="complete" label="ANALYSIS ENGINE READY" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-text-primary mb-5"
              >
                REPOSITORY
                <br />
                <span className="text-gradient-cyan">INTELLIGENCE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-text-secondary text-lg leading-relaxed mb-3"
              >
                Turn an unfamiliar codebase into an actionable developer workspace.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-sm font-mono text-text-secondary mb-8"
              >
                Analyze. Understand. Debug. Start contributing.
              </motion.p>

              {/* Repo input */}
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                onSubmit={handleAnalyze}
                className="flex gap-2 mb-4"
              >
                <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded px-3 py-2.5 focus-within:border-accent-cyan/50 transition-colors h-11">
                  <GitBranch size={14} className="text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={e => setRepoInput(e.target.value)}
                    placeholder="github.com/owner/repository"
                    className="flex-1 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap h-11 flex items-center justify-center">
                  Analyze
                </button>
              </motion.form>

              {/* Sample repos */}
              <div className="flex items-center gap-2 mb-6 text-xs flex-wrap">
                <span className="font-mono text-[11px] text-text-secondary">Try:</span>
                {[
                  { label: 'vercel/next.js', url: 'github.com/vercel/next.js' },
                  { label: 'facebook/react', url: 'github.com/facebook/react' },
                  { label: 'expressjs/express', url: 'github.com/expressjs/express' },
                ].map(sample => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setRepoInput(sample.url);
                      setRepoUrl(sample.url);
                      navigate('/analyzing', { state: { repoUrl: sample.url } });
                    }}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface hover:bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/app" className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
                  <Eye size={13} />
                  View demo workspace
                  <ChevronRight size={11} />
                </Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
                  <ExternalLink size={12} />
                  GitHub
                </a>
              </motion.div>
            </div>

            {/* Right: Product preview */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex-1 flex justify-center w-full"
            >
              <HeroPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section className="border-t border-b border-border bg-surface py-5 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-6 md:gap-12 justify-center items-center">
            {[
              { icon: <Terminal size={13} />, label: 'Setup Analysis' },
              { icon: <GitBranch size={13} />, label: 'Architecture Mapping' },
              { icon: <Zap size={13} />, label: 'Debug Intelligence' },
              { icon: <Shield size={13} />, label: 'Dependency Audit' },
              { icon: <Eye size={13} />, label: 'Codebase Q&A' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                <span className="text-accent-cyan">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProblemSection />
      <SolutionSection />


      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-text-secondary">RepoPilot</span>
            <span className="text-border">·</span>
            <span className="text-xs text-text-secondary">IBM Bob 2.0 Hackathon</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/app/improvements" className="text-text-secondary hover:text-accent-cyan transition-colors">
              Feedback &amp; Wishlist
            </Link>
            <Link to="/admin" className="text-text-secondary hover:text-accent-cyan transition-colors flex items-center gap-1">
              <ShieldCheck size={12} className="text-accent-cyan" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Powered by IBM watsonx.ai
          </div>
        </div>
      </footer>
    </div>
  );
}
