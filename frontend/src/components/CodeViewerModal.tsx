import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink, AlertTriangle, Loader2, FileCode, ChevronUp, ChevronDown } from 'lucide-react';
import { useCodeViewer } from '../lib/CodeViewerContext';
import { useRepo } from '../lib/RepoContext';
import { getApiUrl } from '../lib/api';

interface FileData {
  path: string;
  content: string;
  language: string;
  lineCount: number;
  sizeBytes: number;
  repoName: string;
}

const TOKEN_PATTERNS: Array<{ pattern: RegExp; className: string }> = [
  // Strings
  { pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, className: 'text-[#a8ff78]' },
  // Comments
  { pattern: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g, className: 'text-[#6b7280] italic' },
  // Keywords
  { pattern: /\b(import|export|default|from|const|let|var|function|class|interface|type|enum|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|extends|implements|async|await|void|null|undefined|true|false|typeof|instanceof|in|of|delete|yield|static|public|private|protected|readonly|abstract|declare)\b/g, className: 'text-[#c084fc]' },
  // Built-in types
  { pattern: /\b(string|number|boolean|object|Array|Promise|Record|Partial|Required|Pick|Omit|any|never|unknown)\b/g, className: 'text-[#67e8f9]' },
  // Numbers
  { pattern: /\b(\d+(?:\.\d+)?)\b/g, className: 'text-[#fb923c]' },
  // Decorators
  { pattern: /(@\w+)/g, className: 'text-[#fbbf24]' },
];

function highlightLine(line: string): string {
  // Simple HTML escape first
  let escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped;
}

function CodeLine({ lineNumber, content, highlight }: { lineNumber: number; content: string; highlight: boolean }) {
  return (
    <div className={`flex group hover:bg-white/[0.03] transition-colors ${highlight ? 'bg-accent-cyan/10 border-l-2 border-accent-cyan' : ''}`}>
      <span className="w-12 shrink-0 text-right pr-4 text-[11px] font-mono text-[#374151] select-none leading-5 py-0.5">
        {lineNumber}
      </span>
      <span className="flex-1 font-mono text-[12.5px] leading-5 text-[#e2e8f0] whitespace-pre py-0.5 pr-4">
        {content}
      </span>
    </div>
  );
}

export function CodeViewerModal() {
  const { viewerState, closeFile } = useCodeViewer();
  const { repoUrl } = useRepo();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [jumpLine, setJumpLine] = useState('');
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFile = useCallback(async (filePath: string) => {
    setLoading(true);
    setError(null);
    setFileData(null);
    setHighlightedLine(null);

    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({ path: filePath });
      if (repoUrl) params.set('repo', repoUrl);

      const res = await fetch(`${apiUrl}/api/file?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data: FileData = await res.json();
      setFileData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  }, [repoUrl]);

  useEffect(() => {
    if (viewerState.open && viewerState.filePath) {
      fetchFile(viewerState.filePath);
    }
  }, [viewerState.open, viewerState.filePath, fetchFile]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFile();
    };
    if (viewerState.open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [viewerState.open, closeFile]);

  const handleCopy = async () => {
    if (!fileData) return;
    await navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVSCodeOpen = () => {
    if (!fileData) return;
    window.open(`vscode://file/${fileData.path}`, '_blank');
  };

  const handleJumpToLine = () => {
    const n = parseInt(jumpLine, 10);
    if (!n || !fileData) return;
    const clipped = Math.max(1, Math.min(n, fileData.lineCount));
    setHighlightedLine(clipped);
    const container = scrollRef.current;
    if (!container) return;
    // Each line is ~20px (leading-5)
    const lineHeight = 20;
    container.scrollTo({ top: (clipped - 1) * lineHeight - 80, behavior: 'smooth' });
    setJumpLine('');
  };

  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const lines = fileData?.content.split('\n') || [];
  const fileName = viewerState.filePath.split('/').pop() || viewerState.filePath;
  const pathParts = viewerState.filePath.split('/');

  return (
    <AnimatePresence>
      {viewerState.open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={closeFile}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 flex flex-col rounded-xl border border-border bg-[#0d1117] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-[#161b22] shrink-0">
              {/* Traffic lights */}
              <div className="flex gap-1.5">
                <button
                  onClick={closeFile}
                  className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors group flex items-center justify-center"
                >
                  <X size={7} className="opacity-0 group-hover:opacity-100 text-[#7a0a00]" />
                </button>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>

              {/* File path breadcrumb */}
              <div className="flex-1 flex items-center gap-0.5 overflow-hidden min-w-0">
                <FileCode size={13} className="text-text-secondary shrink-0 mr-1" />
                {pathParts.map((part, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && <span className="text-[#374151] text-xs mx-0.5">/</span>}
                    <span className={`font-mono text-xs truncate ${i === pathParts.length - 1 ? 'text-accent-cyan font-semibold' : 'text-[#6b7280]'}`}>
                      {part}
                    </span>
                  </span>
                ))}
              </div>

              {/* Stats */}
              {fileData && (
                <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-[#4b5563] shrink-0">
                  <span>{fileData.language}</span>
                  <span>{fileData.lineCount.toLocaleString()} lines</span>
                  <span>{(fileData.sizeBytes / 1024).toFixed(1)}KB</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Jump to line */}
                <div className="flex items-center gap-1 border border-border rounded px-2 py-0.5">
                  <span className="text-[10px] font-mono text-text-secondary">:</span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={jumpLine}
                    onChange={e => setJumpLine(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJumpToLine()}
                    placeholder="line"
                    className="w-12 bg-transparent text-[11px] font-mono text-text-primary outline-none placeholder:text-[#374151]"
                  />
                </div>

                <button
                  onClick={handleCopy}
                  disabled={!fileData}
                  className="p-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                  title="Copy file contents"
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={handleVSCodeOpen}
                  disabled={!fileData}
                  className="p-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                  title="Open in VS Code"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={closeFile}
                  className="p-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors ml-1"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d1117]">
                  <Loader2 size={22} className="animate-spin text-accent-cyan" />
                  <span className="text-xs font-mono text-text-secondary">Loading {fileName}...</span>
                </div>
              )}

              {error && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d1117] p-8 text-center">
                  <AlertTriangle size={22} className="text-warning" />
                  <div className="text-sm font-medium text-text-primary">Could not load file</div>
                  <div className="text-xs font-mono text-text-secondary max-w-sm">{error}</div>
                  <button
                    onClick={() => fetchFile(viewerState.filePath)}
                    className="mt-2 text-xs font-mono text-accent-cyan hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {fileData && !loading && (
                <div ref={scrollRef} className="h-full overflow-auto">
                  <div className="py-2 min-w-max">
                    {lines.map((line, i) => (
                      <CodeLine
                        key={i}
                        lineNumber={i + 1}
                        content={line}
                        highlight={highlightedLine === i + 1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-[#161b22] shrink-0">
              <div className="text-[10px] font-mono text-[#4b5563]">
                {fileData ? `${fileData.repoName} · ${viewerState.filePath}` : viewerState.filePath}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={scrollToTop}
                  className="p-1 rounded hover:bg-elevated text-[#4b5563] hover:text-text-secondary transition-colors"
                  title="Scroll to top"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={scrollToBottom}
                  className="p-1 rounded hover:bg-elevated text-[#4b5563] hover:text-text-secondary transition-colors"
                  title="Scroll to bottom"
                >
                  <ChevronDown size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
