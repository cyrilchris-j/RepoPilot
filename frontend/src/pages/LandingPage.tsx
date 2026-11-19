import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo } from '../lib/RepoContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  GitBranch,
  Terminal,
  Activity,
  Shield,
  Eye,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Cpu,
  CheckCircle2,
  Clock,
  Zap,
  SlidersHorizontal,
  FileCode2,
  MessageSquareCode,
} from 'lucide-react';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { IPhoneShowcase } from '../components/IPhoneShowcase';

// ── Bento Grid Section ───────────────────────────────────────────────────────
function BentoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [activeChipTab, setActiveChipTab] = useState<'latency' | 'accuracy' | 'privacy'>('latency');

  return (
    <section id="bento" ref={ref} className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono mb-4 bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles size={12} />
            <span>PRO ARCHITECTURE & CAPABILITIES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gradient-titanium mb-4">
            Engineered to Perfection.
          </h2>
          <p className="text-white/45 text-base md:text-lg leading-relaxed">
            Every layer of RepoPilot is calibrated for instant developer comprehension, from static AST indexing to deep neural reasoning.
          </p>
        </motion.div>

        {/* Apple-style Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Neural Topology Radar (Span 2) */}
          <SpotlightCard
            className="md:col-span-2 p-8 flex flex-col justify-between min-h-[380px]"
            spotlightColor="rgba(34, 211, 238, 0.14)"
            borderColor="rgba(34, 211, 238, 0.25)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-tight">Neural Topology Radar</h3>
                    <p className="text-xs text-white/40 font-mono">Realtime full-stack dependency graph</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  AST MAPPED
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-lg mb-6">
                RepoPilot parses AST syntax trees, API routes, database schemas, and state stores to construct an interactive topological map of any codebase in under 2 seconds.
              </p>
            </div>

            {/* Interactive Node Radar Mockup inside Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'App Router', role: 'Frontend Core', tag: 'Next.js 15', color: '#22D3EE' },
                { name: 'Edge Handlers', role: 'API Layer', tag: 'Vercel / Node', color: '#818CF8' },
                { name: 'Neural Reasoning', role: 'Context Inference', tag: 'AI Engine 70B', color: '#34D399' },
                { name: 'PostgreSQL', role: 'Persistence', tag: 'Prisma ORM', color: '#FCD34D' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.15] transition-all duration-200"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-semibold text-white tracking-tight">{item.name}</span>
                  </div>
                  <div className="text-[10px] text-white/40">{item.role}</div>
                  <div className="text-[9px] font-mono text-white/30 mt-1">{item.tag}</div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Bento Card 2: Neural Reasoning Silicon Core (Span 1) */}
          <SpotlightCard
            className="p-8 flex flex-col justify-between min-h-[380px]"
            spotlightColor="rgba(99, 102, 241, 0.16)"
            borderColor="rgba(99, 102, 241, 0.25)"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight mb-2">Neural Reasoning Core</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">
                Enterprise-grade coding intelligence fine-tuned for syntax verification, zero hallucinations, and AST comprehension.
              </p>
            </div>

            {/* Micro Tab Switcher */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono">
                {(['latency', 'accuracy', 'privacy'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChipTab(tab)}
                    className={`py-1 rounded-lg uppercase transition-colors cursor-pointer ${
                      activeChipTab === tab
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-center">
                {activeChipTab === 'latency' && (
                  <div className="text-indigo-300">
                    <span className="text-lg font-bold text-white block">380ms</span>
                    Average inference latency
                  </div>
                )}
                {activeChipTab === 'accuracy' && (
                  <div className="text-indigo-300">
                    <span className="text-lg font-bold text-white block">99.4%</span>
                    AST code verification rate
                  </div>
                )}
                {activeChipTab === 'privacy' && (
                  <div className="text-indigo-300">
                    <span className="text-lg font-bold text-white block">Air-Gapped</span>
                    Zero code retention guarantee
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 3: Instant Zero-Config Setup (Span 1) */}
          <SpotlightCard
            className="p-8 flex flex-col justify-between min-h-[340px]"
            spotlightColor="rgba(16, 185, 129, 0.14)"
            borderColor="rgba(16, 185, 129, 0.25)"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-5">
                <SlidersHorizontal size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight mb-2">Zero-Config Setup</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-4">
                Automated detection of required environment variables, node versions, and launch scripts with 1-click test runners.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] font-mono text-[11px] space-y-1.5">
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>Node.js v20.x verified</span>
              </div>
              <div className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>.env.example mapped (6 keys)</span>
              </div>
              <div className="text-white/40 flex items-center gap-1.5 pt-1 border-t border-white/[0.05]">
                <span>› npm run dev ready</span>
              </div>
            </div>
          </SpotlightCard>

          {/* Bento Card 4: Codebase Q&A Assistant (Span 2) */}
          <SpotlightCard
            className="md:col-span-2 p-8 flex flex-col justify-between min-h-[340px]"
            spotlightColor="rgba(59, 130, 246, 0.16)"
            borderColor="rgba(59, 130, 246, 0.25)"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white tracking-tight">Interactive Codebase Q&A</h3>
                    <p className="text-xs text-white/40 font-mono">Instant answers with exact file & line references</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  FILE-AWARE
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-lg mb-6">
                Ask architectural questions in plain English: "Where is Stripe checkout verified?", "How do WebSocket subscriptions reconnect?", or "Generate a PR checklist".
              </p>
            </div>

            {/* Conversation Preview */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/80">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px]">USER</span>
                <span>Where does user permission validation happen before database mutations?</span>
              </div>
              <div className="text-xs text-white/50 pl-2 border-l-2 border-blue-500/40 font-sans leading-relaxed">
                Permission validation is enforced via the middleware in{' '}
                <span className="text-cyan-300 font-mono text-[11px] bg-cyan-950/40 px-1 py-0.5 rounded">
                  lib/auth/rbac.ts:38
                </span>{' '}
                using token claims before delegating to the Prisma mutation handlers.
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

// ── Apple By The Numbers Specs Section ──────────────────────────────────────
function SpecsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const specs = [
    { number: '<0.4s', label: 'STATIC AST SCAN', desc: 'Sub-second AST topology extraction across thousands of modules' },
    { number: '100%', label: 'ENTERPRISE SECURE', desc: 'Air-gapped AI infrastructure with zero code leakage' },
    { number: '0 Config', label: 'FRICTIONLESS ENTRY', desc: 'Simply enter any public or private GitHub repository URL to launch' },
    { number: '10x', label: 'ONBOARDING VELOCITY', desc: 'Accelerate from unfamiliar clone to your first committed pull request' },
  ];

  return (
    <section id="specs" ref={ref} className="py-24 px-6 border-y border-white/[0.06] bg-black/40 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono tracking-widest text-blue-400 uppercase">
            SPECIFICATIONS & BENCHMARKS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mt-2">
            By the Numbers.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specs.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-6 rounded-[28px] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-gradient-titanium font-sans mb-2">
                {item.number}
              </div>
              <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
                {item.label}
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Interactive Comparison Section: The Old Way vs RepoPilot Pro ───────────
function ComparisonSection() {
  const [mode, setMode] = useState<'traditional' | 'pro'>('pro');

  return (
    <section className="py-28 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
            A RADICAL LEAP FORWARD
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2 mb-4">
            The Traditional Way vs. RepoPilot Pro
          </h2>
          <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto mb-8">
            Experience the immense difference between lost hours of manual codebase spelunking and instantaneous AI clarity.
          </p>

          {/* Apple Segmented Toggle Pill */}
          <div className="inline-flex p-1 rounded-full bg-white/[0.05] border border-white/[0.1]">
            <button
              onClick={() => setMode('traditional')}
              className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                mode === 'traditional'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              Traditional Onboarding
            </button>
            <button
              onClick={() => setMode('pro')}
              className={`px-5 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                mode === 'pro'
                  ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.4)]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              RepoPilot Pro Experience
            </button>
          </div>
        </div>

        {/* Comparison Card */}
        <AnimatePresence mode="wait">
          {mode === 'traditional' ? (
            <motion.div
              key="traditional"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-8 rounded-[32px] bg-rose-950/10 border border-rose-500/20 space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-semibold">
                <Clock size={16} />
                <span>TYPICAL NEW HIRE WORKFLOW: 4 TO 12 HOURS LOST</span>
              </div>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Digging through stale READMEs with outdated environment setup commands.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Hunting down invisible dependencies and failing runtime configuration files.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Struggling to locate where auth, routing, and database state meet in the codebase.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-mono">✕</span>
                  <span>Interrupting senior engineers on Slack for basic architecture walkthroughs.</span>
                </li>
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="pro"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-8 rounded-[32px] bg-blue-950/20 border border-blue-500/30 space-y-4 shadow-[0_20px_50px_rgba(0,113,227,0.15)]"
            >
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold">
                <Zap size={16} />
                <span>REPOPILOT PRO WORKFLOW: FULL MASTERY IN 30 SECONDS</span>
              </div>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>Instant live interactive architecture map with node relationships and data routes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>Automated environment variable diagnostics and 1-click execution commands.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>AI Assistant answers all codebase questions with line-level code citations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-mono">✓</span>
                  <span>AI-curated starter tasks ranked by complexity so developers ship PRs on day one.</span>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ── Main Apple-Inspired Landing Page ────────────────────────────────────────
export function LandingPage() {
  const navigate = useNavigate();
  const { setRepoUrl } = useRepo();
  const [repoInput, setRepoInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    const url = repoInput.trim() || 'github.com/vercel/next.js';
    setRepoUrl(url);
    navigate('/analyzing', { state: { repoUrl: url } });
  };

  const selectSample = (sampleUrl: string) => {
    setRepoInput(sampleUrl);
    setRepoUrl(sampleUrl);
    navigate('/analyzing', { state: { repoUrl: sampleUrl } });
  };

  return (
    <div className="min-h-screen bg-black text-[#F5F5F7] selection:bg-cyan-500/20 selection:text-cyan-300 relative overflow-x-hidden">
      {/* Dynamic Apple-Style Ambient Lighting (Subtle titanium & cyan glows) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute w-[800px] h-[550px] rounded-full top-[-100px] left-1/2 -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(59, 130, 246, 0.15) 0%, rgba(34, 211, 238, 0.04) 50%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bottom-[-100px] right-[-100px]"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.07) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* Apple Floating Pill Navigation Bar */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl rounded-full glass-floating-nav px-5 py-2.5 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-sm">
              <Terminal size={14} />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">RepoPilot</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              PRO
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs">
            <a href="#hero" className="px-3 py-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
              Overview
            </a>
            <a href="#demo" className="px-3 py-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
              Device Demo
            </a>
            <a href="#bento" className="px-3 py-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
              Capabilities
            </a>
            <a href="#specs" className="px-3 py-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors">
              Specs
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>

          <Link to="/app" className="btn-apple-primary text-xs py-1.5 px-4">
            Open Workspace <ChevronRight size={13} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-32 md:pt-40 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left Hero Column */}
            <div className="flex-1 max-w-xl text-center lg:text-left">
              {/* Eyebrow Pill */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono mb-6 bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-indigo-500/15 border border-white/10 text-cyan-300"
              >
                <Sparkles size={12} className="text-cyan-400" />
                <span>TITANIUM INTELLIGENCE · NEURAL AI INTEGRATED</span>
              </motion.div>

              {/* Apple Pro Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.04] mb-6"
              >
                <span className="text-white block">TITANIUM POWER.</span>
                <span className="text-gradient-titanium block">REPOSITORY CLARITY.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-base sm:text-lg text-white/50 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
              >
                Turn any unfamiliar codebase into a high-definition developer workspace. Full-stack topology radar, proactive AI debug agent, and guided contribution roadmaps.
              </motion.p>

              {/* Apple Spotlight Search Input Bar */}
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                onSubmit={handleAnalyze}
                className="flex flex-col sm:flex-row gap-2.5 mb-5 max-w-lg mx-auto lg:mx-0"
              >
                <div
                  className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
                    inputFocused
                      ? 'bg-white/[0.08] border-blue-500/60 shadow-[0_0_0_4px_rgba(0,113,227,0.18)]'
                      : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                  } border`}
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <GitBranch size={16} className="text-white/40 shrink-0" />
                  <input
                    type="text"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="github.com/owner/repository"
                    className="flex-1 bg-transparent text-sm font-mono text-white placeholder:text-white/25 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-apple-primary whitespace-nowrap px-6 py-3 text-sm font-semibold rounded-full"
                >
                  Analyze <ArrowRight size={14} />
                </button>
              </motion.form>

              {/* Quick Sample Repository Chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-2 flex-wrap justify-center lg:justify-start mb-8 text-xs font-mono text-white/35"
              >
                <span>Try:</span>
                {[
                  { label: 'vercel/next.js', url: 'github.com/vercel/next.js' },
                  { label: 'facebook/react', url: 'github.com/facebook/react' },
                  { label: 'expressjs/express', url: 'github.com/expressjs/express' },
                  { label: 'shadcn/ui', url: 'github.com/shadcn-ui/ui' },
                ].map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => selectSample(sample.url)}
                    className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-cyan-300 hover:border-cyan-500/30 transition-all cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </motion.div>

              {/* Sub-links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 justify-center lg:justify-start text-xs font-medium text-white/40"
              >
                <Link to="/app" className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Eye size={13} /> View live workspace demo
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <ExternalLink size={13} /> GitHub Open Source
                </a>
              </motion.div>
            </div>

            {/* Right: The Interactive iPhone 16 Pro Showcase */}
            <motion.div
              id="demo"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full flex justify-center items-center"
            >
              <IPhoneShowcase />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities Ticker Strip */}
      <section className="py-4 border-y border-white/[0.06] bg-black/60 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar py-1 text-xs font-mono text-white/40">
            {[
              { icon: <Layers size={13} />, text: 'NEURAL TOPOLOGY' },
              { icon: <Cpu size={13} />, text: 'NEURAL REASONING' },
              { icon: <Activity size={13} />, text: 'PROACTIVE DEBUG AGENT' },
              { icon: <Shield size={13} />, text: 'ZERO CVE RISK' },
              { icon: <SlidersHorizontal size={13} />, text: 'ZERO-CONFIG SETUP' },
              { icon: <MessageSquareCode size={13} />, text: 'CODEBASE Q&A' },
              { icon: <FileCode2 size={13} />, text: '1-CLICK HANDBOOK' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 shrink-0 hover:text-white/80 transition-colors">
                <span className="text-blue-400">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <BentoSection />

      {/* Specs Section */}
      <SpecsSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Bottom Apple Call To Action */}
      <section className="py-28 px-6 relative border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6 bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles size={12} />
            <span>ACCELERATE YOUR REPO WORKFLOW</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Ready to experience Pro intelligence?
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Drop any repository link and start navigating with the highest level of architectural clarity.
          </p>

          <div className="flex justify-center">
            <Link to="/app" className="btn-apple-primary px-8 py-3.5 text-base font-medium shadow-[0_4px_24px_rgba(0,113,227,0.4)]">
              Launch RepoPilot Workspace <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Apple Minimalist Footer */}
      <footer className="py-10 px-6 border-t border-white/[0.06] bg-black text-xs text-white/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-blue-400">
              <Terminal size={12} />
            </div>
            <span className="font-semibold text-white/70">RepoPilot Pro</span>
            <span>·</span>
            <span>Autonomous AI Workspace</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
