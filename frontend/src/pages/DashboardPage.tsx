import { useState, useRef } from 'react';
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
  Sparkles,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OnboardingExportButton } from '../components/OnboardingExportButton';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { GitCommandsSection } from '../components/GitCommandsSection';
import {
  DEMO_REPO, DEMO_METRICS, DEMO_ACTIVITY,
  DEMO_SETUP_STEPS, DEMO_STARTER_TASKS,
  DEMO_GIT_INSIGHTS,
} from '../lib/demo-data';

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
    <div className={`card p-4 ${accent ? 'border-accent-cyan/20' : ''}`}>
      <div className={`text-2xl font-mono font-semibold ${accent ? 'text-accent-cyan' : 'text-text-primary'}`}>
        {typeof value === 'number' ? <Counter target={value} /> : value}
      </div>
      <div className="text-xs font-mono tracking-widest uppercase text-text-secondary mt-1">{label}</div>
      {sub && <div className="text-xs text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [askInput, setAskInput] = useState('');
  const [copiedSpecialCmd, setCopiedSpecialCmd] = useState(false);
  const { repoData, repoUrl } = useRepo();
  const repo = repoData?.repository || (repoUrl ? {
    url: repoUrl,
    name: repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'repository',
    owner: repoUrl.split('/').slice(-2)[0] || 'owner',
    branch: 'main',
    description: repoData?.repository?.description || 'Repository workspace analyzed by RepoPilot',
    status: 'complete' as const,
  } : DEMO_REPO);
  const metrics = repoData?.metrics || DEMO_METRICS;
  const setupSteps = repoData?.setupSteps || DEMO_SETUP_STEPS;
  const starterTasks = repoData?.starterTasks || DEMO_STARTER_TASKS;
  const gitInsights = repoData?.gitInsights || DEMO_GIT_INSIGHTS;

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
        { label: 'Client Browser', sub: 'End user', color: 'border-border text-text-secondary' },
        { label: 'Next.js App Router', sub: 'React + TypeScript', color: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5' },
        { label: 'Edge Middleware', sub: 'Edge Runtime', color: 'border-accent-violet/40 text-accent-violet bg-accent-violet/5' },
        { label: 'API Routes + Auth', sub: 'Node.js / NextAuth', color: 'border-warning/40 text-warning bg-warning/5' },
        { label: 'PostgreSQL Database', sub: 'via Prisma ORM', color: 'border-success/40 text-success bg-success/5' },
      ];

  const issues = setupSteps.filter(s => s.status !== 'ok' && s.status !== 'pending');
  const warnings = issues.filter(s => s.status === 'warning');
  const errors = issues.filter(s => s.status === 'error');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Repository identity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={14} className="text-text-secondary" />
            <span className="font-mono text-sm text-text-secondary">{repo.owner}/</span>
            <span className="font-mono text-sm font-semibold text-text-primary">{repo.name}</span>
            <span className="font-mono text-xs text-text-secondary border border-border px-1.5 py-0.5 rounded">
              {repo.branch}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{repo.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-text-secondary flex items-center gap-1">
            <Clock size={11} />
            Analyzed {repoData ? 'from live repository' : 'demo mode'}
          </div>
          <StatusBadge status="complete" />
          <OnboardingExportButton variant="header" />
        </div>
      </motion.div>

      {/* Ask Codebase Session (Hero Prompt Bar - Primary Interactive Action) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="card p-4 sm:p-5 border-accent-cyan/35 bg-gradient-to-r from-accent-cyan/10 via-surface to-accent-violet/10 relative overflow-hidden shadow-lg shadow-black/20"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shadow-sm shrink-0">
              <MessageSquareCode size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text-primary tracking-tight">ASK YOUR CODEBASE</h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-medium">
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-xs text-text-secondary">
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
          <div className="flex-1 flex items-center gap-2.5 bg-bg/90 border border-border/80 focus-within:border-accent-cyan/70 rounded-lg px-3.5 py-2.5 shadow-inner transition-colors">
            <Search size={15} className="text-accent-cyan shrink-0" />
            <input
              type="text"
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              placeholder="Ask anything (e.g., 'How does authentication work?', 'Where are database models defined?')"
              className="flex-1 bg-transparent text-xs sm:text-sm font-mono text-text-primary placeholder:text-text-secondary/70 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!askInput.trim()}
            className="btn-primary px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            <Send size={13} />
            <span>Ask</span>
          </button>
        </form>

        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-text-secondary flex items-center gap-1">
            <Sparkles size={11} className="text-accent-cyan" /> Try asking:
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
              className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-elevated/70 hover:bg-elevated border border-border/80 hover:border-accent-cyan/50 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer text-left truncate max-w-[260px] sm:max-w-none"
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
        className="card p-4 sm:p-5 border-accent-cyan/30 bg-gradient-to-r from-accent-cyan/10 via-surface to-accent-violet/10 relative overflow-hidden shadow-lg"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 font-semibold flex items-center gap-1">
                <Sparkles size={11} />
                REPOPILOT SPECIAL COMMAND
              </span>
              <span className="text-xs text-text-secondary font-mono">
                Codebase Evolution Engine
              </span>
            </div>
            <h3 className="text-sm font-semibold text-text-primary">
              Improve, Modernize &amp; Merge Components with 1 Command
            </h3>
            <p className="text-xs text-text-secondary max-w-xl">
              Anyone with this repository can run our signature CLI command to automatically audit code, deploy CI/CD pipelines, and merge battle-tested components.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 bg-bg/90 border border-border rounded-lg px-3 py-2 font-mono text-xs text-text-primary shadow-inner">
              <Terminal size={13} className="text-accent-cyan shrink-0" />
              <span className="select-all">npx repopilot@latest improve {repo.url || 'https://github.com/cyrilchris-j/RepoPilot.git'}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`npx repopilot@latest improve ${repo.url || 'https://github.com/cyrilchris-j/RepoPilot.git'}`);
                  setCopiedSpecialCmd(true);
                  setTimeout(() => setCopiedSpecialCmd(false), 1800);
                }}
                className="p-1 rounded hover:bg-elevated text-text-secondary hover:text-accent-cyan transition-colors ml-1 cursor-pointer"
                title="Copy Special Command"
              >
                {copiedSpecialCmd ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
            </div>

            <Link
              to="/app/improvements"
              className="btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <span>Explore Ideas &amp; Components</span>
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
          className="md:col-span-3 card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="section-label mb-0.5">Architecture</div>
              <div className="text-xs text-text-secondary">Detected component relationships</div>
            </div>
            <Link to="/app/architecture" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
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
                <div className={`border rounded px-4 py-2.5 text-center ${node.color}`}>
                  <div className="text-xs font-semibold">{node.label}</div>
                  <div className="text-[10px] opacity-60 font-mono mt-0.5">{node.sub}</div>
                </div>
                {i < miniArchNodes.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-px h-3 bg-border" />
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
          <div className="card p-5">
            <div className="section-label mb-3">Setup Health</div>
            {setupSteps.slice(0, 4).map((step) => (
              <div key={step.id} className="flex items-center gap-2.5 py-1.5 border-b border-border/50 last:border-0">
                {step.status === 'ok' && <CheckCircle size={13} className="text-success shrink-0" />}
                {step.status === 'warning' && <AlertTriangle size={13} className="text-warning shrink-0" />}
                {step.status === 'error' && <XCircle size={13} className="text-error shrink-0" />}
                {step.status === 'pending' && <div className="w-3 h-3 rounded-full border border-border shrink-0" />}
                <span className="text-xs text-text-primary flex-1">{step.label}</span>
                {step.details && <span className="text-[10px] font-mono text-text-secondary truncate max-w-[80px]">{step.details}</span>}
              </div>
            ))}
            <Link to="/app/setup" className="mt-3 flex items-center gap-1 text-xs text-accent-cyan hover:underline">
              View setup guide <ChevronRight size={11} />
            </Link>
          </div>

          {/* Detected issues */}
          <div className="card p-5">
            <div className="section-label mb-3">Detected Issues</div>
            <div className="space-y-2">
              {errors.length > 0 && errors.map(e => (
                <div key={e.id} className="flex items-start gap-2 p-2 rounded bg-error/5 border border-error/20">
                  <XCircle size={12} className="text-error mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-error font-medium">{e.label}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{e.details}</div>
                  </div>
                </div>
              ))}
              {warnings.length > 0 && warnings.map(w => (
                <div key={w.id} className="flex items-start gap-2 p-2 rounded bg-warning/5 border border-warning/20">
                  <AlertTriangle size={12} className="text-warning mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-warning font-medium">{w.label}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{w.details}</div>
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
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-warning shrink-0" />
              <div>
                <div className="section-label mb-0.5">Code Hotspots</div>
                <div className="text-xs text-text-secondary">High-churn files with frequent modifications</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-secondary border border-border px-2 py-0.5 rounded">
              {gitInsights.totalCommits} commits analyzed
            </span>
          </div>

          <div className="space-y-2">
            {gitInsights.hotspots.slice(0, 4).map((spot, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-elevated/40 border border-border/50 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    spot.churnScore === 'high' ? 'bg-error' : spot.churnScore === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                  <span className="font-mono text-text-primary truncate">{spot.path}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[10px] font-mono text-text-secondary">{spot.commits} edits</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                    spot.churnScore === 'high' ? 'text-error border-error/30 bg-error/10' :
                    spot.churnScore === 'medium' ? 'text-warning border-warning/30 bg-warning/10' :
                    'text-success border-success/30 bg-success/10'
                  }`}>
                    {spot.churnScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors & Recent Commits */}
        <div className="card p-5">
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
                  <span className="text-text-primary font-medium">{contrib.name}</span>
                  <span className="text-text-secondary text-[11px]">{contrib.commits} commits ({contrib.percentage}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-cyan"
                    style={{ width: `${contrib.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {gitInsights.recentCommits.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-2 flex items-center gap-1.5">
                <GitCommit size={11} className="text-accent-violet" />
                RECENT REPOSITORY ACTIVITY
              </div>
              <div className="space-y-1.5">
                {gitInsights.recentCommits.slice(0, 2).map((c, i) => (
                  <div key={i} className="flex items-baseline justify-between text-xs font-mono text-text-secondary gap-2">
                    <span className="text-text-primary truncate">{c.message}</span>
                    <span className="text-[10px] shrink-0 text-[#6b7280]">{c.date}</span>
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
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="section-label mb-0.5">Starter Tasks</div>
            <div className="text-xs text-text-secondary">AI-recommended first steps for this repository</div>
          </div>
          <Link to="/app/tasks" className="text-xs text-accent-cyan hover:underline flex items-center gap-1">
            All tasks <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {starterTasks.slice(0, 3).map((task) => (
            <Link to="/app/tasks" key={task.id} className="card-elevated p-4 block hover:border-accent-cyan/30 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <span className={`tag ${
                  task.difficulty === 'beginner' ? 'bg-success/10 text-success' :
                  task.difficulty === 'intermediate' ? 'bg-warning/10 text-warning' :
                  'bg-error/10 text-error'
                }`}>
                  {task.difficulty.toUpperCase()}
                </span>
                {task.estimatedTime && (
                  <span className="text-[10px] font-mono text-text-secondary">{task.estimatedTime}</span>
                )}
              </div>
              <div className="text-sm font-medium text-text-primary mb-1.5 group-hover:text-accent-cyan transition-colors">
                {task.title}
              </div>
              <div className="text-xs text-text-secondary leading-relaxed line-clamp-2">{task.description}</div>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-text-secondary">
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
        className="card p-5"
      >
        <div className="section-label mb-4">Analysis Activity</div>
        <div className="space-y-1">
          {DEMO_ACTIVITY.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 py-1.5 border-b border-border/40 last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                entry.type === 'success' ? 'bg-success' :
                entry.type === 'warning' ? 'bg-warning' :
                entry.type === 'error' ? 'bg-error' : 'bg-text-secondary'
              }`} />
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-mono ${
                  entry.type === 'error' ? 'text-error' :
                  entry.type === 'warning' ? 'text-warning' :
                  entry.type === 'success' ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {entry.message}
                </span>
              </div>
              <span className="text-[10px] font-mono text-text-secondary shrink-0">{entry.timestamp}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
