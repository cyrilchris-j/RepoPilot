import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Info, ChevronDown } from 'lucide-react';
import { FilePath } from '../components/ui/CodeBlock';
import { DEMO_ARCHITECTURE_NODES } from '../lib/demo-data';
import type { ArchitectureNode } from '../types';

const typeColors: Record<ArchitectureNode['type'], string> = {
  frontend: 'border-accent-cyan/40 bg-accent-cyan/5 text-accent-cyan',
  backend:  'border-accent-violet/40 bg-accent-violet/5 text-accent-violet',
  database: 'border-success/40 bg-success/5 text-success',
  service:  'border-border text-text-secondary',
  external: 'border-border/50 text-text-secondary',
  auth:     'border-warning/40 bg-warning/5 text-warning',
  config:   'border-border text-text-secondary',
};

const typeLabels: Record<ArchitectureNode['type'], string> = {
  frontend: 'Frontend',
  backend:  'Backend',
  database: 'Database',
  service:  'Service',
  external: 'External',
  auth:     'Auth',
  config:   'Config',
};

export function ArchitecturePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const [selected, setSelected] = useState<ArchitectureNode | null>(null);
  const [filter, setFilter] = useState<ArchitectureNode['type'] | 'all'>('all');

  const types = Array.from(new Set(DEMO_ARCHITECTURE_NODES.map(n => n.type)));
  const filtered = filter === 'all' ? DEMO_ARCHITECTURE_NODES : DEMO_ARCHITECTURE_NODES.filter(n => n.type === filter);

  // Vertical flow layout
  const flow = [
    ['client'],
    ['nextjs-frontend'],
    ['middleware', 'build'],
    ['api-routes', 'cdn'],
    ['auth', 'database'],
  ];

  return (
    <div ref={containerRef} className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Architecture</div>
        <h1 className="text-xl font-semibold text-text-primary">Component Relationships</h1>
        <p className="text-sm text-text-secondary mt-1">
          Auto-detected architecture from source analysis. Click any node to inspect details.
        </p>
      </motion.div>

      {/* Type filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setFilter('all')}
          className={`text-xs font-mono px-3 py-1 rounded border transition-all ${filter === 'all' ? 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5' : 'border-border text-text-secondary hover:text-text-primary'}`}
        >
          ALL
        </button>
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs font-mono px-3 py-1 rounded border transition-all ${filter === t ? 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/5' : 'border-border text-text-secondary hover:text-text-primary'}`}
          >
            {typeLabels[t].toUpperCase()}
          </button>
        ))}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Architecture diagram */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="md:col-span-2 card p-6"
        >
          <div className="section-label mb-6">SYSTEM TOPOLOGY</div>
          <div className="flex flex-col items-center gap-0 overflow-x-auto pb-2">
            {flow.map((row, rowIdx) => {
              const nodes = row.map(id => DEMO_ARCHITECTURE_NODES.find(n => n.id === id)).filter(Boolean) as ArchitectureNode[];
              const visibleNodes = filter === 'all' ? nodes : nodes.filter(n => n.type === filter);
              if (visibleNodes.length === 0 && filter !== 'all') return null;
              return (
                <div key={rowIdx} className="flex flex-col items-center w-full">
                  {rowIdx > 0 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={inView ? { scaleY: 1 } : {}}
                      transition={{ delay: 0.2 + rowIdx * 0.08 }}
                      className="w-px h-6 bg-border origin-top"
                    />
                  )}
                  <div className="flex gap-4 justify-center">
                    {(filter === 'all' ? nodes : visibleNodes).map((node) => {
                      const isFiltered = filter !== 'all' && node.type !== filter;
                      return (
                        <motion.button
                          key={node.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={inView ? { opacity: isFiltered ? 0.3 : 1, scale: 1 } : {}}
                          transition={{ delay: 0.25 + rowIdx * 0.08 }}
                          onClick={() => setSelected(selected?.id === node.id ? null : node)}
                          className={`relative px-5 py-3 rounded border text-left transition-all cursor-pointer min-w-[140px] max-w-[180px] ${
                            selected?.id === node.id
                              ? 'border-accent-cyan/60 bg-accent-cyan/10 shadow-lg shadow-accent-cyan/10'
                              : `${typeColors[node.type]} hover:opacity-80`
                          }`}
                        >
                          <div className="text-xs font-semibold truncate">{node.label}</div>
                          {node.technology && (
                            <div className="text-[10px] font-mono opacity-60 mt-0.5 truncate">{node.technology}</div>
                          )}
                          <div className={`text-[9px] font-mono tracking-widest mt-1 opacity-50`}>
                            {typeLabels[node.type].toUpperCase()}
                          </div>
                          {selected?.id === node.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-accent-cyan"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Node detail */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {selected ? (
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`tag mb-2 ${typeColors[selected.type]}`}>
                    {typeLabels[selected.type].toUpperCase()}
                  </div>
                  <div className="text-base font-semibold text-text-primary">{selected.label}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-text-secondary hover:text-text-primary p-1"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {selected.technology && (
                <div className="mb-3">
                  <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1">TECHNOLOGY</div>
                  <div className="text-sm font-mono text-text-primary">{selected.technology}</div>
                </div>
              )}

              {selected.description && (
                <div className="mb-3">
                  <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1">DESCRIPTION</div>
                  <div className="text-sm text-text-secondary leading-relaxed">{selected.description}</div>
                </div>
              )}

              {selected.filePath && (
                <div className="mb-3">
                  <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1">FILE PATH</div>
                  <FilePath path={selected.filePath} />
                </div>
              )}

              {selected.children && selected.children.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1">CONNECTS TO</div>
                  <div className="space-y-1">
                    {selected.children.map(childId => {
                      const child = DEMO_ARCHITECTURE_NODES.find(n => n.id === childId);
                      return child ? (
                        <div key={childId} className="text-xs font-mono text-text-secondary flex items-center gap-1.5">
                          <span className="text-border">→</span>
                          {child.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
              <Info size={20} className="text-text-secondary mb-3" />
              <div className="text-sm text-text-secondary">Click a node to inspect its details</div>
            </div>
          )}

          {/* Node list */}
          <div className="card p-5">
            <div className="section-label mb-3">All Nodes</div>
            <div className="space-y-1">
              {filtered.map(node => (
                <button
                  key={node.id}
                  onClick={() => setSelected(selected?.id === node.id ? null : node)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                    selected?.id === node.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full border ${
                    node.type === 'frontend' ? 'border-accent-cyan bg-accent-cyan/30' :
                    node.type === 'backend' ? 'border-accent-violet bg-accent-violet/30' :
                    node.type === 'database' ? 'border-success bg-success/30' :
                    node.type === 'auth' ? 'border-warning bg-warning/30' : 'border-border'
                  }`} />
                  <span className="text-xs font-medium flex-1 truncate">{node.label}</span>
                  <span className="text-[9px] font-mono tracking-widest opacity-50">{typeLabels[node.type].toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
