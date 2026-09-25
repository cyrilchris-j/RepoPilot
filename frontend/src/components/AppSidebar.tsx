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
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} />, path: '/app' },
  { id: 'architecture', label: 'Architecture', icon: <GitBranch size={15} />, path: '/app/architecture' },
  { id: 'setup', label: 'Setup', icon: <Settings size={15} />, path: '/app/setup' },
  { id: 'dependencies', label: 'Dependencies', icon: <Package size={15} />, path: '/app/dependencies' },
  { id: 'debug', label: 'Debug Agent', icon: <Bug size={15} />, path: '/app/debug' },
  { id: 'ask', label: 'Ask Codebase', icon: <MessageCircle size={15} />, path: '/app/ask' },
  { id: 'tasks', label: 'Starter Tasks', icon: <Compass size={15} />, path: '/app/tasks' },
];

interface AppSidebarProps {
  repoName: string;
  repoBranch: string;
  analysisStatus: 'analyzing' | 'complete' | 'error';
}

export function AppSidebar({ repoName, repoBranch, analysisStatus }: AppSidebarProps) {
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

      {/* Repository identity */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-[10px] font-mono text-text-secondary tracking-widest uppercase mb-1.5">Repository</div>
        <div className="font-mono text-xs text-text-primary truncate">{repoName}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <GitBranch size={10} className="text-text-secondary" />
          <span className="font-mono text-[10px] text-text-secondary">{repoBranch}</span>
        </div>
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
                  <span className="flex-1 text-[13px] font-medium">{item.label}</span>
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
      </nav>

      {/* System status */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-text-secondary">SYSTEM</span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-success">
            <span className="w-1 h-1 rounded-full bg-success" />
            ONLINE
          </span>
        </div>
        <div className="mt-1 text-[10px] font-mono text-text-secondary">AI: IBM watsonx.ai</div>
      </div>
    </aside>
  );
}
