import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo } from '../lib/RepoContext';
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
  RotateCcw,
  Cpu,
  Layers,
  Sparkles,
  Code2,
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

// ── Architecture Node ───────────────────────────────────────────────────────
function ArchNode({
  label, sub, type = 'default', active = true,
}: {
  label: string; sub: string; type?: 'frontend' | 'backend' | 'db' | 'auth' | 'default'; active?: boolean;
}) {
  const activeStyles = {
    frontend: { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.3)', text: '#22D3EE', glow: 'rgba(34,211,238,0.15)' },
    backend:  { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)',  text: '#818CF8', glow: 'rgba(99,102,241,0.15)' },
    db:       { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)',  text: '#34D399', glow: 'rgba(16,185,129,0.15)' },
    auth:     { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)',  text: '#FCD34D', glow: 'rgba(245,158,11,0.15)' },
    default:  { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.3)', glow: 'transparent' },
  };

  const s = activeStyles[type];

  return (
    <motion.div
      animate={active ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.97 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="px-3 py-2 rounded-xl border text-xs font-mono select-none"
      style={{
        background: active ? s.bg : 'rgba(255,255,255,0.02)',
        borderColor: active ? s.border : 'rgba(255,255,255,0.05)',
        color: active ? s.text : 'rgba(255,255,255,0.15)',
        boxShadow: active ? `0 0 16px ${s.glow}` : 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="font-semibold tracking-tight leading-none">{label}</div>
      <div className="text-[10px] mt-1 font-sans opacity-70">{sub}</div>
    </motion.div>
  );
}

// ── Hero Steps ─────────────────────────────────────────────────────────────
interface HeroStep {
  text: string;
  phase: 'scanning' | 'analyzing' | 'complete';
  files?: number; deps?: number; routes?: number; config?: number;
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

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({ top: terminalRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [log]);

  useEffect(() => {
    setPhase('scanning');
    setLog([]);
    setMetrics({ files: 0, deps: 0, routes: 0, config: 0 });
    setActiveNodes({ frontend: false, backend: false, leaves: false });
    let i = 0;
    const interval = setInterval(() => {
      if (i >= HERO_STEPS.length) { clearInterval(interval); return; }
      const step = HERO_STEPS[i];
      setLog(prev => [...prev, step.text]);
      setPhase(step.phase);
      if (step.files) setMetrics(m => ({ ...m, files: step.files! }));
      if (step.deps) setMetrics(m => ({ ...m, deps: step.deps! }));
      if (step.routes) setMetrics(m => ({ ...m, routes: step.routes! }));
      if (step.config) setMetrics(m => ({ ...m, config: step.config! }));
      if (step.revealNode === 'frontend') setActiveNodes(n => ({ ...n, frontend: true }));
      else if (step.revealNode === 'backend') setActiveNodes(n => ({ ...n, backend: true }));
      else if (step.revealNode === 'leaves') setActiveNodes(n => ({ ...n, leaves: true }));
      i++;
      if (i === HERO_STEPS.length) { setPhase('complete'); clearInterval(interval); }
    }, 550);
    return () => clearInterval(interval);
  }, [runId]);

  return (
    <div
      className="rounded-3xl overflow-hidden max-w-xl w-full flex flex-col"
      style={{
        background: 'rgba(10, 14, 22, 0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Window chrome — Apple style */}
      <div
        className="flex items-center justify-between px-4 py-3 select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <span className="w-3 h-3 rounded-full" style={{ background: '#28CA41' }} />
          </div>
          <span className="text-xs font-mono text-white/30 ml-2">repopilot — analysis</span>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'complete' && (
            <button
              onClick={() => setRunId(r => r + 1)}
              type="button"
              className="flex items-center gap-1 text-[11px] font-mono text-white/30 hover:text-cyan-400 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={10} />
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
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2">
          <GitBranch size={12} className="text-cyan-400 shrink-0" />
          <span className="font-mono text-xs font-medium text-white/70">github.com/vercel/next.js</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/30">
          <span className="px-1.5 py-0.5 rounded-md text-[10px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>canary</span>
          <span>TypeScript</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 py-2.5 grid grid-cols-4 gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.15)' }}>
        {[
          { label: 'FILES', value: metrics.files, color: '#22D3EE' },
          { label: 'DEPS',  value: metrics.deps,  color: '#818CF8' },
          { label: 'ROUTES',value: metrics.routes, color: '#34D399' },
          { label: 'CONFIG',value: metrics.config, color: '#FCD34D' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center py-0.5">
            <div className="font-mono text-sm font-bold transition-all" style={{ color: value > 0 ? color : 'rgba(255,255,255,0.12)' }}>
              {value > 0 ? value.toLocaleString() : '⋯'}
            </div>
            <div className="text-[9px] font-mono text-white/25 tracking-wider mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Discovered Architecture</span>
          <span className="text-[10px] font-mono text-cyan-400/70">
            {phase === 'complete' ? 'Topology Mapped' : activeNodes.frontend ? 'Mapping...' : 'Detecting...'}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <ArchNode label="React Frontend" sub="Next.js App Router" type="frontend" active={activeNodes.frontend} />
          <motion.div
            className="w-px h-3"
            animate={{ background: activeNodes.backend ? 'rgba(34,211,238,0.6)' : 'rgba(255,255,255,0.08)' }}
            transition={{ duration: 0.4 }}
          />
          <ArchNode label="API Routes" sub="Edge & Node Runtime" type="backend" active={activeNodes.backend} />
          <div className="w-52 h-4 relative flex items-center justify-center">
            <svg className="w-52 h-4 overflow-visible" viewBox="0 0 208 16" fill="none">
              <motion.path
                d="M 104 0 L 104 6 M 40 6 L 168 6 M 40 6 L 40 16 M 168 6 L 168 16"
                animate={{ stroke: activeNodes.leaves ? 'rgba(34,211,238,0.5)' : 'rgba(255,255,255,0.08)' }}
                transition={{ duration: 0.4 }}
                strokeWidth="1.2" strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex gap-4">
            <ArchNode label="Auth Layer" sub="NextAuth.js v5" type="auth" active={activeNodes.leaves} />
            <ArchNode label="PostgreSQL" sub="via Prisma ORM" type="db" active={activeNodes.leaves} />
          </div>
        </div>
      </div>

      {/* Terminal log */}
      <div className="p-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div
            className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-white/25 select-none"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
          >
            <div className="flex items-center gap-1.5">
              <Terminal size={10} className="text-cyan-400/60" />
              <span>analysis.log</span>
            </div>
            <span className="text-[9px] text-white/15">{phase === 'complete' ? 'FINISHED' : 'STREAMING'}</span>
          </div>
          <div ref={terminalRef} className="p-2.5 h-24 overflow-y-auto space-y-1 font-mono text-[11px] scroll-smooth">
            <AnimatePresence>
              {log.map((line, i) => {
                const isLast = i === log.length - 1;
                const isDone = line.includes('complete');
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-1.5 leading-relaxed ${
                      isDone ? 'text-emerald-400 font-medium' :
                      isLast && phase !== 'complete' ? 'text-cyan-400' : 'text-white/30'
                    }`}
                  >
                    <span className={`shrink-0 select-none ${isDone ? 'text-emerald-400' : 'text-cyan-400/60'}`}>
                      {isDone ? '✓' : '›'}
                    </span>
                    <span className="break-all">{line}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {phase !== 'complete' && (
              <div className="flex items-center gap-1 pl-4 h-3.5">
                <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse rounded-sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {phase !== 'complete' && <ScanningLine />}
    </div>
  );
}

// ── Problem Section ──────────────────────────────────────────────────────────
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

  const statusColor = { ok: '#10B981', warning: '#F59E0B', error: '#EF4444' };
  const textColor = { ok: 'rgba(255,255,255,0.5)', warning: '#FCD34D', error: '#FC8181' };

  return (
    <section id="workflow" ref={ref} className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <div className="mb-3">
            <span className="section-label">01 — The Problem</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            THE UNKNOWN CODEBASE
          </h2>
          <p className="text-white/40 max-w-xl mb-16 leading-relaxed">
            Joining an unfamiliar repository means hours of manual investigation before writing a single line of code.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: statusColor[step.status as keyof typeof statusColor] }}
                />
                <div className="text-sm font-mono" style={{ color: textColor[step.status as keyof typeof textColor] }}>
                  {step.label}
                </div>
                {step.status !== 'ok' && (
                  <div
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded-lg"
                    style={{
                      background: step.status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: step.status === 'error' ? '#FC8181' : '#FCD34D',
                      border: `1px solid ${step.status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}
                  >
                    {step.status === 'error' ? 'BLOCKED' : 'SLOW'}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            {[
              { value: '2–8h', label: 'average developer onboarding time for a new repository', color: 'white' },
              { value: '60%', label: 'of that time spent understanding structure rather than writing code', color: '#EF4444' },
              { value: '3×', label: 'more likely to introduce bugs in unfamiliar codebases', color: '#F59E0B' },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="text-4xl font-mono font-bold mb-2" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Solution Section ─────────────────────────────────────────────────────────
function SolutionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const features = [
    { id: '01', label: 'Architecture Map',   desc: 'Visualize how components, services, and data flow connect', color: '#22D3EE', glow: 'rgba(34,211,238,0.08)' },
    { id: '02', label: 'Setup Assistant',    desc: 'Step-by-step environment validation and configuration guidance', color: '#818CF8', glow: 'rgba(129,140,248,0.08)' },
    { id: '03', label: 'Debug Agent',        desc: 'AI-powered error analysis with file-level context', color: '#34D399', glow: 'rgba(52,211,153,0.08)' },
    { id: '04', label: 'Codebase Q&A',       desc: 'Ask natural language questions, get file-aware answers', color: '#FCD34D', glow: 'rgba(252,211,77,0.08)' },
    { id: '05', label: 'Starter Tasks',      desc: 'AI-generated contribution path ranked by difficulty', color: '#22D3EE', glow: 'rgba(34,211,238,0.08)' },
    { id: '06', label: 'Dependency Intel',   desc: 'Detect outdated, vulnerable, and unused packages', color: '#FC8181', glow: 'rgba(252,129,129,0.08)' },
  ];

  return (
    <section id="architecture" ref={ref} className="py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
          <div className="mb-3">
            <span className="section-label">02 — The Solution</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            FROM UNKNOWN TO ACTIONABLE
          </h2>
          <p className="text-white/40 max-w-xl mb-16 leading-relaxed">
            RepoPilot converts an unfamiliar repository into a complete developer workspace in seconds.
          </p>
        </motion.div>

        {/* Flow */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-16">
          {[
            { label: 'Repository', sub: 'any GitHub URL', color: 'rgba(255,255,255,0.5)', accent: false },
            null,
            { label: 'RepoPilot', sub: 'AI Analysis Engine', color: '#60A5FA', accent: true },
            null,
            { label: 'Workspace', sub: 'Developer-Ready', color: '#34D399', accent: false },
          ].map((item, i) =>
            item === null ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: i * 0.12, duration: 0.3 }}
                className="hidden md:block text-white/20"
              >
                <ArrowRight size={20} />
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl px-6 py-4 text-center"
                style={{
                  background: item.accent ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)',
                  border: item.accent ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: item.accent ? '0 0 24px rgba(59,130,246,0.08)' : 'none',
                }}
              >
                <div className="text-base font-semibold" style={{ color: item.color }}>{item.label}</div>
                <div className="text-xs text-white/30 font-mono mt-0.5">{item.sub}</div>
              </motion.div>
            )
          )}
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.4 }}
              className="group rounded-2xl p-5 transition-all duration-200 cursor-default"
              style={{
                background: f.glow,
                border: `1px solid ${f.color}20`,
                backdropFilter: 'blur(8px)',
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 8px 32px ${f.glow}` }}
            >
              <div className="text-[10px] font-mono tracking-widest mb-3" style={{ color: f.color }}>{f.id}</div>
              <div className="text-sm font-semibold text-white mb-1.5">{f.label}</div>
              <div className="text-xs text-white/40 leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Landing Page ────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const { setRepoUrl } = useRepo();
  const [repoInput, setRepoInput] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

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
    <div className="min-h-screen" style={{ background: '#080A0F' }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            top: '-200px', left: '50%', transform: 'translateX(-30%)',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            bottom: '0', right: '-100px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Navigation */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300`}
        style={
          navScrolled
            ? { background: 'rgba(8,10,15,0.8)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
            : { background: 'transparent' }
        }
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                  boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                }}
              >
                <Cpu size={14} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">RepoPilot</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <a href="#product" className="btn-ghost text-xs">Product</a>
              <a href="#workflow" className="btn-ghost text-xs">Workflow</a>
              <a href="#architecture" className="btn-ghost text-xs">Features</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono" style={{ color: '#10B981' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
              SYSTEM ONLINE
            </div>
            <Link to="/app" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              Open App <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="product" className="pt-16 md:pt-28 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start lg:items-center">
            {/* Left content */}
            <div className="flex-1 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <StatusBadge status="complete" label="ANALYSIS ENGINE READY" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5"
              >
                <span className="text-white">REPOSITORY</span>
                <br />
                <span className="text-gradient-blue">INTELLIGENCE</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg leading-relaxed mb-2"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Turn an unfamiliar codebase into an actionable developer workspace.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-sm font-mono mb-8"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                Analyze. Understand. Debug. Start contributing.
              </motion.p>

              {/* Input form */}
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                onSubmit={handleAnalyze}
                className="flex gap-2 mb-4"
              >
                <div
                  className="flex-1 flex items-center gap-2 px-3.5 py-2.5 h-11 rounded-2xl transition-all duration-200"
                  style={{
                    background: inputFocused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                    border: inputFocused ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: inputFocused ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <GitBranch size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={e => setRepoInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="github.com/owner/repository"
                    className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-white/20 focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary whitespace-nowrap h-11 flex items-center justify-center gap-2 rounded-2xl px-5">
                  Analyze <Zap size={13} />
                </button>
              </motion.form>

              {/* Sample repos */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex items-center gap-2 mb-8 flex-wrap"
              >
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Try:</span>
                {[
                  { label: 'vercel/next.js', url: 'github.com/vercel/next.js' },
                  { label: 'facebook/react', url: 'github.com/facebook/react' },
                  { label: 'expressjs/express', url: 'github.com/expressjs/express' },
                ].map(sample => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => { setRepoInput(sample.url); setRepoUrl(sample.url); navigate('/analyzing', { state: { repoUrl: sample.url } }); }}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-xl transition-all duration-150 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.2)';
                      (e.currentTarget as HTMLElement).style.color = '#60A5FA';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-5"
              >
                <Link to="/app" className="flex items-center gap-1.5 text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  <Eye size={13} /> View demo workspace <ChevronRight size={11} />
                </Link>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  <ExternalLink size={12} /> GitHub
                </a>
              </motion.div>
            </div>

            {/* Right: Hero preview */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex justify-center w-full"
            >
              <HeroPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section
        className="py-5 px-6 overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-6 md:gap-12 justify-center items-center">
            {[
              { icon: <Terminal size={13} />, label: 'Setup Analysis' },
              { icon: <GitBranch size={13} />, label: 'Architecture Mapping' },
              { icon: <Zap size={13} />, label: 'Debug Intelligence' },
              { icon: <Shield size={13} />, label: 'Dependency Audit' },
              { icon: <Eye size={13} />, label: 'Codebase Q&A' },
              { icon: <Layers size={13} />, label: 'Project Summary' },
              { icon: <Code2 size={13} />, label: 'Starter Tasks' },
              { icon: <Sparkles size={13} />, label: 'AI Improvements' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <span style={{ color: '#3B82F6' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProblemSection />
      <SolutionSection />

      {/* Footer */}
      <footer
        className="py-8 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
            >
              <Cpu size={11} className="text-white" />
            </div>
            <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>RepoPilot</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>IBM Bob 2.0 Hackathon</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10B981', boxShadow: '0 0 4px rgba(16,185,129,0.6)' }} />
            Powered by IBM watsonx.ai
          </div>
        </div>
      </footer>
    </div>
  );
}
