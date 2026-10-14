import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { useCodeViewer } from '../../lib/CodeViewerContext';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const { openFile } = useCodeViewer();

  if (!content) return null;

  // Split into paragraphs / blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={key} className="my-2.5 space-y-1.5 pl-4 list-disc list-outside text-text-primary text-sm leading-relaxed marker:text-accent-cyan">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item, openFile)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushCodeBlock = (key: string) => {
    if (inCodeBlock) {
      const code = codeBlockLines.join('\n');
      elements.push(
        <CodeBlockItem key={key} code={code} language={codeBlockLang} />
      );
      codeBlockLines = [];
      inCodeBlock = false;
      codeBlockLang = '';
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(`code-${i}`);
      } else {
        flushList(`list-before-code-${i}`);
        inCodeBlock = true;
        codeBlockLang = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      flushList(`list-before-hr-${i}`);
      elements.push(
        <hr key={`hr-${i}`} className="my-4 border-border/70" />
      );
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      flushList(`list-before-h3-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-semibold text-text-primary mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
          <span>{renderInline(line.replace('### ', ''), openFile)}</span>
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList(`list-before-h2-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-semibold text-text-primary mt-5 mb-2 pb-1 border-b border-border/50">
          {renderInline(line.replace('## ', ''), openFile)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList(`list-before-h1-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg font-bold text-text-primary mt-5 mb-2">
          {renderInline(line.replace('# ', ''), openFile)}
        </h1>
      );
      continue;
    }

    // Bullet list items
    if (/^\s*[-*]\s+/.test(line)) {
      inList = true;
      listItems.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    }

    // Numbered list items
    if (/^\s*\d+\.\s+/.test(line)) {
      flushList(`list-before-num-${i}`);
      const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm leading-relaxed text-text-primary">
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan font-semibold shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1 min-w-0">
              {renderInline(numMatch[2], openFile)}
            </div>
          </div>
        );
      }
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`list-before-bq-${i}`);
      elements.push(
        <blockquote key={`bq-${i}`} className="my-2 pl-3 py-1 border-l-2 border-accent-cyan/60 text-text-secondary text-sm italic bg-elevated/30 rounded-r">
          {renderInline(line.replace('> ', ''), openFile)}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      flushList(`list-empty-${i}`);
      continue;
    }

    // Regular paragraph line
    flushList(`list-before-p-${i}`);
    elements.push(
      <p key={`p-${i}`} className="text-sm text-text-primary leading-relaxed my-2">
        {renderInline(line, openFile)}
      </p>
    );
  }

  flushList('list-end');
  flushCodeBlock('code-end');

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}

function CodeBlockItem({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-3 rounded-lg border border-border/80 bg-surface/90 overflow-hidden text-xs font-mono shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-elevated/80 border-b border-border/60">
        <span className="text-[11px] text-accent-cyan font-medium uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-surface"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-text-primary leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Render inline formatting: **bold**, `code`, clickable files */
function renderInline(text: string, openFile?: (path: string) => void): React.ReactNode {
  // Regex to split by `code` or **bold**
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      const codeVal = token.slice(1, -1);
      // If code looks like a file path (contains / or has .ts/.js/.json/.md extension), make it clickable
      const isFileLike = codeVal.includes('/') || /\.(ts|tsx|js|jsx|json|md|py|go|rs|css|html|yaml|yml)$/i.test(codeVal);

      if (isFileLike && openFile) {
        return (
          <button
            key={index}
            type="button"
            onClick={() => openFile(codeVal)}
            className="inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan hover:bg-accent-cyan/25 border border-accent-cyan/30 mx-0.5 transition-colors cursor-pointer group"
            title={`Open ${codeVal} in Code Viewer`}
          >
            <FileCode size={11} className="shrink-0 text-accent-cyan/80 group-hover:text-accent-cyan" />
            <span className="underline underline-offset-2">{codeVal}</span>
          </button>
        );
      }

      return (
        <code
          key={index}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-elevated border border-border/70 text-accent-cyan mx-0.5"
        >
          {codeVal}
        </code>
      );
    }

    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-text-primary">
          {token.slice(2, -2)}
        </strong>
      );
    }

    return token;
  });
}
