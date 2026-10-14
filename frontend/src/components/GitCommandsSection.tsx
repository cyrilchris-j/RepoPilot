import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  GitBranch,
  GitCommit,
  Copy,
  Check,
  FolderGit2,
  Layers,
} from 'lucide-react';

interface GitCommand {
  id: string;
  category: 'setup' | 'branching' | 'inspect' | 'stash';
  title: string;
  description: string;
  command: string;
  tag: string;
  recommended?: boolean;
}

interface GitCommandsSectionProps {
  repoUrl?: string;
  repoName?: string;
  branch?: string;
  topHotspotFile?: string;
}

export function GitCommandsSection({
  repoUrl = 'https://github.com/cyrilchris-j/RepoPilot.git',
  repoName = 'RepoPilot',
  branch = 'main',
  topHotspotFile,
}: GitCommandsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'setup' | 'branching' | 'inspect' | 'stash'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cleanUrl = repoUrl.startsWith('http')
    ? repoUrl
    : `https://github.com/${repoUrl}.git`;

  const commands: GitCommand[] = [
    {
      id: 'clone',
      category: 'setup',
      title: 'Clone Repository',
      description: 'Clone the entire repository with full history into your local workspace.',
      command: `git clone ${cleanUrl}`,
      tag: 'CLONE',
      recommended: true,
    },
    {
      id: 'clone-shallow',
      category: 'setup',
      title: 'Fast Shallow Clone',
      description: 'Fetch only the latest commit for faster setup on slow connections.',
      command: `git clone --depth 1 ${cleanUrl}`,
      tag: 'PERFORMANCE',
    },
    {
      id: 'submodules',
      category: 'setup',
      title: 'Initialize Submodules',
      description: 'Fetch and initialize any nested submodule repositories recursively.',
      command: 'git submodule update --init --recursive',
      tag: 'SUBMODULES',
    },
    {
      id: 'branch-new',
      category: 'branching',
      title: 'Create & Switch to Feature Branch',
      description: 'Isolate changes on a clean new branch off the latest main.',
      command: `git checkout -b feature/new-contribution`,
      tag: 'BRANCH',
      recommended: true,
    },
    {
      id: 'pull-rebase',
      category: 'branching',
      title: 'Sync & Rebase with Upstream',
      description: `Pull latest changes from ${branch} without creating redundant merge commits.`,
      command: `git pull origin ${branch} --rebase`,
      tag: 'SYNC',
      recommended: true,
    },
    {
      id: 'fetch-prune',
      category: 'branching',
      title: 'Prune Deleted Remote Branches',
      description: 'Clean up local references to branches that were merged and removed on GitHub.',
      command: 'git fetch origin --prune',
      tag: 'MAINTENANCE',
    },
    {
      id: 'status-short',
      category: 'inspect',
      title: 'Concise Working Status',
      description: 'Display branch tracking info and staged/unstaged changes in compact format.',
      command: 'git status -sb',
      tag: 'STATUS',
    },
    {
      id: 'log-graph',
      category: 'inspect',
      title: 'Visual Commit History Graph',
      description: 'Display a formatted ASCII graph of recent 10 commits with branch tags.',
      command: 'git log --graph --oneline --decorate -n 10',
      tag: 'LOG',
      recommended: true,
    },
    {
      id: 'diff-summary',
      category: 'inspect',
      title: 'Inspect Diff Statistics',
      description: 'Summarize lines added and deleted across modified files before committing.',
      command: 'git diff --stat',
      tag: 'DIFF',
    },
    ...(topHotspotFile
      ? [
          {
            id: 'log-hotspot',
            category: 'inspect' as const,
            title: 'Examine High-Churn File Diffs',
            description: `Inspect recent commits that modified the detected code hotspot: ${topHotspotFile}`,
            command: `git log -p -2 "${topHotspotFile}"`,
            tag: 'HOTSPOT',
            recommended: true,
          },
        ]
      : []),
    {
      id: 'stash-wip',
      category: 'stash',
      title: 'Safely Stash Working Changes',
      description: 'Save current uncommitted code before switching branches or syncing.',
      command: 'git stash push -m "WIP: save uncommitted changes"',
      tag: 'STASH',
    },
    {
      id: 'stash-pop',
      category: 'stash',
      title: 'Restore Stashed Work',
      description: 'Reapply the most recently stashed changes onto your working tree.',
      command: 'git stash pop',
      tag: 'RESTORE',
    },
    {
      id: 'discard-unstaged',
      category: 'stash',
      title: 'Discard All Unstaged Changes',
      description: 'Revert uncommitted modifications across the working tree.',
      command: 'git restore .',
      tag: 'CLEANUP',
    },
  ];

  const filtered = selectedCategory === 'all'
    ? commands
    : commands.filter(c => c.category === selectedCategory);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(current => (current === id ? null : current));
    }, 1800);
  };

  const copyAllEssential = () => {
    const essential = [
      `git clone ${cleanUrl}`,
      `cd ${repoName}`,
      `git checkout -b feature/onboarding-setup`,
      `git pull origin ${branch} --rebase`,
    ].join(' && \\\n');
    handleCopy('all-essential', essential);
  };

  return (
    <div className="card p-5 space-y-4 border-border/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
            <FolderGit2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label">GIT COMMANDS &amp; WORKFLOWS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-elevated border border-border text-text-secondary">
                {branch}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Copy-pasteable git commands tailored for this codebase
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyAllEssential}
          className="btn-secondary px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          title="Copy clone, checkout, and sync chain"
        >
          {copiedId === 'all-essential' ? (
            <>
              <Check size={12} className="text-success" />
              <span className="text-success font-semibold">Workflow Chain Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy Quickstart Chain</span>
            </>
          )}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Commands', count: commands.length },
          { key: 'setup', label: 'Clone & Setup', icon: FolderGit2 },
          { key: 'branching', label: 'Branch & Sync', icon: GitBranch },
          { key: 'inspect', label: 'Inspect & Log', icon: GitCommit },
          { key: 'stash', label: 'Stash & Clean', icon: Layers },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key as any)}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === tab.key
                ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-medium'
                : 'bg-elevated/60 text-text-secondary hover:text-text-primary hover:bg-elevated border border-border/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(cmd => {
            const isCopied = copiedId === cmd.id;
            return (
              <motion.div
                key={cmd.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between p-3.5 rounded-lg bg-elevated/40 hover:bg-elevated/80 border border-border/70 hover:border-accent-cyan/30 transition-all duration-150"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Terminal size={13} className="text-accent-cyan shrink-0" />
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {cmd.title}
                      </span>
                      {cmd.recommended && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shrink-0">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-text-secondary uppercase px-1.5 py-0.5 rounded bg-surface border border-border/60 shrink-0">
                      {cmd.tag}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed mb-2.5">
                    {cmd.description}
                  </p>
                </div>

                {/* Command Code snippet with Copy button */}
                <div className="flex items-center justify-between gap-2 bg-bg/95 border border-border/80 rounded-md px-2.5 py-2 font-mono text-xs">
                  <span className="text-text-primary truncate select-all">
                    {cmd.command}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cmd.id, cmd.command)}
                    className="p-1 rounded hover:bg-elevated text-text-secondary hover:text-accent-cyan transition-colors shrink-0 cursor-pointer"
                    title="Copy command to clipboard"
                  >
                    {isCopied ? (
                      <Check size={13} className="text-success" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
