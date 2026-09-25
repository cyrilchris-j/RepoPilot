import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  GitBranch,
  Terminal,
  Zap,
  Shield,
  Eye,
  ChevronRight,
  ExternalLink,
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
function ArchNode({ label, sub, delay, type = 'default' }: {
  label: string; sub: string; delay: number; type?: 'frontend' | 'backend' | 'db' | 'auth' | 'default';
}) {
  const colors = {
    frontend: 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan',
    backend:  'border-accent-violet/40 bg-accent-violet/5 text-accent-violet',
    db:       'border-success/40 bg-success/5 text-success',
    auth:     'border-warning/40 bg-warning/5 text-warning',
    default:  'border-border bg-elevated text-text-secondary',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`px-3 py-1.5 rounded border text-xs font-mono ${colors[type]}`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-[10px] opacity-60 mt-0.5">{sub}</div>
    </motion.div>
  );
}

// ── Hero product preview ────────────────────────────────────────────────────
function HeroPreview() {
  const [phase, setPhase] = useState<'scanning' | 'analyzing' | 'complete'>('scanning');
  const [log, setLog] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ files: 0, deps: 0, routes: 0, config: 0 });

  const logLines = [
    '> Connecting to github.com/vercel/next.js...',
    '> Cloning repository index...',
    '> Scanning 3,842 source files...',
    '> Resolving dependency graph...',
    '> Building architecture map...',
    '> Analyzing environment configuration...',
    '> Generating developer workspace...',
    '> Analysis complete.',
  ];

  useEffect(() => {
    let i = 0;
    const addLog = setInterval(() => {
      if (i < logLines.length) {
        setLog(prev => [...prev, logLines[i]]);
        i++;
        if (i === 3) setPhase('analyzing');
        if (i === logLines.length) {
          setPhase('complete');
          setMetrics({ files: 3842, deps: 147, routes: 89, config: 6 });
          clearInterval(addLog);
        }
      }
    }, 500);
    return () => clearInterval(addLog);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl shadow-black/50 max-w-xl w-full">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 bg-elevated border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-error/60" />
            <span className="w-3 h-3 rounded-full bg-warning/60" />
            <span className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <span className="text-xs font-mono text-text-secondary ml-2">repopilot — analysis</span>
        </div>
        <StatusBadge
          status={phase === 'complete' ? 'complete' : 'analyzing'}
          size="sm"
          label={phase === 'scanning' ? 'SCANNING' : phase === 'analyzing' ? 'ANALYZING' : 'ANALYZED'}
        />
      </div>

      {/* Repo identity */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-text-secondary" />
          <span className="font-mono text-sm text-accent-cyan">github.com/vercel/next.js</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="font-mono text-xs text-text-secondary">canary</span>
          <span className="text-border mx-1">·</span>
          <span className="font-mono text-xs text-text-secondary">TypeScript</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 py-3 border-b border-border grid grid-cols-4 gap-2">
        {[
          { label: 'FILES', value: metrics.files },
          { label: 'DEPS', value: metrics.deps },
          { label: 'ROUTES', value: metrics.routes },
          { label: 'CONFIG', value: metrics.config },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="font-mono text-base font-semibold text-text-primary">
              {value > 0 ? value.toLocaleString() : <span className="text-text-secondary animate-pulse">—</span>}
            </div>
            <div className="text-[9px] font-mono text-text-secondary tracking-widest mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Architecture (visible after analysis) */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="px-4 py-3 border-b border-border"
          >
            <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-3">ARCHITECTURE</div>
            <div className="flex flex-col items-center gap-1.5">
              <ArchNode label="React Frontend" sub="App Router" delay={0.1} type="frontend" />
              <div className="w-px h-3 bg-border" />
              <ArchNode label="API Routes" sub="Edge + Node.js" delay={0.2} type="backend" />
              <div className="flex gap-4">
                <div className="w-px h-3 bg-border" />
                <div className="w-px h-3 bg-border opacity-0" />
              </div>
              <div className="flex gap-3">
                <ArchNode label="Auth Layer" sub="NextAuth.js" delay={0.3} type="auth" />
                <ArchNode label="PostgreSQL" sub="via Prisma" delay={0.35} type="db" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal log */}
      <div className="px-4 py-3 max-h-28 overflow-hidden">
        {log.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: i === log.length - 1 ? 1 : 0.4, x: 0 }}
            className={`font-mono text-[11px] leading-relaxed ${
              line.includes('complete') ? 'text-success' :
              line.includes('WARNING') || line.includes('⚠') ? 'text-warning' :
              'text-text-secondary'
            }`}
          >
            {line}
          </motion.div>
        ))}
        {phase !== 'complete' && (
          <span className="inline-block w-2 h-3 bg-accent-cyan animate-blink ml-0.5" />
        )}
      </div>

      {phase !== 'complete' && <ScanningLine />}
    </div>
  );
}

// ── Section: Problem ────────────────────────────────────────────────────────
function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

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
    <section ref={ref} className="py-24 px-6 border-t border-border">
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
                animate={inView ? { opacity: 1, x: 0 } : {}}
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
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-text-primary mb-2">
                {inView && <Counter target={2} />}–<Counter target={8} />h
              </div>
              <div className="text-sm text-text-secondary">
                average developer onboarding time for a new repository
              </div>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-error mb-2">
                {inView && <Counter target={60} />}%
              </div>
              <div className="text-sm text-text-secondary">
                of that time spent understanding structure rather than writing code
              </div>
            </div>
            <div className="card p-6">
              <div className="text-4xl font-mono font-semibold text-warning mb-2">
                {inView && <Counter target={3} />}×
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
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const features = [
    { id: '01', label: 'Architecture Map', desc: 'Visualize how components, services, and data flow connect', accent: 'text-accent-cyan', border: 'border-accent-cyan/20' },
    { id: '02', label: 'Setup Assistant', desc: 'Step-by-step environment validation and configuration guidance', accent: 'text-accent-violet', border: 'border-accent-violet/20' },
    { id: '03', label: 'Debug Agent', desc: 'AI-powered error analysis with file-level context', accent: 'text-success', border: 'border-success/20' },
    { id: '04', label: 'Codebase Q&A', desc: 'Ask natural language questions, get file-aware answers', accent: 'text-warning', border: 'border-warning/20' },
    { id: '05', label: 'Starter Tasks', desc: 'AI-generated contribution path ranked by difficulty', accent: 'text-accent-cyan', border: 'border-accent-cyan/20' },
    { id: '06', label: 'Dependency Intel', desc: 'Detect outdated, vulnerable, and unused packages', accent: 'text-error', border: 'border-error/20' },
  ];

  return (
    <section ref={ref} className="py-24 px-6 border-t border-border bg-surface">
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
                animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="hidden md:block text-text-secondary"
              >
                <ArrowRight size={20} />
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
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
              animate={inView ? { opacity: 1, y: 0 } : {}}
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
  const [repoInput, setRepoInput] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
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
              {['Product', 'Workflow', 'Architecture'].map(label => (
                <a key={label} href="#" className="btn-ghost text-xs">{label}</a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              SYSTEM ONLINE
            </div>
            <Link to="/app" className="btn-primary text-xs px-4 py-2">
              Open App <ArrowRight size={12} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 md:pt-24 pb-20 px-6 relative overflow-hidden">
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
                <div className="flex-1 flex items-center gap-2 bg-surface border border-border rounded px-3 py-2.5 focus-within:border-accent-cyan/50 transition-colors">
                  <GitBranch size={14} className="text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={e => setRepoInput(e.target.value)}
                    placeholder="github.com/owner/repository"
                    className="flex-1 bg-transparent text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Analyze
                </button>
              </motion.form>

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

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="section-label mb-4">Ready to Start</div>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
            Open a repository.<br />
            Understand it in seconds.
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            RepoPilot turns the anxiety of joining an unfamiliar codebase<br className="hidden md:block" />
            into a structured, guided developer workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app" className="btn-primary px-8 py-3 text-base">
              Open RepoPilot
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3 text-base">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-text-secondary">RepoPilot</span>
            <span className="text-border">·</span>
            <span className="text-xs text-text-secondary">IBM Bob 2.0 Hackathon</span>
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
