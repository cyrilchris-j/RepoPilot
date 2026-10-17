import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal,
  GitGraph,
  ListTodo,
  MessageSquareCode,
  Activity,
  ArrowUpRight,
  GitPullRequest,
  Terminal,
} from 'lucide-react';

const ACTIONS = [
  {
    title: 'Ask Codebase',
    subtitle: 'Ask questions about routes, logic & design patterns',
    to: '/app/ask',
    icon: MessageSquareCode,
    badge: 'AI',
    color: '#22D3EE',
    glow: 'rgba(34,211,238,0.12)',
    bg: 'rgba(34,211,238,0.06)',
    border: 'rgba(34,211,238,0.15)',
  },
  {
    title: 'Environment & .env',
    subtitle: 'Live toolchain diagnostics & interactive .env generator',
    to: '/app/setup',
    icon: SlidersHorizontal,
    badge: 'Setup',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.12)',
    bg: 'rgba(52,211,153,0.06)',
    border: 'rgba(52,211,153,0.15)',
  },
  {
    title: 'System Architecture',
    subtitle: 'Interactive component topology & dependency graphs',
    to: '/app/architecture',
    icon: GitGraph,
    badge: 'Topology',
    color: '#818CF8',
    glow: 'rgba(129,140,248,0.12)',
    bg: 'rgba(129,140,248,0.06)',
    border: 'rgba(129,140,248,0.15)',
  },
  {
    title: 'Starter Tasks',
    subtitle: 'Hands-on good first issues with file references',
    to: '/app/tasks',
    icon: ListTodo,
    badge: 'Begin',
    color: '#FCD34D',
    glow: 'rgba(252,211,77,0.12)',
    bg: 'rgba(252,211,77,0.06)',
    border: 'rgba(252,211,77,0.15)',
  },
  {
    title: 'Error Debugger',
    subtitle: 'Root-cause analysis for stack traces & runtime bugs',
    to: '/app/debug',
    icon: Activity,
    badge: 'Debug',
    color: '#FC8181',
    glow: 'rgba(252,129,129,0.12)',
    bg: 'rgba(252,129,129,0.06)',
    border: 'rgba(252,129,129,0.15)',
  },
  {
    title: 'Feedback & Ideas',
    subtitle: 'Suggest improvements, request features & vote on roadmap',
    to: '/app/improvements',
    icon: GitPullRequest,
    badge: 'Ideas',
    color: '#A78BFA',
    glow: 'rgba(167,139,250,0.12)',
    bg: 'rgba(167,139,250,0.06)',
    border: 'rgba(167,139,250,0.15)',
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
          <Terminal size={11} style={{ color: '#60A5FA' }} />
        </div>
        <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Click any module to jump directly
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="group relative block p-3.5 rounded-2xl transition-all duration-200 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = action.bg;
                el.style.borderColor = action.border;
                el.style.boxShadow = `0 8px 24px ${action.glow}`;
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.025)';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.boxShadow = '';
                el.style.transform = '';
              }}
            >
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="p-1.5 rounded-xl"
                      style={{ background: action.bg, border: `1px solid ${action.border}`, color: action.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className="text-[9px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded-lg"
                      style={{ background: action.bg, border: `1px solid ${action.border}`, color: action.color }}
                    >
                      {action.badge}
                    </span>
                  </div>

                  <h3
                    className="text-xs font-semibold flex items-center gap-1 transition-colors mb-1"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {action.title}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-70 transition-opacity"
                    />
                  </h3>

                  <p className="text-[10px] leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
