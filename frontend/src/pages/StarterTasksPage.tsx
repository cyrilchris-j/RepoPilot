
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Clock, ArrowRight, Tag } from 'lucide-react';
import { FilePath } from '../components/ui/CodeBlock';
import { DEMO_STARTER_TASKS } from '../lib/demo-data';
import type { StarterTask } from '../types';

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
  const cfg = difficultyConfig[task.difficulty];
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
                    <FilePath path={f} />
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

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
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
  const [expanded, setExpanded] = useState<string | null>(DEMO_STARTER_TASKS[0]?.id);
  const [filter, setFilter] = useState<StarterTask['difficulty'] | 'all'>('all');

  const filtered = filter === 'all'
    ? DEMO_STARTER_TASKS
    : DEMO_STARTER_TASKS.filter(t => t.difficulty === filter);

  const grouped: Record<StarterTask['difficulty'], StarterTask[]> = {
    beginner:     DEMO_STARTER_TASKS.filter(t => t.difficulty === 'beginner'),
    intermediate: DEMO_STARTER_TASKS.filter(t => t.difficulty === 'intermediate'),
    advanced:     DEMO_STARTER_TASKS.filter(t => t.difficulty === 'advanced'),
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
