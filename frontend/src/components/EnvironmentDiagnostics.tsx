import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  HardDrive,
  Copy,
  Check,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getApiUrl } from '../lib/api';

export interface DiagnosticCheck {
  id: string;
  name: string;
  category: 'runtime' | 'package_manager' | 'vcs' | 'container' | 'system';
  installed: boolean;
  version?: string;
  details?: string;
  status: 'passed' | 'warning' | 'failed';
  recommendation?: string;
  installCommand?: string;
}

export interface DiagnosticsResult {
  timestamp: string;
  system: {
    platform: string;
    arch: string;
    cpus: number;
    totalMemoryGB: number;
    freeMemoryGB: number;
  };
  checks: DiagnosticCheck[];
  overallStatus: 'all_passed' | 'has_warnings' | 'has_failures';
}

export function EnvironmentDiagnostics() {
  const [data, setData] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setOffline(false);
    try {
      const res = await fetch(`${getApiUrl()}/api/diagnostics`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        throw new Error(`Diagnostics API returned ${res.status}`);
      }
      const json: DiagnosticsResult = await res.json();
      setData(json);
      setOffline(false);
    } catch {
      setData(null);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (offline || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-5 border border-border/80 bg-surface/80 relative overflow-hidden backdrop-blur-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-label">LIVE ENVIRONMENT DIAGNOSTICS</span>
              <span className="w-2 h-2 rounded-full bg-warning" />
            </div>
            <h2 className="text-base font-semibold text-text-primary mt-0.5">
              Local Toolchain Diagnostics Offline
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Start the RepoPilot local backend engine (<code className="text-accent-cyan font-mono">npm run dev</code> or <code className="text-accent-cyan font-mono">npm run dev:backend</code>) to inspect live Node.js, Git, and Docker statuses on your machine.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchDiagnostics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-cyan/10 hover:bg-accent-cyan/20 text-xs font-mono text-accent-cyan border border-accent-cyan/40 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Connecting...' : 'Retry Connection'}</span>
          </button>
        </div>
      </motion.div>
    );
  }

  const currentData = data;
  const passedCount = currentData.checks.filter(c => c.status === 'passed').length;
  const warningCount = currentData.checks.filter(c => c.status === 'warning').length;
  const failedCount = currentData.checks.filter(c => c.status === 'failed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 border border-border/80 bg-surface/80 relative overflow-hidden backdrop-blur-sm"
    >
      {/* Decorative gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        currentData.overallStatus === 'all_passed'
          ? 'bg-gradient-to-r from-success/80 to-accent-cyan/80'
          : currentData.overallStatus === 'has_warnings'
          ? 'bg-gradient-to-r from-warning/80 to-accent-cyan/60'
          : 'bg-gradient-to-r from-error/80 to-warning/80'
      }`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="section-label">LIVE ENVIRONMENT DIAGNOSTICS</span>
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                currentData.overallStatus === 'all_passed' ? 'bg-success' : 'bg-warning'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                currentData.overallStatus === 'all_passed' ? 'bg-success' : 'bg-warning'
              }`} />
            </span>
          </div>
          <h2 className="text-base font-semibold text-text-primary mt-0.5 flex items-center gap-2">
            Local Developer Toolchain &amp; Prerequisites
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Active verification of Node.js, package managers, Git VCS, and Docker container support.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={fetchDiagnostics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-elevated hover:bg-border text-xs font-mono text-text-secondary hover:text-text-primary border border-border/70 transition-colors disabled:opacity-50"
            title="Re-run diagnostic checks"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-accent-cyan' : ''} />
            <span>{loading ? 'Checking...' : 'Run Diagnostics'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(v => !v)}
            className="p-1.5 rounded bg-elevated hover:bg-border text-text-secondary hover:text-text-primary border border-border/70 transition-colors"
            title={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Hardware / Platform Specs Bar */}
      <div className="flex flex-wrap items-center gap-2 py-3 text-[11px] font-mono border-b border-border/40 text-text-secondary">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-elevated border border-border/50 text-text-primary">
          <Layers size={11} className="text-accent-cyan" />
          <span>{currentData.system.platform} ({currentData.system.arch})</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-elevated border border-border/50">
          <Cpu size={11} className="text-accent-violet" />
          <span>{currentData.system.cpus} CPU cores</span>
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-elevated border border-border/50">
          <HardDrive size={11} className="text-warning" />
          <span>{currentData.system.freeMemoryGB} GB free / {currentData.system.totalMemoryGB} GB RAM</span>
        </span>
        <span className="ml-auto text-[10px] text-text-secondary/70">
          Last checked: {new Date(currentData.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Main Diagnostic Checks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-2.5 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {currentData.checks.map(check => {
                const isPassed = check.status === 'passed';
                const isWarning = check.status === 'warning';

                return (
                  <div
                    key={check.id}
                    className={`p-3.5 rounded border transition-colors flex flex-col justify-between ${
                      isPassed
                        ? 'bg-elevated/40 border-success/20 hover:border-success/40'
                        : isWarning
                        ? 'bg-warning/5 border-warning/30 hover:border-warning/50'
                        : 'bg-error/5 border-error/30 hover:border-error/50'
                    }`}
                  >
                    <div>
                      {/* Top: Name, version & status */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {isPassed ? (
                            <CheckCircle size={15} className="text-success shrink-0" />
                          ) : isWarning ? (
                            <AlertTriangle size={15} className="text-warning shrink-0" />
                          ) : (
                            <XCircle size={15} className="text-error shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-text-primary truncate">
                            {check.name}
                          </span>
                        </div>

                        {check.version ? (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface border border-border/80 text-accent-cyan shrink-0">
                            {check.version}
                          </span>
                        ) : (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                            isPassed ? 'text-success bg-success/10' :
                            isWarning ? 'text-warning bg-warning/10' :
                            'text-error bg-error/10'
                          }`}>
                            {check.status}
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      {check.details && (
                        <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
                          {check.details}
                        </p>
                      )}

                      {/* Recommendation if warning / failed */}
                      {check.recommendation && (
                        <div className="text-[11px] text-warning/90 bg-warning/10 p-2 rounded mb-2 border border-warning/20 leading-snug">
                          <strong>Note:</strong> {check.recommendation}
                        </div>
                      )}
                    </div>

                    {/* Copyable install command */}
                    {check.installCommand && (
                      <div className="mt-2 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between gap-2 bg-[#090d16] px-2.5 py-1.5 rounded border border-border/60 font-mono text-[11px] text-[#e2e8f0]">
                          <span className="truncate text-accent-cyan select-all">
                            $ {check.installCommand}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(check.id, check.installCommand!)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary shrink-0"
                            title="Copy command to clipboard"
                          >
                            {copiedId === check.id ? (
                              <Check size={12} className="text-success" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick summary stats footer */}
            <div className="flex items-center justify-between pt-2 px-1 text-xs text-text-secondary font-mono">
              <span className="flex items-center gap-3">
                <span className="text-success">● {passedCount} verified</span>
                {warningCount > 0 && <span className="text-warning">▲ {warningCount} notices</span>}
                {failedCount > 0 && <span className="text-error">✕ {failedCount} missing</span>}
              </span>
              <span className="text-[11px] text-accent-cyan/80">
                Auto-diagnostics verified against local machine
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
