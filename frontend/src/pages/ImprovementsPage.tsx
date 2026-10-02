import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  Rocket,
  ShieldCheck,
  Zap,
  Code2,
  GitMerge,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  Filter,
} from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { generateDynamicImprovements, type DynamicImprovement } from '../lib/repoAnalyzer';

export function ImprovementsPage() {
  const { repoData, repoUrl } = useRepo();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'components' | 'architecture' | 'deployment' | 'merger'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cliTab, setCliTab] = useState<'npx' | 'docker' | 'github-action' | 'badge'>('npx');

  const repo = repoData?.repository || {
    url: repoUrl || 'https://github.com/cyrilchris-j/airoadgen.git',
    name: repoUrl ? repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'repository' : 'airoadgen',
    owner: repoUrl ? repoUrl.split('/').slice(-2)[0] || 'owner' : 'cyrilchris-j',
    branch: 'main',
    language: 'JavaScript',
  };

  const cleanRepoUrl = repo.url.startsWith('http') ? repo.url : `https://github.com/${repo.url}.git`;
  const cleanRepoName = repo.name;

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(cur => (cur === id ? null : cur));
    }, 1800);
  };

  // Generate 100% genuine dynamic improvements based on real repoData
  const improvements: DynamicImprovement[] = useMemo(() => {
    return generateDynamicImprovements(repoData);
  }, [repoData]);

  useEffect(() => {
    if (improvements.length > 0 && !expandedId) {
      setExpandedId(improvements[0].id);
    }
  }, [improvements, expandedId]);

  const filtered = selectedCategory === 'all'
    ? improvements
    : improvements.filter(i => i.category === selectedCategory);

  const counts = {
    all: improvements.length,
    components: improvements.filter(i => i.category === 'components').length,
    architecture: improvements.filter(i => i.category === 'architecture').length,
    deployment: improvements.filter(i => i.category === 'deployment').length,
    merger: improvements.filter(i => i.category === 'merger').length,
  };

  const signatureCommands = {
    npx: `npx repopilot@latest improve ${cleanRepoUrl}`,
    docker: `docker run --rm -it -v $(pwd):/workspace repopilot/cli:latest improve`,
    'github-action': `uses: cyrilchris-j/repopilot-action@v1\nwith:\n  repo-url: '${cleanRepoUrl}'\n  audit-mode: 'strict'`,
    badge: `[![RepoPilot Analyzed & Optimized](https://img.shields.io/badge/RepoPilot-Analyzed%20%26%20Optimized-67E8F9?logo=github)](${cleanRepoUrl})`,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-semibold flex items-center gap-1.5">
              <Sparkles size={12} />
              REPOPILOT LAB
            </span>
            <span className="text-xs font-mono text-text-secondary">
              Analyzed Codebase Evolution &amp; Component Merger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Architectural Improvements &amp; Component Ideas
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Tailored enhancements detected by analyzing <span className="text-text-primary font-mono font-medium">{cleanRepoName}</span>. Merge battle-tested components, upgrade deployment pipelines, and optimize performance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-text-primary font-semibold">{improvements.length} Improvements</div>
            <div className="text-[10px] font-mono text-success">Automated Recipes Available</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shadow-sm">
            <Rocket size={20} />
          </div>
        </div>
      </motion.div>

      {/* Signature RepoPilot Command Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="card p-5 border-accent-cyan/35 bg-gradient-to-r from-accent-cyan/15 via-surface to-accent-violet/15 relative overflow-hidden shadow-xl shadow-black/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal size={16} className="text-accent-cyan" />
              <h2 className="text-sm font-semibold text-text-primary tracking-tight uppercase">
                RepoPilot Signature CLI Command
              </h2>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40">
                OFFICIAL WORKSPACE RUNNER
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl">
              Anyone with this repository can run this command to inspect, audit, and automatically merge these modern components and architectural patterns directly into their codebase.
            </p>
          </div>

          {/* Quick tab switcher for command formats */}
          <div className="flex items-center gap-1 bg-elevated/80 border border-border/80 p-1 rounded-lg self-start lg:self-auto text-xs font-mono">
            {(['npx', 'github-action', 'docker', 'badge'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setCliTab(tab)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  cliTab === tab
                    ? 'bg-accent-cyan text-bg font-semibold shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'npx' ? 'NPX Command' : tab === 'github-action' ? 'GitHub Action' : tab === 'docker' ? 'Docker' : 'README Badge'}
              </button>
            ))}
          </div>
        </div>

        {/* Command code preview */}
        <div className="flex items-center justify-between gap-3 bg-bg/95 border border-border rounded-lg p-3 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-2 overflow-x-auto select-all text-text-primary">
            <span className="text-accent-cyan font-bold">$</span>
            <pre className="whitespace-pre overflow-x-auto text-text-primary font-mono">
              {signatureCommands[cliTab]}
            </pre>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard('sig-cmd', signatureCommands[cliTab])}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            {copiedId === 'sig-cmd' ? (
              <>
                <Check size={13} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        {/* Pro-tips */}
        <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-text-secondary flex-wrap">
          <span className="flex items-center gap-1 text-accent-cyan">
            <Zap size={11} /> Zero installation required
          </span>
          <span className="flex items-center gap-1 text-success">
            <CheckCircle2 size={11} /> Analyzes local or remote GitHub repositories
          </span>
          <span className="flex items-center gap-1 text-warning">
            <ShieldCheck size={11} /> Generates verifiable, reversible PRs
          </span>
        </div>
      </motion.div>

      {/* Category filter tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Improvements', count: counts.all, icon: Filter },
            { id: 'components', label: 'UI & Component Ideas', count: counts.components, icon: Code2 },
            { id: 'architecture', label: 'Architecture & Perf', count: counts.architecture, icon: Cpu },
            { id: 'deployment', label: 'Deployment & CI/CD', count: counts.deployment, icon: Rocket },
            { id: 'merger', label: 'Component Merger', count: counts.merger, icon: GitMerge },
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 font-medium'
                    : 'bg-surface hover:bg-elevated text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                <Icon size={13} />
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-elevated border border-border text-text-secondary">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-text-secondary">
          Showing <span className="text-text-primary font-medium">{filtered.length}</span> suggestions
        </div>
      </div>

      {/* Improvement items list */}
      <div className="space-y-4">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const isCopied = copiedId === item.id;
          const isCliCopied = copiedId === `cli-${item.id}`;

          return (
            <motion.div
              key={item.id}
              layout
              className={`card overflow-hidden transition-all duration-200 border-border/90 ${
                isExpanded ? 'border-accent-cyan/40 shadow-lg shadow-black/20' : 'hover:border-border'
              }`}
            >
              {/* Main Summary Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-elevated/40 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.category === 'components' ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30' :
                    item.category === 'architecture' ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/30' :
                    item.category === 'deployment' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/10 text-warning border border-amber-500/30'
                  }`}>
                    {item.category === 'components' && <Code2 size={18} />}
                    {item.category === 'architecture' && <Cpu size={18} />}
                    {item.category === 'deployment' && <Rocket size={18} />}
                    {item.category === 'merger' && <GitMerge size={18} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight truncate">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                        item.impact === 'High' ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30' :
                        item.impact === 'Quick Win' ? 'text-success bg-success/10 border-success/30' :
                        'text-warning bg-warning/10 border-warning/30'
                      }`}>
                        {item.impact}
                      </span>
                      <span className="text-[10px] font-mono text-text-secondary border border-border px-1.5 py-0.5 rounded">
                        Est: {item.effort}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.tagline}
                    </p>

                    <div className="mt-2 text-[11px] font-mono text-warning/90 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                      <span>Reason: {item.analyzedReason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-xs font-mono text-accent-cyan flex items-center gap-1">
                    {isExpanded ? 'Collapse' : 'Explore & Apply'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>
              </div>

              {/* Expanded Details Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-border/80 bg-surface/60 p-5 space-y-4"
                  >
                    {/* Benefits & Impact row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {item.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded bg-elevated/50 border border-border/60 text-xs">
                          <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                          <span className="text-text-secondary">{b}</span>
                        </div>
                      ))}
                    </div>

                    {/* Files affected */}
                    {item.targetFiles && item.targetFiles.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-mono text-text-secondary flex-wrap">
                        <span className="text-text-primary font-medium flex items-center gap-1">
                          <FileCode size={13} className="text-accent-cyan" /> Target Files:
                        </span>
                        {item.targetFiles.map(f => (
                          <span key={f} className="px-2 py-0.5 rounded bg-elevated border border-border text-accent-cyan text-[11px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CLI Run snippet */}
                    <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-bg/90 border border-border font-mono text-xs">
                      <div className="flex items-center gap-2 overflow-x-auto min-w-0">
                        <Terminal size={14} className="text-accent-cyan shrink-0" />
                        <span className="text-text-secondary shrink-0">Apply via CLI:</span>
                        <code className="text-accent-cyan truncate">{item.cliCommand}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`cli-${item.id}`, item.cliCommand)}
                        className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {isCliCopied ? (
                          <>
                            <Check size={11} className="text-success" />
                            <span className="text-success font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy CLI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code comparison / Drop-in snippet */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-text-secondary">DROP-IN CODE TEMPLATE:</span>
                          <span className="text-xs font-mono text-text-primary font-semibold">{item.filename}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.id, item.codeSnippet)}
                          className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} />
                              <span>Code Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="rounded-lg bg-bg border border-border/80 overflow-hidden text-xs font-mono">
                        <div className="bg-elevated/90 px-3.5 py-1.5 border-b border-border flex items-center justify-between text-[11px] text-text-secondary">
                          <span>{item.filename}</span>
                          <span>Configuration / Code</span>
                        </div>
                        <pre className="p-4 overflow-x-auto text-text-primary leading-relaxed max-h-72">
                          <code>{item.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
