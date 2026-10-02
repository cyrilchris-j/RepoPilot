import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Settings,
  GitGraph,
  CheckSquare,
  MessageSquareCode,
  Bug,
  FileCode,
  Download,
  Copy,
  Check,
  CornerDownLeft,
  Terminal,
  GitBranch,
  GitCommit,
  GitPullRequest,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { useCodeViewer } from '../lib/CodeViewerContext';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Git Commands' | 'Files' | 'Tasks';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onTriggerExport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTriggerExport?: () => void;
}) {
  const navigate = useNavigate();
  const { repoData, repoUrl } = useRepo();
  const { openFile } = useCodeViewer();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedCmdId, setCopiedCmdId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const copyCmd = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmdId(id);
    setTimeout(() => {
      setCopiedCmdId(null);
      onClose();
    }, 700);
  };

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Dashboard Overview',
        subtitle: 'Metrics, component health & summary',
        icon: LayoutDashboard,
        badge: 'Page',
        action: () => {
          navigate('/app/dashboard');
          onClose();
        },
      },
      {
        id: 'nav-improvements',
        category: 'Navigation',
        title: 'Improvement Lab & Component Ideas',
        subtitle: 'Architectural optimizations, drop-in recipes & CLI merger',
        icon: Sparkles,
        badge: 'New',
        action: () => {
          navigate('/app/improvements');
          onClose();
        },
      },
      {
        id: 'nav-setup',
        category: 'Navigation',
        title: 'Environment & Prerequisites',
        subtitle: 'Live toolchain diagnostics & .env generator',
        icon: Settings,
        badge: 'Page',
        action: () => {
          navigate('/app/setup');
          onClose();
        },
      },
      {
        id: 'nav-arch',
        category: 'Navigation',
        title: 'Architecture & Dependencies',
        subtitle: 'Interactive module and service topology',
        icon: GitGraph,
        badge: 'Page',
        action: () => {
          navigate('/app/architecture');
          onClose();
        },
      },
      {
        id: 'nav-tasks',
        category: 'Navigation',
        title: 'Starter Tasks & First Issues',
        subtitle: 'Guided beginner assignments with test files',
        icon: CheckSquare,
        badge: 'Page',
        action: () => {
          navigate('/app/tasks');
          onClose();
        },
      },
      {
        id: 'nav-ask',
        category: 'Navigation',
        title: 'AI Codebase Assistant (Q&A)',
        subtitle: 'Ask questions about files, routes & logic',
        icon: MessageSquareCode,
        badge: 'Page',
        action: () => {
          navigate('/app/ask');
          onClose();
        },
      },
      {
        id: 'nav-debug',
        category: 'Navigation',
        title: 'AI Debugger & Error Diagnosis',
        subtitle: 'Analyze stack traces and runtime failures',
        icon: Bug,
        badge: 'Page',
        action: () => {
          navigate('/app/debug');
          onClose();
        },
      },

      // Actions
      {
        id: 'act-export',
        category: 'Actions',
        title: 'Export Onboarding Handbook (ONBOARDING.md)',
        subtitle: 'Generate complete offline developer documentation',
        icon: Download,
        badge: 'Action',
        action: () => {
          onClose();
          if (onTriggerExport) {
            onTriggerExport();
          }
        },
      },
      {
        id: 'act-repopilot-improve',
        category: 'Actions',
        title: 'Run RepoPilot Improvement CLI',
        subtitle: `npx repopilot@latest improve ${repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git'}`,
        icon: copiedCmdId === 'act-repopilot-improve' ? Check : Sparkles,
        badge: copiedCmdId === 'act-repopilot-improve' ? 'Copied!' : 'CLI',
        action: () => {
          const url = repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git';
          copyCmd('act-repopilot-improve', `npx repopilot@latest improve ${url}`);
        },
      },
      {
        id: 'act-clone',
        category: 'Actions',
        title: 'Copy Git Clone Command',
        subtitle: repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git',
        icon: copiedClone ? Check : Copy,
        badge: copiedClone ? 'Copied!' : 'Action',
        action: () => {
          const url = repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git';
          navigator.clipboard.writeText(`git clone ${url}`);
          setCopiedClone(true);
          setTimeout(() => {
            setCopiedClone(false);
            onClose();
          }, 800);
        },
      },

      // Git Commands
      {
        id: 'git-cmd-clone',
        category: 'Git Commands',
        title: 'git clone <url>',
        subtitle: `Clone ${repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git'}`,
        icon: copiedCmdId === 'git-cmd-clone' ? Check : FolderGit2,
        badge: copiedCmdId === 'git-cmd-clone' ? 'Copied!' : 'Git',
        action: () => {
          const url = repoUrl || 'https://github.com/cyrilchris-j/RepoPilot.git';
          copyCmd('git-cmd-clone', `git clone ${url}`);
        },
      },
      {
        id: 'git-cmd-branch',
        category: 'Git Commands',
        title: 'git checkout -b feature/<name>',
        subtitle: 'Create and switch to a new feature branch',
        icon: copiedCmdId === 'git-cmd-branch' ? Check : GitBranch,
        badge: copiedCmdId === 'git-cmd-branch' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-branch', 'git checkout -b feature/your-feature-name');
        },
      },
      {
        id: 'git-cmd-pull',
        category: 'Git Commands',
        title: `git pull origin ${repoData?.repository?.branch || 'main'} --rebase`,
        subtitle: `Pull latest upstream commits on ${repoData?.repository?.branch || 'main'} with rebase`,
        icon: copiedCmdId === 'git-cmd-pull' ? Check : GitPullRequest,
        badge: copiedCmdId === 'git-cmd-pull' ? 'Copied!' : 'Git',
        action: () => {
          const branch = repoData?.repository?.branch || 'main';
          copyCmd('git-cmd-pull', `git pull origin ${branch} --rebase`);
        },
      },
      {
        id: 'git-cmd-status',
        category: 'Git Commands',
        title: 'git status -sb',
        subtitle: 'Short status showing current branch and modified files',
        icon: copiedCmdId === 'git-cmd-status' ? Check : Terminal,
        badge: copiedCmdId === 'git-cmd-status' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-status', 'git status -sb');
        },
      },
      {
        id: 'git-cmd-log',
        category: 'Git Commands',
        title: 'git log --graph --oneline --decorate -n 10',
        subtitle: 'Visual ASCII commit graph for recent repository history',
        icon: copiedCmdId === 'git-cmd-log' ? Check : GitCommit,
        badge: copiedCmdId === 'git-cmd-log' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-log', 'git log --graph --oneline --decorate -n 10');
        },
      },
      {
        id: 'git-cmd-diff',
        category: 'Git Commands',
        title: 'git diff --stat',
        subtitle: 'Summary of modified files and inserted/deleted line counts',
        icon: copiedCmdId === 'git-cmd-diff' ? Check : Terminal,
        badge: copiedCmdId === 'git-cmd-diff' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-diff', 'git diff --stat');
        },
      },
      {
        id: 'git-cmd-stash',
        category: 'Git Commands',
        title: 'git stash push -m "WIP"',
        subtitle: 'Safely stash working changes before switching branches',
        icon: copiedCmdId === 'git-cmd-stash' ? Check : Terminal,
        badge: copiedCmdId === 'git-cmd-stash' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-stash', 'git stash push -m "WIP: save local changes"');
        },
      },
      {
        id: 'git-cmd-stash-pop',
        category: 'Git Commands',
        title: 'git stash pop',
        subtitle: 'Reapply the most recently stashed uncommitted changes',
        icon: copiedCmdId === 'git-cmd-stash-pop' ? Check : Terminal,
        badge: copiedCmdId === 'git-cmd-stash-pop' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-stash-pop', 'git stash pop');
        },
      },
      {
        id: 'git-cmd-fetch-prune',
        category: 'Git Commands',
        title: 'git fetch origin --prune',
        subtitle: 'Fetch remote updates and clean up deleted remote branches',
        icon: copiedCmdId === 'git-cmd-fetch-prune' ? Check : Terminal,
        badge: copiedCmdId === 'git-cmd-fetch-prune' ? 'Copied!' : 'Git',
        action: () => {
          copyCmd('git-cmd-fetch-prune', 'git fetch origin --prune');
        },
      },
    ];

    // Files from architecture nodes or common repo files
    const archNodes = repoData?.architectureNodes || [];
    const filePathsSeen = new Set<string>();

    for (const node of archNodes) {
      const filePath = node.filePath;
      if (filePath && !filePathsSeen.has(filePath)) {
        filePathsSeen.add(filePath);
        list.push({
          id: `file-${filePath}`,
          category: 'Files',
          title: filePath,
          subtitle: `Component: ${node.label} (${node.type})`,
          icon: FileCode,
          badge: 'View Code',
          action: () => {
            onClose();
            openFile(filePath);
          },
        });
      }
    }

    // Common standard files if not already present
    const standardFiles = ['package.json', 'README.md', 'tsconfig.json', '.env.example'];
    for (const sf of standardFiles) {
      if (!filePathsSeen.has(sf)) {
        filePathsSeen.add(sf);
        list.push({
          id: `file-${sf}`,
          category: 'Files',
          title: sf,
          subtitle: 'Repository configuration & documentation',
          icon: FileCode,
          badge: 'View Code',
          action: () => {
            onClose();
            openFile(sf);
          },
        });
      }
    }

    // Starter Tasks
    const tasks = repoData?.starterTasks || [];
    for (const task of tasks) {
      list.push({
        id: `task-${task.id}`,
        category: 'Tasks',
        title: task.title,
        subtitle: `${task.difficulty.toUpperCase()}${task.estimatedTime ? ` • ${task.estimatedTime}` : ''}`,
        icon: CheckSquare,
        badge: task.difficulty,
        action: () => {
          navigate('/app/tasks');
          onClose();
        },
      });
    }

    return list;
  }, [repoData, repoUrl, navigate, onClose, openFile, onTriggerExport, copiedClone, copiedCmdId]);

  // Filter items by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-surface border border-border/80 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border/80 gap-3 bg-elevated/40">
              <Search size={18} className="text-accent-cyan shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search files, git commands, actions, tasks..."
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none font-mono"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-text-secondary bg-surface border border-border px-1.5 py-0.5 rounded shadow-sm">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 divide-y divide-border/20 space-y-1"
            >
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-text-secondary text-sm">
                  <p>No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-text-secondary/70 mt-1">
                    Try searching for pages, file paths, or commands
                  </p>
                </div>
              ) : (
                (() => {
                  let lastCategory = '';
                  return filtered.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    const showCategory = item.category !== lastCategory;
                    lastCategory = item.category;
                    const Icon = item.icon;

                    return (
                      <div key={item.id}>
                        {showCategory && (
                          <div className="px-3 pt-2 pb-1 text-[10px] font-mono tracking-widest uppercase text-text-secondary/70">
                            {item.category}
                          </div>
                        )}
                        <button
                          type="button"
                          data-active={isSelected ? 'true' : 'false'}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                            isSelected
                              ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-text-primary'
                              : 'hover:bg-elevated/50 text-text-secondary border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-1.5 rounded ${
                                isSelected
                                  ? 'bg-accent-cyan/20 text-accent-cyan'
                                  : 'bg-elevated text-text-secondary'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="min-w-0">
                              <div
                                className={`text-xs font-medium truncate ${
                                  isSelected ? 'text-accent-cyan font-semibold' : 'text-text-primary'
                                }`}
                              >
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-text-secondary truncate mt-0.5">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border/80 text-text-secondary">
                                {item.badge}
                              </span>
                            )}
                            {isSelected && (
                              <CornerDownLeft size={12} className="text-accent-cyan" />
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer keyboard shortcuts hint */}
            <div className="px-4 py-2 bg-elevated/60 border-t border-border/60 flex items-center justify-between text-[11px] text-text-secondary font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 bg-surface border border-border rounded text-[10px]">↑</kbd>
                  <kbd className="px-1 bg-surface border border-border rounded text-[10px]">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 bg-surface border border-border rounded text-[10px]">↵</kbd>
                  <span>select</span>
                </span>
              </div>
              <span className="hidden sm:inline text-text-secondary/70">
                RepoPilot Command Palette
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
