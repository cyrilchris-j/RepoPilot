import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sliders,
  GitGraph,
  CheckSquare,
  MessageSquareCode,
  Bug,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const ACTIONS = [
  {
    title: 'Ask Codebase',
    subtitle: 'Ask questions about routes, logic & design patterns',
    to: '/app/ask',
    icon: MessageSquareCode,
    badge: 'AI Assistant',
    color: 'from-accent-cyan/25 to-blue-500/10 border-accent-cyan/40 text-accent-cyan',
  },
  {
    title: 'Environment & .env',
    subtitle: 'Live toolchain diagnostics & interactive .env generator',
    to: '/app/setup',
    icon: Sliders,
    badge: 'Prerequisites',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    title: 'System Architecture',
    subtitle: 'Interactive component topology & dependency graphs',
    to: '/app/architecture',
    icon: GitGraph,
    badge: 'Topology',
    color: 'from-accent-violet/20 to-purple-500/10 border-accent-violet/30 text-accent-violet',
  },
  {
    title: 'Starter Tasks',
    subtitle: 'Hands-on good first issues with file references',
    to: '/app/tasks',
    icon: CheckSquare,
    badge: 'Onboarding',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-warning',
  },
  {
    title: 'Error Debugger',
    subtitle: 'Root-cause analysis for stack traces & runtime bugs',
    to: '/app/debug',
    icon: Bug,
    badge: 'AI Debug',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
  },
];

export function QuickActionsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="section-label">QUICK WORKSPACE ACTIONS</span>
          <Sparkles size={11} className="text-accent-cyan" />
        </div>
        <span className="text-[11px] font-mono text-text-secondary">
          Click any module to jump directly
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group relative block p-3.5 rounded-lg border bg-surface/80 hover:bg-elevated/70 border-border/80 hover:border-border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Subtle gradient hover wash */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded-md bg-elevated border border-border/60 text-text-primary group-hover:text-accent-cyan transition-colors">
                      <Icon size={15} />
                    </div>
                    <span className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-elevated/80 border border-border/60 text-text-secondary">
                      {action.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-text-primary group-hover:text-accent-cyan transition-colors flex items-center gap-1">
                    {action.title}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </h3>

                  <p className="text-[11px] text-text-secondary mt-1 leading-snug line-clamp-2">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
