import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, GitBranch, Plus, X, Loader2, History, ExternalLink } from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { getApiUrl } from '../lib/api';

const RECENTS_KEY = 'repopilot_recent_repos';
const MAX_RECENTS = 5;

function getRecents(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function addRecent(url: string) {
  const list = getRecents().filter(u => u !== url);
  list.unshift(url);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
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
  const { setRepoUrl, setRepoData } = useRepo();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
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

  const handleAnalyze = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setAnalyzing(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.repository) {
        throw new Error(data.error || data.details || 'Analysis failed');
      }

      setRepoUrl(trimmed);
      setRepoData(data);
      addRecent(trimmed);
      setRecents(getRecents());
      setOpen(false);
      setInput('');
      navigate('/analyzing', { state: { repoUrl: trimmed } });
    } catch (err: any) {
      setError(err.message || 'Could not analyze repository');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSwitch = (url: string) => {
    setInput(url);
    handleAnalyze(url);
  };

  const removeRecent = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = getRecents().filter(u => u !== url);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    setRecents(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze(input);
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all group ${
          open ? 'bg-elevated' : 'hover:bg-elevated'
        }`}
      >
        <GitBranch size={11} className="text-text-secondary shrink-0" />
        <span className="font-mono text-[11px] text-text-secondary truncate flex-1">{branch}</span>
        <ChevronDown
          size={12}
          className={`text-text-secondary shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
            className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden"
            style={{ minWidth: '220px' }}
          >
            {/* Current repo */}
            <div className="px-3 py-2.5 border-b border-border bg-elevated/50">
              <div className="text-[9px] font-mono text-text-secondary tracking-widest mb-1">CURRENT WORKSPACE</div>
              <div className="font-mono text-xs text-accent-cyan truncate">{shortLabel(currentRepo)}</div>
            </div>

            {/* Input — analyze new */}
            <div className="p-2.5 border-b border-border">
              <div className="text-[9px] font-mono text-text-secondary tracking-widest mb-1.5 px-0.5">ANALYZE NEW REPOSITORY</div>
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="github.com/owner/repo"
                  disabled={analyzing}
                  className="flex-1 bg-elevated border border-border rounded px-2.5 py-1.5 text-[11px] font-mono text-text-primary placeholder:text-[#374151] focus:outline-none focus:border-accent-cyan/40 transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => handleAnalyze(input)}
                  disabled={!input.trim() || analyzing}
                  className="p-1.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {analyzing ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Plus size={13} />
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-1.5 text-[10px] font-mono text-error leading-snug px-0.5">{error}</div>
              )}
              {analyzing && (
                <div className="mt-1.5 text-[10px] font-mono text-accent-cyan px-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-accent-cyan animate-pulse" />
                  Cloning &amp; analyzing...
                </div>
              )}
            </div>

            {/* Recent repos */}
            {recents.length > 0 && (
              <div className="py-1">
                <div className="text-[9px] font-mono text-text-secondary tracking-widest px-3 py-1.5">RECENT WORKSPACES</div>
                {recents.map(url => (
                  <button
                    key={url}
                    onClick={() => handleSwitch(url)}
                    disabled={analyzing}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-elevated transition-colors group/item disabled:opacity-40"
                  >
                    <History size={11} className="text-text-secondary shrink-0" />
                    <span className="flex-1 font-mono text-[11px] text-text-secondary group-hover/item:text-text-primary truncate transition-colors">
                      {shortLabel(url)}
                    </span>
                    <button
                      onClick={(e) => removeRecent(url, e)}
                      className="shrink-0 opacity-0 group-hover/item:opacity-100 p-0.5 rounded hover:text-text-primary text-text-secondary transition-all"
                    >
                      <X size={10} />
                    </button>
                  </button>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border bg-elevated/30">
              <a
                href="/"
                className="flex items-center gap-1.5 text-[10px] font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                <ExternalLink size={10} />
                Back to landing page
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
