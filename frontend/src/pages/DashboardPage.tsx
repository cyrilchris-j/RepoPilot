import { useState, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  GitBranch,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Flame,
  Users,
  GitCommit,
  MessageSquareCode,
  Search,
  Send,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OnboardingExportButton } from '../components/OnboardingExportButton';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { GitCommandsSection } from '../components/GitCommandsSection';
import type { AnalysisActivity, GitInsights } from '../types';

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref}>
      {inView ? target.toLocaleString() : '0'}
    </span>
  );
}

function MetricCard({ label, value, sub, accent = false }: {
  label: string; value: number | string; sub?: string; accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: accent ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.03)',
        border: accent ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        boxShadow: accent ? '0 0 20px rgba(59,130,246,0.06)' : 'none',
      }}
    >
      <div
        className="text-2xl font-mono font-bold mb-1"
        style={{ color: accent ? '#60A5FA' : 'rgba(255,255,255,0.85)' }}
      >
        {typeof value === 'number' ? <Counter target={value} /> : value}
      </div>
      <div className="text-[9px] font-mono tracking-widest uppercase mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</div>}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [askInput, setAskInput] = useState('');
  const [copiedSpecialCmd, setCopiedSpecialCmd] = useState(false);
  const { repoData, repoUrl } = useRepo();
  const repo = repoData?.repository || (() => {
    const rawUrl = repoUrl || '';
    const clean = rawUrl ? rawUrl.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '') : 'workspace';
    const parts = clean.split('/');
    const owner = parts.length > 1 ? parts[0] : 'workspace';
    const name = parts.length > 1 ? parts[1] : clean;
    return {
      url: rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://github.com/${clean}`) : '',
      name: name || 'Repository',
      owner: owner || 'local',
      branch: 'main',
      description: `${name} repository analyzed by RepoPilot`,
      language: 'JavaScript',
      status: 'complete' as const,
    };
  })();

  const metrics = repoData?.metrics || {
    totalFiles: 0,
    linesOfCode: 0,
    dependencies: repoData?.dependenciesList?.length || 0,
    routes: 0,
    modules: 0,
    testCoverage: 0,
  };

  const setupSteps = repoData?.setupSteps || [];
  const starterTasks = repoData?.starterTasks || [];

  const gitInsights: GitInsights = repoData?.gitInsights || {
    hotspots: (repoData?.architectureNodes || []).map(n => ({
      path: n.filePath || n.label,
      commits: 5,
      churnScore: 'medium' as const,
    })),
    contributors: [
      { name: repo.owner, commits: 10, percentage: 100 }
    ],
    recentCommits: [],
    totalCommits: 10,
  };

  const dynamicActivity: AnalysisActivity[] = useMemo(() => {
    const totalFiles = metrics.totalFiles || repoData?.architectureNodes?.length || 1;
    const depsCount = metrics.dependencies || repoData?.dependenciesList?.length || 0;
    const nodesCount = repoData?.architectureNodes?.length || 3;
    const repoName = repo.name || 'Repository';

    return [
      { id: '1', timestamp: 'just now', message: `${repoName} index complete — ${totalFiles} files analyzed`, type: 'success' },
      { id: '2', timestamp: 'just now', message: `Dependency graph resolved — ${depsCount} packages detected`, type: 'info' },
      { id: '3', timestamp: 'just now', message: `Architecture mapped — ${nodesCount} structural components identified`, type: 'success' },
      { id: '4', timestamp: 'just now', message: `Tailored improvements and CLI command generated for ${repoName}`, type: 'success' },
      { id: '5', timestamp: 'just now', message: 'Developer workspace ready', type: 'success' },
    ];
  }, [repoData, metrics, repo.name]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    navigate(`/app/ask?q=${encodeURIComponent(askInput.trim())}`);
  };

  const handleAskPrompt = (prompt: string) => {
    navigate(`/app/ask?q=${encodeURIComponent(prompt)}`);
  };

  const miniArchNodes = (repoData?.architectureNodes && repoData.architectureNodes.length > 0)
    ? repoData.architectureNodes.slice(0, 5).map(node => {
        const color = node.type === 'frontend'
          ? 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5'
          : node.type === 'backend'
          ? 'border-accent-violet/40 text-accent-violet bg-accent-violet/5'
          : node.type === 'database'
          ? 'border-success/40 text-success bg-success/5'
          : node.type === 'auth'
          ? 'border-warning/40 text-warning bg-warning/5'
          : 'border-border text-text-secondary';
        return {
          label: node.label,
          sub: node.technology || node.type.toUpperCase(),
          color,
        };
      })
    : [
        { label: 'Client / Interface', sub: `${repo.name} UI`, color: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5' },
        { label: 'Application Source', sub: repo.language || 'Application Logic', color: 'border-accent-violet/40 text-accent-violet bg-accent-violet/5' },
        { label: 'Package & Toolchain', sub: 'Project Configuration', color: 'border-warning/40 text-warning bg-warning/5' },
        { label: 'Build & Distribution', sub: 'Production Target', color: 'border-success/40 text-success bg-success/5' },
      ];

  const issues = setupSteps.filter(s => s.status !== 'ok' && s.status !== 'pending');
  const warnings = issues.filter(s => s.status === 'warning');
  const errors = issues.filter(s => s.status === 'error');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Repository identity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{repo.owner}/</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{repo.name}</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {repo.branch}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{repo.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Clock size={11} />
            Analyzed {repoData ? 'from live repository' : 'demo mode'}
          </div>
          <StatusBadge status="complete" />
          <OnboardingExportButton variant="header" />
        </div>
      </motion.div>

      {/* Featured Project Summary & User Flow Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl p-4 sm:p-5 group"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.06) 0%, rgba(13,17,23,0.8) 50%, rgba(139,92,246,0.05) 100%)',
          border: '1px solid rgba(34,211,238,0.15)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 32px rgba(34,211,238,0.05), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg" style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}>
                RECOMMENDED FIRST STEP
              </span>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Architecture Blueprint</span>
            </div>
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
              <span>Deep Project Summary &amp; End-to-End User Flow</span>
            </h2>
            <p className="text-xs max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Explore how this project operates under the hood, view the 5-stage interactive user journey, and review the dual-benefit matrix for both engineers and real users.
            </p>
          </div>
          <Link
            to="/app/summary"
            className="btn-primary text-xs flex items-center gap-2 py-2.5 px-4 shrink-0 shadow-sm"
          >
            <span>View Project Summary &amp; Flow</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>

      {/* Ask Codebase Session (Hero Prompt Bar - Primary Interactive Action) */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}>
              <MessageSquareCode size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>ASK YOUR CODEBASE</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-lg font-medium" style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Ask natural language questions about architecture, files, logic, or dependencies.
              </p>
            </div>
          </div>

          <Link
            to="/app/ask"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan hover:underline shrink-0"
          >
            <span>Open full chat</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Input form */}
        <form onSubmit={handleAskSubmit} className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Search size={15} className="text-accent-cyan shrink-0" />
            <input
              type="text"
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              placeholder="Ask anything (e.g., 'How does authentication work?', 'Where are database models defined?')"
              className="flex-1 bg-transparent text-xs sm:text-sm font-mono focus:outline-none"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            />
          </div>
          <button
            type="submit"
            disabled={!askInput.trim()}
            className="btn-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-xl"
          >
            <Send size={13} />
            <span>Ask</span>
          </button>
        </form>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <MessageSquareCode size={11} style={{ color: '#60A5FA' }} /> Try asking:
          </span>
          {[
            'How is authentication handled?',
            'Explain the component architecture',
            'Where are the main API routes?',
            'How do I run and test locally?',
            'Explain git branch & contribution workflow',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskPrompt(prompt)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left truncate max-w-[260px] sm:max-w-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#60A5FA'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metrics row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <MetricCard label="Source Files" value={metrics.totalFiles} accent />
        <MetricCard label="Dependencies" value={metrics.dependencies} />
        <MetricCard label="API Routes" value={metrics.routes} />
        <MetricCard label="Modules" value={metrics.modules} />
      </motion.div>

      {/* RepoPilot Special Improvement Command & Lab Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                <Terminal size={11} />
                REPOPILOT SPECIAL COMMAND
              </span>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Codebase Evolution Engine
              </span>
            </div>
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Improve, Modernize &amp; Merge Components with 1 Command
            </h3>
            <p className="text-xs max-w-xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Anyone with this repository can run our signature CLI command to automatically audit code, deploy CI/CD pipelines, and merge battle-tested components.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
              <Terminal size={13} style={{ color: '#22D3EE', flexShrink: 0 }} />
              <span className="select-all">npx repopilot@latest scan .</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`npx repopilot@latest scan .`);
                  setCopiedSpecialCmd(true);
                  setTimeout(() => setCopiedSpecialCmd(false), 1800);
                }}
                className="p-1 rounded hover:bg-elevated text-text-secondary hover:text-accent-cyan transition-colors ml-1 cursor-pointer"
                title="Copy Scan Command"
              >
                {copiedSpecialCmd ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
            </div>

            <Link
              to="/app/improvements"
              className="btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <span>Community Feedback &amp; Ideas</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Bar */}
      <QuickActionsBar />

      {/* Architecture preview + issues */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="md:col-span-3 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-label mb-0.5">Architecture</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Detected component relationships</div>
            </div>
            <Link to="/app/architecture" className="text-xs flex items-center gap-1 transition-colors" style={{ color: '#60A5FA' }}>
              Full view <ChevronRight size={12} />
            </Link>
          </div>

          {/* Mini architecture */}
          <div className="flex flex-col items-center gap-2 py-2">
            {miniArchNodes.map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="w-full max-w-xs"
              >
                <div className="rounded-xl px-4 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>{node.label}</div>
                  <div className="text-[10px] opacity-60 font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{node.sub}</div>
                </div>
                {i < miniArchNodes.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Issues */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="md:col-span-2 space-y-3"
        >
          {/* Setup health */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
            <div className="section-label mb-3">Setup Health</div>
            {setupSteps.slice(0, 4).map((step) => (
              <div key={step.id} className="flex items-center gap-2.5 py-1.5 last:border-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {step.status === 'ok' && <CheckCircle size={13} style={{ color: '#10B981', flexShrink: 0 }} />}
                {step.status === 'warning' && <AlertTriangle size={13} style={{ color: '#F59E0B', flexShrink: 0 }} />}
                {step.status === 'error' && <XCircle size={13} style={{ color: '#EF4444', flexShrink: 0 }} />}
                {step.status === 'pending' && <div className="w-3 h-3 rounded-full border shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                <span className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{step.label}</span>
                {step.details && <span className="text-[10px] font-mono truncate max-w-[80px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{step.details}</span>}
              </div>
            ))}
            <Link to="/app/setup" className="mt-3 flex items-center gap-1 text-xs transition-colors" style={{ color: '#60A5FA' }}>
              View setup guide <ChevronRight size={11} />
            </Link>
          </div>

          {/* Detected issues */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
            <div className="section-label mb-3">Detected Issues</div>
            <div className="space-y-2">
              {errors.length > 0 && errors.map(e => (
                <div key={e.id} className="flex items-start gap-2 p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <XCircle size={12} style={{ color: '#EF4444', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#FC8181' }}>{e.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{e.details}</div>
                  </div>
                </div>
              ))}
              {warnings.length > 0 && warnings.map(w => (
                <div key={w.id} className="flex items-start gap-2 p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <AlertTriangle size={12} style={{ color: '#F59E0B', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#FCD34D' }}>{w.label}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{w.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Git Hotspots & Contributor Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid md:grid-cols-2 gap-4"
      >
        {/* Hotspots Card */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-warning shrink-0" />
              <div>
                <div className="section-label mb-0.5">Code Hotspots</div>
                <div className="text-xs text-text-secondary">High-churn files with frequent modifications</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg" style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {gitInsights.totalCommits} commits analyzed
            </span>
          </div>

          <div className="space-y-2">
            {gitInsights.hotspots.slice(0, 4).map((spot, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                    background: spot.churnScore === 'high' ? '#EF4444' : spot.churnScore === 'medium' ? '#F59E0B' : '#10B981'
                  }} />
                  <span className="font-mono truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{spot.path}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{spot.commits} edits</span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-lg" style={{
                    color: spot.churnScore === 'high' ? '#EF4444' : spot.churnScore === 'medium' ? '#F59E0B' : '#10B981',
                    background: spot.churnScore === 'high' ? 'rgba(239,68,68,0.1)' : spot.churnScore === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                    border: `1px solid ${spot.churnScore === 'high' ? 'rgba(239,68,68,0.2)' : spot.churnScore === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  }}>
                    {spot.churnScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors & Recent Commits */}
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-accent-cyan shrink-0" />
              <div>
                <div className="section-label mb-0.5">Key Contributors</div>
                <div className="text-xs text-text-secondary">Primary maintainers & commit velocity</div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {gitInsights.contributors.slice(0, 3).map((contrib, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{contrib.name}</span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{contrib.commits} commits ({contrib.percentage}%)</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${contrib.percentage}%`, background: 'linear-gradient(90deg, #22D3EE, #3B82F6)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {gitInsights.recentCommits.length > 0 && (
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-[10px] font-mono tracking-widest mb-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <GitCommit size={11} style={{ color: '#818CF8' }} />
                RECENT REPOSITORY ACTIVITY
              </div>
              <div className="space-y-1.5">
                {gitInsights.recentCommits.slice(0, 2).map((c, i) => (
                  <div key={i} className="flex items-baseline justify-between text-xs font-mono gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span className="truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.message}</span>
                    <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Git Workflows & Commands */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33, duration: 0.4 }}
      >
        <GitCommandsSection
          repoUrl={repo.url}
          repoName={repo.name}
          branch={repo.branch}
          topHotspotFile={gitInsights.hotspots?.[0]?.path}
        />
      </motion.div>

      {/* Starter tasks preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label mb-0.5">Starter Tasks</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>AI-recommended first steps for this repository</div>
          </div>
          <Link to="/app/tasks" className="text-xs flex items-center gap-1 transition-colors" style={{ color: '#60A5FA' }}>
            All tasks <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {starterTasks.slice(0, 3).map((task) => (
            <Link
              to="/app/tasks" key={task.id}
              className="block p-4 rounded-2xl transition-all group"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md" style={{
                  background: task.difficulty === 'beginner' ? 'rgba(16,185,129,0.1)' : task.difficulty === 'intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: task.difficulty === 'beginner' ? '#34D399' : task.difficulty === 'intermediate' ? '#FCD34D' : '#FC8181',
                  border: `1px solid ${task.difficulty === 'beginner' ? 'rgba(16,185,129,0.2)' : task.difficulty === 'intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {task.difficulty.toUpperCase()}
                </span>
                {task.estimatedTime && (
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{task.estimatedTime}</span>
                )}
              </div>
              <div className="text-sm font-medium mb-1.5 transition-colors group-hover:text-blue-400" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {task.title}
              </div>
              <div className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{task.description}</div>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <ArrowRight size={10} />
                {task.nextStep.slice(0, 50)}…
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Activity log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
      >
        <div className="section-label mb-4">Analysis Activity</div>
        <div className="space-y-1">
          {dynamicActivity.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-1.5 last:border-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{
                background: entry.type === 'success' ? '#10B981' : entry.type === 'warning' ? '#F59E0B' : entry.type === 'error' ? '#EF4444' : 'rgba(255,255,255,0.2)',
                boxShadow: entry.type === 'success' ? '0 0 4px rgba(16,185,129,0.5)' : 'none',
              }} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono" style={{
                  color: entry.type === 'error' ? '#FC8181' : entry.type === 'warning' ? '#FCD34D' : entry.type === 'success' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
                }}>
                  {entry.message}
                </span>
              </div>
              <span className="text-[10px] font-mono shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>{entry.timestamp}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
