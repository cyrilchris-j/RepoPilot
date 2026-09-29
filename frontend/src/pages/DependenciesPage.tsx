import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Trash2, CheckCircle, FileCode, Search } from 'lucide-react';
import { useRepo } from '../lib/RepoContext';
import { useCodeViewer } from '../lib/CodeViewerContext';
import { DEMO_DEPENDENCIES } from '../lib/demo-data';

const statusConfig = {
  ok:         { label: 'UP TO DATE',  color: 'text-success',        bg: 'bg-success/10',         border: 'border-success/20',   icon: <CheckCircle size={13} className="text-success" /> },
  outdated:   { label: 'OUTDATED',    color: 'text-warning',        bg: 'bg-warning/10',         border: 'border-warning/20',   icon: <AlertTriangle size={13} className="text-warning" /> },
  vulnerable: { label: 'VULNERABLE',  color: 'text-error',          bg: 'bg-error/10',           border: 'border-error/20',     icon: <ShieldAlert size={13} className="text-error" /> },
  unused:     { label: 'UNUSED',      color: 'text-text-secondary', bg: 'bg-elevated',           border: 'border-border',       icon: <Trash2 size={13} className="text-text-secondary" /> },
};

export function DependenciesPage() {
  const { repoData } = useRepo();
  const { openFile } = useCodeViewer();
  const [filterQuery, setFilterQuery] = useState('');

  const dependencies = (repoData?.dependenciesList && repoData.dependenciesList.length > 0)
    ? repoData.dependenciesList
    : DEMO_DEPENDENCIES;

  const production = dependencies.filter(d => d.type === 'production');
  const development = dependencies.filter(d => d.type === 'development');

  const filteredProduction = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return production;
    return production.filter(d => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
  }, [production, filterQuery]);

  const filteredDevelopment = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return development;
    return development.filter(d => d.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
  }, [development, filterQuery]);

  const counts = {
    ok: dependencies.filter(d => d.status === 'ok').length,
    outdated: dependencies.filter(d => d.status === 'outdated').length,
    vulnerable: dependencies.filter(d => d.status === 'vulnerable').length,
    unused: dependencies.filter(d => d.status === 'unused').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="section-label mb-1">Dependencies</div>
          <h1 className="text-xl font-semibold text-text-primary">Package Analysis</h1>
          <p className="text-sm text-text-secondary mt-1">
            {dependencies.length} packages audited from {repoData ? 'analyzed repository' : 'demo data'}. Outdated, vulnerable, and unused packages highlighted.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openFile('package.json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated/80 hover:bg-elevated text-xs font-mono text-text-primary border border-border/80 hover:border-accent-cyan/40 transition-colors shadow-sm"
          >
            <FileCode size={13} className="text-accent-cyan" />
            <span>View package.json</span>
          </button>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'UP TO DATE', value: counts.ok, color: 'text-success', border: 'border-success/20' },
          { label: 'OUTDATED', value: counts.outdated, color: 'text-warning', border: 'border-warning/20' },
          { label: 'VULNERABLE', value: counts.vulnerable, color: 'text-error', border: 'border-error/20' },
          { label: 'UNUSED', value: counts.unused, color: 'text-text-secondary', border: 'border-border' },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`card p-4 ${border}`}>
            <div className={`text-2xl font-mono font-semibold ${color}`}>{value}</div>
            <div className="text-xs font-mono tracking-widest text-text-secondary mt-1">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* Attention required */}
      {(counts.vulnerable > 0 || counts.outdated > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5 border-error/30"
        >
          <div className="section-label mb-3 text-error">Attention Required</div>
          <div className="space-y-2">
            {DEMO_DEPENDENCIES.filter(d => d.status === 'vulnerable' || d.status === 'unused').map(dep => (
              <div key={dep.name} className={`flex items-start gap-3 p-3 rounded border ${statusConfig[dep.status].border} ${statusConfig[dep.status].bg}`}>
                {statusConfig[dep.status].icon}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium text-text-primary">{dep.name}</span>
                    <span className={`text-xs font-mono ${statusConfig[dep.status].color}`}>{dep.version}</span>
                    <span className={`tag text-[10px] ${statusConfig[dep.status].bg} ${statusConfig[dep.status].color} ${statusConfig[dep.status].border}`}>
                      {statusConfig[dep.status].label}
                    </span>
                  </div>
                  {dep.description && (
                    <div className="text-xs text-text-secondary mt-0.5">{dep.description}</div>
                  )}
                  {dep.latestVersion && (
                    <div className="text-xs font-mono text-text-secondary mt-0.5">
                      Latest: <span className="text-success">{dep.latestVersion}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter search bar */}
      <div className="flex items-center px-3.5 py-2.5 rounded-lg bg-surface border border-border/80 gap-2.5 shadow-xs">
        <Search size={14} className="text-accent-cyan shrink-0" />
        <input
          type="text"
          value={filterQuery}
          onChange={e => setFilterQuery(e.target.value)}
          placeholder="Filter packages by name or description..."
          className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-secondary focus:outline-none font-mono"
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="text-[11px] font-mono text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded bg-elevated"
          >
            Clear
          </button>
        )}
      </div>

      {/* Production deps */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="section-label">Production Dependencies ({filteredProduction.length})</div>
          {filterQuery && (
            <span className="text-[11px] font-mono text-accent-cyan">Filtered</span>
          )}
        </div>
        <div className="space-y-0">
          {filteredProduction.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-secondary font-mono">
              No production dependencies match &ldquo;{filterQuery}&rdquo;
            </div>
          ) : (
            filteredProduction.map((dep, i) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.04 }}
              className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
            >
              <div className="w-36 shrink-0">
                <span className="font-mono text-sm text-text-primary">{dep.name}</span>
              </div>
              <div className="w-16 shrink-0">
                <span className="font-mono text-xs text-text-secondary">{dep.version}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-text-secondary truncate">{dep.description}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {dep.latestVersion && dep.status !== 'ok' && (
                  <span className="text-[10px] font-mono text-text-secondary">→ {dep.latestVersion}</span>
                )}
                <span className={`tag text-[10px] ${statusConfig[dep.status].bg} ${statusConfig[dep.status].color}`}>
                  {statusConfig[dep.status].label}
                </span>
              </div>
            </motion.div>
          )))}
        </div>
      </motion.div>

      {/* Dev deps */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="section-label">Development Dependencies ({filteredDevelopment.length})</div>
          {filterQuery && (
            <span className="text-[11px] font-mono text-accent-cyan">Filtered</span>
          )}
        </div>
        <div className="space-y-0">
          {filteredDevelopment.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-secondary font-mono">
              No development dependencies match &ldquo;{filterQuery}&rdquo;
            </div>
          ) : (
            filteredDevelopment.map((dep, i) => (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.04 }}
              className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0"
            >
              <div className="w-36 shrink-0">
                <span className="font-mono text-sm text-text-primary">{dep.name}</span>
              </div>
              <div className="w-16 shrink-0">
                <span className="font-mono text-xs text-text-secondary">{dep.version}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-text-secondary truncate">{dep.description}</span>
              </div>
              <div className="shrink-0">
                <span className={`tag text-[10px] ${statusConfig[dep.status].bg} ${statusConfig[dep.status].color}`}>
                  {statusConfig[dep.status].label}
                </span>
              </div>
            </motion.div>
          )))}
        </div>
      </motion.div>
    </div>
  );
}
