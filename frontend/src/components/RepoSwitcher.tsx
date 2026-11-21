import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GitBranch, X, History, ExternalLink, ArrowRight } from 'lucide-react';
import { useRepo } from '../lib/RepoContext';

const RECENTS_KEY = 'repopilot_recent_repos';

function getRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function shortLabel(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\.git$/, '');
}

interface RepoSwitcherProps {
  currentRepo: string;
  branch: string;
}

export function RepoSwitcher({ currentRepo, branch }: RepoSwitcherProps) {
  const navigate = useNavigate();
  const { setRepoUrl } = useRepo();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [recents, setRecents] = useState<string[]>(getRecents);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSwitch = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setRepoUrl(trimmed);
    setOpen(false);
    setInput('');
    navigate('/analyzing', { state: { repoUrl: trimmed } });
  };

  const removeRecent = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = getRecents().filter(u => u !== url);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    setRecents(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSwitch(input);
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all duration-150 cursor-pointer group"
        style={{
          background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <GitBranch size={11} className="text-blue-400/70 shrink-0" />
        <span className="font-mono text-[11px] text-white/60 truncate flex-1 group-hover:text-white/80 transition-colors">
          {branch}
        </span>
        <ChevronDown
          size={12}
          className={`text-white/30 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-white/70' : 'group-hover:text-white/60'}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl overflow-hidden"
            style={{
              minWidth: '240px',
              background: 'rgba(10, 14, 22, 0.95)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 48px -8px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Current repo */}
            <div className="px-3.5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="text-[9px] font-mono text-white/30 tracking-widest uppercase mb-1">Current Workspace</div>
              <div className="font-mono text-xs text-blue-400 font-medium truncate">{shortLabel(currentRepo)}</div>
            </div>

            {/* Input — analyze new */}
            <div className="p-2.5 border-b border-white/[0.06]">
              <div className="text-[9px] font-mono text-white/30 tracking-widest uppercase mb-1.5 px-0.5">Analyze New Repository</div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="github.com/owner/repo"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSwitch(input)}
                  disabled={!input.trim()}
                  className="p-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  title="Switch to repository"
                >
                  <ArrowRight size={13} />
                </button>
              </div>
              {error && (
                <div className="mt-1.5 text-[10px] font-mono text-rose-400 leading-snug px-0.5">{error}</div>
              )}
            </div>

            {/* Recent repos */}
            {recents.length > 0 && (
              <div className="p-1.5">
                <div className="text-[9px] font-mono text-white/30 tracking-widest uppercase px-2 py-1">Recent Workspaces</div>
                <div className="space-y-0.5">
                  {recents.map(url => (
                    <div
                      key={url}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-white/[0.05] transition-colors group/item"
                    >
                      <button
                        type="button"
                        onClick={() => handleSwitch(url)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0 cursor-pointer"
                      >
                        <History size={11} className="text-white/30 shrink-0 group-hover/item:text-blue-400 transition-colors" />
                        <span className="flex-1 font-mono text-[11px] text-white/60 group-hover/item:text-white truncate transition-colors">
                          {shortLabel(url)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => removeRecent(url, e)}
                        title="Remove from recents"
                        className="shrink-0 opacity-0 group-hover/item:opacity-100 p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white transition-all cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-3.5 py-2 border-t border-white/[0.06] bg-black/20">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/70 transition-colors"
              >
                <ExternalLink size={10} />
                Back to landing page
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
