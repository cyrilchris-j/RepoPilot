import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  GitBranch,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  DEMO_REPO, DEMO_METRICS, DEMO_ACTIVITY,
  DEMO_SETUP_STEPS, DEMO_STARTER_TASKS,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });

  const issues = DEMO_SETUP_STEPS.filter(s => s.status !== 'ok' && s.status !== 'pending');
  const warnings = issues.filter(s => s.status === 'warning');
  const errors = issues.filter(s => s.status === 'error');

  return (
    <div ref={containerRef} className="p-6 max-w-6xl mx-auto space-y-6">
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
            <span className="font-mono text-sm text-text-secondary">{DEMO_REPO.owner}/</span>
            <span className="font-mono text-sm font-semibold text-text-primary">{DEMO_REPO.name}</span>
            <span className="font-mono text-xs text-text-secondary border border-border px-1.5 py-0.5 rounded">
              {DEMO_REPO.branch}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{DEMO_REPO.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-text-secondary flex items-center gap-1">
            <Clock size={11} />
            Analyzed just now
          </div>
          <StatusBadge status="complete" />
        </div>
      </motion.div>

      {/* Metrics row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <MetricCard label="Source Files" value={DEMO_METRICS.totalFiles} accent />
        <MetricCard label="Dependencies" value={DEMO_METRICS.dependencies} />
        <MetricCard label="API Routes" value={DEMO_METRICS.routes} />
        <MetricCard label="Modules" value={DEMO_METRICS.modules} />
      </motion.div>

      {/* Architecture preview + issues */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
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
            {[
              { label: 'Client Browser', sub: 'End user', color: 'border-border text-text-secondary' },
              { label: 'Next.js App Router', sub: 'React + TypeScript', color: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5' },
              { label: 'Edge Middleware', sub: 'Edge Runtime', color: 'border-accent-violet/40 text-accent-violet bg-accent-violet/5' },
              { label: 'API Routes + Auth', sub: 'Node.js / NextAuth', color: 'border-warning/40 text-warning bg-warning/5' },
              { label: 'PostgreSQL Database', sub: 'via Prisma ORM', color: 'border-success/40 text-success bg-success/5' },
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="w-full max-w-xs"
              >
                <div className={`border rounded px-4 py-2.5 text-center ${node.color}`}>
                  <div className="text-xs font-semibold">{node.label}</div>
                  <div className="text-[10px] opacity-60 font-mono mt-0.5">{node.sub}</div>
                </div>
                {i < 4 && (
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
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="md:col-span-2 space-y-3"
        >
          {/* Setup health */}
          <div className="card p-5">
            <div className="section-label mb-3">Setup Health</div>
            {DEMO_SETUP_STEPS.slice(0, 4).map((step) => (
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

      {/* Starter tasks preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
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
          {DEMO_STARTER_TASKS.slice(0, 3).map((task) => (
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
        animate={inView ? { opacity: 1, y: 0 } : {}}
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
