import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Package,
  Bug,
  MessageCircle,
  Compass,
  ChevronRight,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { RepoSwitcher } from './RepoSwitcher';
import { OnboardingExportButton } from './OnboardingExportButton';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'overview',      label: 'Overview',      icon: <LayoutDashboard size={15} />, path: '/app' },
  { id: 'improvements',  label: 'Improvements', icon: <Sparkles size={15} />,        path: '/app/improvements' },
  { id: 'ask',           label: 'Ask Codebase',  icon: <MessageCircle size={15} />,   path: '/app/ask' },
  { id: 'architecture',  label: 'Architecture',  icon: <GitBranch size={15} />,       path: '/app/architecture' },
  { id: 'setup',         label: 'Setup',          icon: <Settings size={15} />,        path: '/app/setup' },
  { id: 'dependencies',  label: 'Dependencies',  icon: <Package size={15} />,         path: '/app/dependencies' },
  { id: 'debug',         label: 'Debug Agent',   icon: <Bug size={15} />,             path: '/app/debug' },
  { id: 'tasks',         label: 'Starter Tasks', icon: <Compass size={15} />,         path: '/app/tasks' },
];

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
    <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" fill="#67E8F9" />
              <path d="M7 2v3M7 9v3M2 7h3M9 7h3" stroke="#67E8F9" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M3.5 3.5l2 2M8.5 8.5l2 2M10.5 3.5l-2 2M5.5 8.5l-2 2" stroke="#67E8F9" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">RepoPilot</span>
        </Link>
      </div>

      {/* Quick Search / Command Palette Trigger */}
      <div className="px-3 py-2 border-b border-border/60">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-elevated/70 hover:bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors group"
          title="Open Command Palette (⌘K)"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-text-secondary group-hover:text-accent-cyan transition-colors" />
            <span className="text-[12px]">Jump to...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface border border-border text-text-secondary">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Repository identity + switcher */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase mb-1.5">Repository</div>
        <div className="font-mono text-xs text-text-primary truncate mb-2">{repoName}</div>
        <RepoSwitcher currentRepo={repoUrl || repoName} branch={repoBranch} />
        <div className="mt-2">
          <StatusBadge status={analysisStatus === 'complete' ? 'complete' : analysisStatus} size="sm" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase px-2 mb-2">Workspace</div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-all duration-150 group ${
                    isActive
                      ? 'bg-accent-cyan/10 text-accent-cyan'
                      : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-accent-cyan' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-[13px] font-medium flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.id === 'ask' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 uppercase font-semibold">
                        AI
                      </span>
                    )}
                    {item.id === 'improvements' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-violet/20 text-accent-violet border border-accent-violet/40 uppercase font-semibold">
                        IDEAS
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-accent-cyan"
                    >
                      <ChevronRight size={12} />
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Export section */}
        <div className="mt-4 pt-3 border-t border-border/50 px-0">
          <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase px-2 mb-1.5">Export</div>
          <OnboardingExportButton variant="sidebar" />
        </div>
      </nav>

      {/* System status + Admin */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-text-secondary">SYSTEM</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-success">
            <span className="w-1 h-1 rounded-full bg-success" />
            ONLINE
          </span>
        </div>
        <div className="mt-1 text-[10px] font-mono text-text-secondary">AI: IBM watsonx.ai</div>

        <Link
          to="/admin"
          className="mt-2.5 flex items-center justify-between px-2 py-1.5 rounded-md bg-elevated/60 hover:bg-elevated border border-border/70 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-[11px] font-mono transition-colors group"
          title="Open Admin Dashboard"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-accent-cyan" />
            <span>Admin Center</span>
          </span>
          <ChevronRight size={11} className="text-text-secondary/50 group-hover:text-accent-cyan transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
