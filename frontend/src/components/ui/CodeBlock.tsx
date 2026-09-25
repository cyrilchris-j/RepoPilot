import React from 'react';
import { motion } from 'framer-motion';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  showCopy?: boolean;
}

export function CodeBlock({ code, language = 'bash', label, showCopy = true }: CodeBlockProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-elevated border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
          </div>
          {label && <span className="text-xs font-mono text-text-secondary ml-1">{label}</span>}
          {!label && <span className="text-xs font-mono text-text-secondary ml-1">{language}</span>}
        </div>
        {showCopy && <CopyButton text={code} />}
      </div>
      <div className="p-4 bg-surface overflow-x-auto">
        <pre className="text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}

export function InlineCode({ children, className = '' }: InlineCodeProps) {
  return (
    <code className={`font-mono text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded text-sm ${className}`}>
      {children}
    </code>
  );
}

export function FilePath({ path, className = '' }: { path: string; className?: string }) {
  const parts = path.split('/');
  return (
    <span className={`font-mono text-sm ${className}`}>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="text-text-secondary mx-0.5">/</span>}
          <span className={i === parts.length - 1 ? 'text-accent-cyan' : 'text-text-secondary'}>{part}</span>
        </span>
      ))}
    </span>
  );
}

export function ScanningLine() {
  return (
    <div className="relative h-px overflow-hidden">
      <div className="absolute inset-0 bg-border" />
      <motion.div
        className="absolute h-px w-1/3 bg-gradient-to-r from-transparent via-accent-cyan to-transparent"
        animate={{ x: ['-100%', '400%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
