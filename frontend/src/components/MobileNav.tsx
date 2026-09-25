import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Settings,
  Package,
  Bug,
  MessageCircle,
  Compass,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBadge } from './ui/StatusBadge';

const navItems = [
  { id: 'overview',      label: 'Overview',       icon: <LayoutDashboard size={18} />, path: '/app' },
  { id: 'architecture',  label: 'Architecture',   icon: <GitBranch size={18} />,       path: '/app/architecture' },
  { id: 'setup',         label: 'Setup',           icon: <Settings size={18} />,        path: '/app/setup' },
  { id: 'dependencies',  label: 'Dependencies',   icon: <Package size={18} />,         path: '/app/dependencies' },
  { id: 'debug',         label: 'Debug Agent',    icon: <Bug size={18} />,             path: '/app/debug' },
  { id: 'ask',           label: 'Ask Codebase',   icon: <MessageCircle size={18} />,   path: '/app/ask' },
  { id: 'tasks',         label: 'Starter Tasks',  icon: <Compass size={18} />,         path: '/app/tasks' },
];

interface MobileNavProps {
  repoName: string;
  analysisStatus: 'analyzing' | 'complete' | 'error';
}

export function MobileNav({ repoName, analysisStatus }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="2" fill="#67E8F9" />
              <path d="M7 2v3M7 9v3M2 7h3M9 7h3" stroke="#67E8F9" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold">RepoPilot</span>
        </Link>
        <div className="flex items-center gap-2">
          <StatusBadge status={analysisStatus === 'complete' ? 'complete' : analysisStatus} size="sm" />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Slide-over menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <div>
                  <div className="font-mono text-sm text-text-primary truncate">{repoName}</div>
                  <div className="text-[10px] text-text-secondary font-mono mt-0.5">Repository Workspace</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded text-text-secondary hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>
              <nav className="flex-1 px-2 py-3 overflow-y-auto">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/app' && location.pathname.startsWith(item.path));
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded text-sm transition-colors ${
                            isActive
                              ? 'bg-accent-cyan/10 text-accent-cyan'
                              : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                          }`}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="px-4 py-3 border-t border-border">
                <Link to="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm transition-colors">
                  <ChevronLeft size={14} />
                  Back to home
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
