import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Circle, Terminal } from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import { DEMO_SETUP_STEPS, DEMO_ENV_VARIABLES } from '../lib/demo-data';
import type { SetupStep } from '../types';

function StepIcon({ status }: { status: SetupStep['status'] }) {
  if (status === 'ok') return <CheckCircle size={15} className="text-success" />;
  if (status === 'warning') return <AlertTriangle size={15} className="text-warning" />;
  if (status === 'error') return <XCircle size={15} className="text-error" />;
  return <Circle size={15} className="text-text-secondary" />;
}

export function SetupPage() {
  const okCount = DEMO_SETUP_STEPS.filter(s => s.status === 'ok').length;
  const warnCount = DEMO_SETUP_STEPS.filter(s => s.status === 'warning').length;
  const errCount = DEMO_SETUP_STEPS.filter(s => s.status === 'error').length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Setup Assistant</div>
        <h1 className="text-xl font-semibold text-text-primary">Environment & Configuration</h1>
        <p className="text-sm text-text-secondary mt-1">
          Prerequisites, commands, and configuration required to run this repository.
        </p>
      </motion.div>

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
        <div className="section-label mb-4">Prerequisites & Steps</div>
        <div className="space-y-0">
          {DEMO_SETUP_STEPS.map((step, i) => (
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

      {/* Environment variables */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="section-label">Environment Variables</div>
          <span className="tag bg-warning/10 text-warning text-[10px]">
            {DEMO_ENV_VARIABLES.filter(v => v.required && !v.detected).length} missing
          </span>
        </div>
        <div className="space-y-0">
          {DEMO_ENV_VARIABLES.map((envVar, i) => (
            <motion.div
              key={envVar.name}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-start gap-3 py-3.5 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-2 sm:w-52 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  envVar.detected ? 'bg-success' :
                  envVar.required ? 'bg-error' : 'bg-warning'
                }`} />
                <span className="font-mono text-sm text-text-primary">{envVar.name}</span>
                {envVar.required && (
                  <span className="text-[9px] font-mono text-text-secondary">REQUIRED</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {envVar.description && (
                  <div className="text-xs text-text-secondary mb-1">{envVar.description}</div>
                )}
                {envVar.example && (
                  <div className="text-[11px] font-mono text-text-secondary">
                    e.g. <span className={envVar.name.includes('SECRET') || envVar.name.includes('KEY') ? 'text-text-secondary' : 'text-accent-cyan'}>
                      {envVar.name.includes('SECRET') ? '***' : envVar.example}
                    </span>
                  </div>
                )}
              </div>
              <div className={`shrink-0 text-xs font-mono ${envVar.detected ? 'text-success' : envVar.required ? 'text-error' : 'text-warning'}`}>
                {envVar.detected ? '✓ DETECTED' : envVar.required ? '✗ MISSING' : '⚠ OPTIONAL'}
              </div>
            </motion.div>
          ))}
        </div>
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
          <div>
            <div className="text-xs text-text-secondary mb-2">Install dependencies</div>
            <CodeBlock code="pnpm install" language="bash" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-2">Push database schema</div>
            <CodeBlock code="pnpm prisma db push" language="bash" />
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-2">Start development server</div>
            <CodeBlock code="pnpm dev" language="bash" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
