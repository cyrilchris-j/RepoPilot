import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Circle, Terminal, Download, Copy, Check, Eye, EyeOff, Key } from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import { EnvironmentDiagnostics } from '../components/EnvironmentDiagnostics';
import { useRepo } from '../lib/RepoContext';
import { DEMO_SETUP_STEPS, DEMO_ENV_VARIABLES } from '../lib/demo-data';
import type { SetupStep, EnvVariable } from '../types';

function StepIcon({ status }: { status: SetupStep['status'] }) {
  if (status === 'ok') return <CheckCircle size={15} className="text-success" />;
  if (status === 'warning') return <AlertTriangle size={15} className="text-warning" />;
  if (status === 'error') return <XCircle size={15} className="text-error" />;
  return <Circle size={15} className="text-text-secondary" />;
}

function isSensitiveVar(name: string) {
  return /SECRET|KEY|TOKEN|PASSWORD|PASS|PRIVATE|CREDENTIAL|AUTH/i.test(name);
}

function EnvVarRow({
  envVar,
  value,
  onChange,
}: {
  envVar: EnvVariable;
  value: string;
  onChange: (val: string) => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const sensitive = isSensitiveVar(envVar.name);

  return (
    <motion.div
      layout
      className={`py-3.5 border-b border-border/50 last:border-0 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center`}
    >
      {/* Name + badges */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            value ? 'bg-success' : envVar.required ? 'bg-error' : 'bg-warning'
          }`} />
          <span className="font-mono text-sm text-text-primary truncate">{envVar.name}</span>
          {envVar.required && (
            <span className="text-[9px] font-mono text-text-secondary shrink-0">REQUIRED</span>
          )}
          {sensitive && (
            <Key size={10} className="text-warning shrink-0" />
          )}
        </div>
        {envVar.description && (
          <div className="text-[11px] text-text-secondary leading-snug ml-4 line-clamp-2">{envVar.description}</div>
        )}
      </div>

      {/* Arrow */}
      <div className="hidden md:block text-center text-[#374151] font-mono text-xs">=</div>

      {/* Input */}
      <div className="relative">
        <input
          type={sensitive && !showSecret ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={envVar.example || (sensitive ? '••••••••' : 'Enter value...')}
          className={`w-full bg-elevated border rounded px-3 py-1.5 text-sm font-mono text-text-primary placeholder:text-[#374151] focus:outline-none transition-colors ${
            value
              ? 'border-success/30 focus:border-success/50'
              : envVar.required
              ? 'border-error/30 focus:border-error/50'
              : 'border-border focus:border-accent-cyan/50'
          } ${sensitive ? 'pr-9' : ''}`}
        />
        {sensitive && (
          <button
            type="button"
            onClick={() => setShowSecret(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function SetupPage() {
  const { repoData } = useRepo();
  const setupSteps = (repoData?.setupSteps && repoData.setupSteps.length > 0)
    ? repoData.setupSteps
    : DEMO_SETUP_STEPS;
  const envVariables = (repoData?.envVariables && repoData.envVariables.length > 0)
    ? repoData.envVariables
    : DEMO_ENV_VARIABLES;

  const okCount = setupSteps.filter(s => s.status === 'ok').length;
  const warnCount = setupSteps.filter(s => s.status === 'warning').length;
  const errCount = setupSteps.filter(s => s.status === 'error').length;

  // Interactive .env state: name -> user-entered value
  const [envValues, setEnvValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of envVariables) {
      init[v.name] = '';
    }
    return init;
  });
  const [copied, setCopied] = useState(false);

  const filledCount = Object.values(envValues).filter(v => v.trim()).length;

  const generateEnvContent = () => {
    return envVariables
      .map(v => {
        const val = envValues[v.name]?.trim() || v.example || '';
        const commentLine = v.description ? `# ${v.description}` : null;
        return [commentLine, `${v.name}=${val}`].filter(Boolean).join('\n');
      })
      .join('\n\n');
  };

  const handleDownload = () => {
    const content = generateEnvContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEnv = async () => {
    await navigator.clipboard.writeText(generateEnvContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateValue = (name: string, value: string) => {
    setEnvValues(prev => ({ ...prev, [name]: value }));
  };

  const missingRequired = envVariables.filter(v => v.required && !envValues[v.name]?.trim());

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Setup Assistant</div>
        <h1 className="text-xl font-semibold text-text-primary">Environment &amp; Configuration</h1>
        <p className="text-sm text-text-secondary mt-1">
          Prerequisites, commands, and configuration required to run this repository.
        </p>
      </motion.div>

      {/* Live Prerequisite Diagnostics */}
      <EnvironmentDiagnostics />

      {/* Status summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="card p-4 border-success/20">
          <div className="text-2xl font-mono font-semibold text-success">{okCount}</div>
          <div className="text-xs font-mono tracking-widest text-text-secondary mt-1">PASSING</div>
        </div>
        <div className="card p-4 border-warning/20">
          <div className="text-2xl font-mono font-semibold text-warning">{warnCount}</div>
          <div className="text-xs font-mono tracking-widest text-text-secondary mt-1">WARNINGS</div>
        </div>
        <div className="card p-4 border-error/20">
          <div className="text-2xl font-mono font-semibold text-error">{errCount}</div>
          <div className="text-xs font-mono tracking-widest text-text-secondary mt-1">ERRORS</div>
        </div>
      </motion.div>

      {/* Prerequisites */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-5"
      >
        <div className="section-label mb-4">Prerequisites &amp; Steps</div>
        <div className="space-y-0">
          {setupSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className={`flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-border/50 last:border-0 ${
                step.status === 'error' ? 'bg-error/5 -mx-5 px-5 rounded' :
                step.status === 'warning' ? 'bg-warning/5 -mx-5 px-5 rounded' : ''
              }`}
            >
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <StepIcon status={step.status} />
                <span className={`text-sm font-medium ${
                  step.status === 'ok' ? 'text-text-primary' :
                  step.status === 'warning' ? 'text-warning' :
                  step.status === 'error' ? 'text-error' : 'text-text-secondary'
                }`}>
                  {step.label}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                {step.details && (
                  <div className={`text-xs font-mono mb-2 ${
                    step.status === 'ok' ? 'text-success' :
                    step.status === 'warning' ? 'text-warning' :
                    step.status === 'error' ? 'text-error' : 'text-text-secondary'
                  }`}>
                    {step.details}
                  </div>
                )}
                {step.description && !step.details && (
                  <div className="text-xs text-text-secondary mb-2">{step.description}</div>
                )}
                {step.command && (
                  <CodeBlock code={step.command} language="bash" showCopy />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Interactive .env Generator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="section-label">.env Generator</div>
            <span className={`tag text-[10px] ${
              missingRequired.length > 0
                ? 'bg-warning/10 text-warning border-warning/20 border'
                : 'bg-success/10 text-success border-success/20 border'
            }`}>
              {filledCount}/{envVariables.length} filled
            </span>
            {missingRequired.length > 0 && (
              <span className="tag text-[10px] bg-error/10 text-error border border-error/20">
                {missingRequired.length} required missing
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEnv}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-accent-cyan/40 transition-all"
            >
              {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            >
              <Download size={12} />
              Download .env.local
            </button>
          </div>
        </div>
        <p className="text-xs text-text-secondary mb-4">
          Fill in values below. Sensitive fields are masked. Click Download to get a ready-to-use <code className="font-mono text-accent-cyan text-[11px]">.env.local</code> file.
        </p>

        {/* Env var rows */}
        <div className="divide-y divide-border/0">
          {envVariables.map(v => (
            <EnvVarRow
              key={v.name}
              envVar={v}
              value={envValues[v.name] || ''}
              onChange={val => handleUpdateValue(v.name, val)}
            />
          ))}
        </div>

        {/* Preview */}
        {filledCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-border"
          >
            <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-2">PREVIEW</div>
            <div className="rounded-lg border border-border bg-[#0d1117] p-4 overflow-x-auto max-h-48 overflow-y-auto">
              <pre className="text-[11px] font-mono text-[#e2e8f0] whitespace-pre leading-5">
                {generateEnvContent()}
              </pre>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Quick start commands */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={14} className="text-text-secondary" />
          <div className="section-label">Quick Start</div>
        </div>
        <div className="space-y-3">
          {setupSteps.filter(s => s.command).slice(0, 5).map((s) => (
            <div key={s.id}>
              <div className="text-xs text-text-secondary mb-2">{s.label}</div>
              <CodeBlock code={s.command!} language="bash" showCopy />
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
