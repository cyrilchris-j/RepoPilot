import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Package,
  Bug,
  MessageCircle,
  Compass,
  Search,
  Sparkles,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { RepoSwitcher } from './RepoSwitcher';
import { OnboardingExportButton } from './OnboardingExportButton';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  badgeColor?: string;
}

const navItems: NavItem[] = [
  { id: 'overview',     label: 'Overview',        icon: <LayoutDashboard size={15} />, path: '/app' },
  { id: 'summary',      label: 'Project Summary', icon: <BookOpen size={15} />,        path: '/app/summary',      badge: 'FLOW',  badgeColor: 'cyan' },
  { id: 'ask',          label: 'Ask Codebase',    icon: <MessageCircle size={15} />,   path: '/app/ask',          badge: 'AI',    badgeColor: 'blue' },
  { id: 'architecture', label: 'Architecture',    icon: <GitBranch size={15} />,       path: '/app/architecture' },
  { id: 'setup',        label: 'Setup',           icon: <Settings size={15} />,        path: '/app/setup' },
  { id: 'dependencies', label: 'Dependencies',    icon: <Package size={15} />,         path: '/app/dependencies' },
  { id: 'debug',        label: 'Debug Agent',     icon: <Bug size={15} />,             path: '/app/debug' },
  { id: 'tasks',        label: 'Starter Tasks',   icon: <Compass size={15} />,         path: '/app/tasks' },
  { id: 'improvements', label: 'Improvements',   icon: <Sparkles size={15} />,        path: '/app/improvements', badge: 'IDEAS', badgeColor: 'violet' },
];

const badgeStyles: Record<string, string> = {
  cyan:   'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  blue:   'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  violet: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
};

interface AppSidebarProps {
  repoName: string;
  repoBranch: string;
  analysisStatus: 'analyzing' | 'complete' | 'error';
  repoUrl?: string;
  onOpenCommandPalette?: () => void;
}

export function AppSidebar({
  repoName,
  repoBranch,
  analysisStatus,
  repoUrl = '',
  onOpenCommandPalette,
}: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className="w-58 shrink-0 flex flex-col h-full relative"
      style={{
        width: '232px',
        background: 'rgba(6, 9, 14, 0.88)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
              boxShadow: '0 4px 12px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Cpu size={15} className="text-white relative z-10" />
          </div>
          <div>
            <span className="text-sm font-semibold text-white tracking-tight block leading-none">RepoPilot</span>
            <span className="text-[10px] text-blue-400/70 font-mono mt-0.5 block">AI Workspace</span>
          </div>
        </Link>
      </div>

      {/* Quick Search */}
      <div className="px-3 py-2.5 border-b border-white/[0.04]">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          title="Open Command Palette (⌘K)"
        >
          <div className="flex items-center gap-2">
            <Search size={12} className="text-white/30 group-hover:text-blue-400 transition-colors" />
            <span className="text-white/30 group-hover:text-white/60 transition-colors">Jump to...</span>
          </div>
          <kbd
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md text-white/25"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Repo identity */}
      <div className="px-4 py-3 border-b border-white/[0.04]">
        <div className="text-[9px] font-mono text-white/25 tracking-widest uppercase mb-2">Repository</div>
        <div className="font-mono text-xs text-white/80 truncate mb-2 font-medium">{repoName}</div>
        <RepoSwitcher currentRepo={repoUrl || repoName} branch={repoBranch} />
        <div className="mt-2">
          <StatusBadge status={analysisStatus === 'complete' ? 'complete' : analysisStatus} size="sm" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase px-2 mb-2">Workspace</div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 group relative ${
                    isActive ? 'text-white' : 'text-white/40 hover:text-white/75'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'rgba(59,130,246,0.12)',
                          border: '1px solid rgba(59,130,246,0.18)',
                          boxShadow: '0 0 16px rgba(59,130,246,0.06)',
                        }
                      : { border: '1px solid transparent' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = '';
                      (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                    }
                  }}
                >
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-white/30 group-hover:text-white/60'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-[13px] font-medium flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md uppercase font-semibold ${badgeStyles[item.badgeColor || 'blue']}`}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        style={{ boxShadow: '0 0 6px rgba(59,130,246,0.8)' }}
                      />
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Export section */}
        <div className="mt-4 pt-3 border-t border-white/[0.04] px-0">
          <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase px-2 mb-2">Export</div>
          <OnboardingExportButton variant="sidebar" />
        </div>
      </nav>

      {/* System status */}
      <div
        className="px-4 py-3 border-t border-white/[0.04]"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono text-white/20 tracking-widest uppercase">System</span>
          <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 4px rgba(16,185,129,0.8)' }} />
            ONLINE
          </span>
        </div>
        <div className="text-[10px] font-mono text-white/20">Powered by IBM watsonx.ai</div>
      </div>
    </aside>
  );
}
