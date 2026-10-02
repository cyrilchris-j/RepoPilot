import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Clock,
  ArrowRight,
  Tag,
  Sparkles,
  CheckSquare,
  Square,
  Copy,
  Check,
  Loader2,
  GitPullRequest,
} from 'lucide-react';
import { ClickableFilePath } from '../components/ui/CodeBlock';
import { useRepo } from '../lib/RepoContext';
import { getApiUrl } from '../lib/api';
import type { StarterTask, TaskPlan } from '../types';

const difficultyConfig = {
  beginner:     { label: 'BEGINNER',     color: 'text-success', bg: 'bg-success/10 border-success/30' },
  intermediate: { label: 'INTERMEDIATE', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  advanced:     { label: 'ADVANCED',     color: 'text-error',   bg: 'bg-error/10 border-error/30' },
};

function TaskCard({ task, expanded, onToggle }: {
  task: StarterTask;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { repoUrl } = useRepo();
  const [plan, setPlan] = useState<TaskPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPR, setCopiedPR] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'code' | 'test' | 'pr'>('plan');

  const cfg = difficultyConfig[task.difficulty];

  const handleGeneratePlan = async () => {
    if (plan) return;
    setGenerating(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/task-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          description: task.description,
          relevantFiles: task.relevantFiles,
          repoContext: repoUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNum)) next.delete(stepNum);
      else next.add(stepNum);
      return next;
    });
  };

  const handleCopyCode = async () => {
    if (!plan) return;
    await navigator.clipboard.writeText(plan.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyPR = async () => {
    if (!plan) return;
    const text = `# ${plan.prDraft.title}\n\n${plan.prDraft.body}`;
    await navigator.clipboard.writeText(text);
    setCopiedPR(true);
    setTimeout(() => setCopiedPR(false), 2000);
  };

  return (
    <motion.div
      layout
      className={`card overflow-hidden cursor-pointer transition-all duration-200 ${expanded ? 'border-accent-cyan/30' : 'hover:border-border/80'}`}
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`tag border text-[10px] ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              {task.estimatedTime && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                  <Clock size={9} />
                  {task.estimatedTime}
                </span>
              )}
            </div>
            <h3 className={`text-sm font-semibold ${expanded ? 'text-accent-cyan' : 'text-text-primary'} mb-1`}>
              {task.title}
            </h3>
            <p className={`text-xs text-text-secondary leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {task.description}
            </p>
          </div>
          <div className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ArrowRight size={15} className="text-text-secondary" />
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4 pt-4 border-t border-border/50"
            onClick={e => e.stopPropagation()}
          >
            {/* Why it matters */}
            <div>
              <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1.5">WHY IT MATTERS</div>
              <p className="text-xs text-text-primary leading-relaxed">{task.whyItMatters}</p>
            </div>

            {/* Relevant files */}
            <div>
              <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-2">RELEVANT FILES</div>
              <div className="space-y-1">
                {task.relevantFiles.map(f => (
                  <div key={f} className="py-1">
                    <ClickableFilePath path={f} />
                  </div>
                ))}
              </div>
            </div>

            {/* Next step */}
            <div className="flex items-start gap-2 p-3 rounded bg-accent-cyan/5 border border-accent-cyan/20">
              <ArrowRight size={12} className="text-accent-cyan mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-mono text-accent-cyan tracking-widest mb-1">SUGGESTED NEXT STEP</div>
                <p className="text-xs text-text-primary leading-relaxed">{task.nextStep}</p>
              </div>
            </div>

            {/* AI Implementation Plan & PR Scaffolding */}
            <div className="pt-2">
              {!plan ? (
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={generating}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-accent-cyan/15 to-accent-violet/15 hover:from-accent-cyan/25 hover:to-accent-violet/25 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-medium transition-all shadow-sm"
                >
                  {generating ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-accent-cyan" />
                      <span>Generating PR Plan with watsonx...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-accent-cyan" />
                      <span>Generate Implementation Plan & PR Scaffold</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="rounded-lg border border-accent-cyan/25 bg-surface/80 p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles size={13} className="text-accent-cyan" />
                      <span className="text-xs font-mono font-semibold text-text-primary">Implementation Workspace</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('plan')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${activeTab === 'plan' ? 'bg-accent-cyan/20 text-accent-cyan font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                      >
                        Checklist ({completedSteps.size}/{plan.steps.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('code')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${activeTab === 'code' ? 'bg-accent-cyan/20 text-accent-cyan font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                      >
                        Code Diff
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('pr')}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${activeTab === 'pr' ? 'bg-accent-cyan/20 text-accent-cyan font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                      >
                        PR Draft
                      </button>
                    </div>
                  </div>

                  {/* Checklist tab */}
                  {activeTab === 'plan' && (
                    <div className="space-y-2">
                      <p className="text-xs text-text-secondary leading-snug">{plan.summary}</p>
                      <div className="space-y-1.5 pt-1">
                        {plan.steps.map((s) => {
                          const done = completedSteps.has(s.step);
                          return (
                            <div
                              key={s.step}
                              onClick={() => toggleStep(s.step)}
                              className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition-colors border ${done ? 'bg-success/5 border-success/20 text-text-secondary line-through' : 'bg-elevated/40 border-border/50 text-text-primary hover:border-border'}`}
                            >
                              <div className="mt-0.5 shrink-0 text-accent-cyan">
                                {done ? <CheckSquare size={13} className="text-success" /> : <Square size={13} className="text-text-secondary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium">{s.title}</div>
                                <div className="text-[11px] text-text-secondary leading-relaxed mt-0.5">{s.description}</div>
                                {s.targetFile && (
                                  <div className="mt-1 text-[10px] font-mono text-accent-cyan/80">File: {s.targetFile}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Code Diff tab */}
                  {activeTab === 'code' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-text-secondary">PROPOSED CODE SCAFFOLD</span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 text-[11px] font-mono text-accent-cyan hover:underline"
                        >
                          {copiedCode ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 rounded bg-black/60 border border-border/70 text-xs font-mono text-[#e2e8f0] overflow-x-auto whitespace-pre">
                        {plan.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {/* PR Draft tab */}
                  {activeTab === 'pr' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-text-primary">
                          <GitPullRequest size={12} className="text-accent-violet" />
                          <span>{plan.prDraft.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPR}
                          className="flex items-center gap-1 text-[11px] font-mono text-accent-cyan hover:underline"
                        >
                          {copiedPR ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                          <span>{copiedPR ? 'Copied PR Markdown!' : 'Copy PR'}</span>
                        </button>
                      </div>
                      <pre className="p-3 rounded bg-black/60 border border-border/70 text-xs font-mono text-[#94a3b8] overflow-x-auto whitespace-pre leading-relaxed">
                        {plan.prDraft.body}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {task.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] font-mono text-text-secondary bg-elevated border border-border px-2 py-0.5 rounded">
                    <Tag size={8} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function StarterTasksPage() {
  const { repoData } = useRepo();
  const repoName = repoData?.repository?.name || 'repository';

  const defaultTasks: StarterTask[] = [
    {
      id: 'task-1',
      title: `Explore Entry Point & Architecture in ${repoName}`,
      difficulty: 'beginner',
      description: `Trace the initialization workflow in the primary files of ${repoName} to understand how the application boots.`,
      relevantFiles: ['src/App.jsx', 'package.json', 'README.md'],
      whyItMatters: 'Understanding entry points provides an overview of the request and render pipelines.',
      nextStep: 'Open the main index or App file and inspect root component registrations.',
      estimatedTime: '15 mins',
      tags: ['Architecture', 'Onboarding'],
    },
    {
      id: 'task-2',
      title: 'Verify Build & Config Toolchain',
      difficulty: 'beginner',
      description: 'Validate that package configuration and bundler setup are aligned with latest versions.',
      relevantFiles: ['package.json', 'vite.config.js'],
      whyItMatters: 'Consistent configuration prevents runtime environment mismatches across team members.',
      nextStep: 'Run the development or build command to ensure zero compile warnings.',
      estimatedTime: '20 mins',
      tags: ['Build', 'Config'],
    },
    {
      id: 'task-3',
      title: 'Audit Component & Feature Directory Structure',
      difficulty: 'intermediate',
      description: `Review directory organization in ${repoName} and identify areas for component reuse or modularization.`,
      relevantFiles: ['src'],
      whyItMatters: 'Clean modular organization keeps codebases maintainable as feature complexity grows.',
      nextStep: 'Check subdirectories for shared hooks, components, or helper utilities.',
      estimatedTime: '30 mins',
      tags: ['Refactoring', 'Modules'],
    },
  ];

  const tasks = (repoData?.starterTasks && repoData.starterTasks.length > 0)
    ? repoData.starterTasks
    : defaultTasks;

  const [expanded, setExpanded] = useState<string | null>(tasks[0]?.id || null);
  const [filter, setFilter] = useState<StarterTask['difficulty'] | 'all'>('all');

  const filtered = filter === 'all'
    ? tasks
    : tasks.filter(t => t.difficulty === filter);

  const grouped: Record<StarterTask['difficulty'], StarterTask[]> = {
    beginner:     tasks.filter(t => t.difficulty === 'beginner'),
    intermediate: tasks.filter(t => t.difficulty === 'intermediate'),
    advanced:     tasks.filter(t => t.difficulty === 'advanced'),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Starter Tasks</div>
        <h1 className="text-xl font-semibold text-text-primary">START HERE</h1>
        <p className="text-sm text-text-secondary mt-1">
          AI-generated contribution tasks ranked by difficulty. Each task is derived from analysis of this repository's actual structure.
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {([['beginner', 'BEGINNER', 'text-success', 'border-success/20'],
           ['intermediate', 'INTERMEDIATE', 'text-warning', 'border-warning/20'],
           ['advanced', 'ADVANCED', 'text-error', 'border-error/20']] as const).map(([key, label, color, border]) => (
          <div key={key} className={`card p-4 ${border}`}>
            <div className={`text-2xl font-mono font-semibold ${color}`}>{grouped[key].length}</div>
            <div className="text-xs font-mono tracking-widest text-text-secondary mt-1">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2"
      >
        <Compass size={14} className="text-text-secondary" />
        <div className="flex gap-1.5">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
                filter === f
                  ? 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tasks */}
      <div className="space-y-3">
        {filtered.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <TaskCard
              task={task}
              expanded={expanded === task.id}
              onToggle={() => setExpanded(expanded === task.id ? null : task.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
