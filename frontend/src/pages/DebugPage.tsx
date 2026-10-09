import { useState, useRef } from 'react';
import { useRepo } from '../lib/RepoContext';
import { getApiUrl } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Send, RotateCcw, Zap, FileCode, HelpCircle, CheckSquare, AlertOctagon } from 'lucide-react';
import { ClickableFilePath } from '../components/ui/CodeBlock';
import { CodeBlock } from '../components/ui/CodeBlock';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { DebugAnalysis } from '../types';


const EXAMPLE_ERRORS = [
  { label: 'MongoDB connection refused', key: 'mongo' },
  { label: 'JWT invalid signature', key: 'jwt' },
  { label: 'Module not found', key: 'module' },
];

function ConfidenceBadge({ confidence }: { confidence: DebugAnalysis['confidence'] }) {
  const cfg = {
    high:   { color: 'text-success bg-success/10 border-success/30', label: 'HIGH CONFIDENCE' },
    medium: { color: 'text-warning bg-warning/10 border-warning/30', label: 'MEDIUM CONFIDENCE' },
    low:    { color: 'text-error bg-error/10 border-error/30',       label: 'LOW CONFIDENCE' },
  };
  return (
    <span className={`tag border text-[10px] ${cfg[confidence].color}`}>
      {cfg[confidence].label}
    </span>
  );
}

export function DebugPage() {
  const { repoUrl } = useRepo();
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<DebugAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const logSteps = [
    'Parsing error context...',
    'Identifying error type...',
    'Scanning repository for relevant files...',
    'Correlating with known patterns...',
    'Generating root cause analysis...',
    'Preparing recommended fix...',
  ];

  const runAnalysis = async (errorText: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisLog([]);

    // Show log steps while waiting for API
    const logPromise = (async () => {
      for (let i = 0; i < logSteps.length; i++) {
        await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
        setAnalysisLog(prev => [...prev, logSteps[i]]);
      }
    })();

    let result: DebugAnalysis | null = null;
    try {
      const apiUrl = getApiUrl();
      const [res] = await Promise.all([
        fetch(`${apiUrl}/api/debug`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ errorMessage: errorText, repositoryContext: repoUrl || undefined }),
        }),
        logPromise,
      ]);
      if (res.ok) {
        const data = await res.json();
        result = { error: errorText.slice(0, 100), ...data.analysis };
      } else {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || `API error ${res.status}`);
      }
    } catch (err: any) {
      await logPromise;
      result = {
        error: errorText.slice(0, 100),
        errorType: 'AnalysisFailed',
        likelyCause: err.message || 'Unable to connect to debug service',
        relevantFile: 'backend',
        whyItHappens: 'The backend debugging service could not complete the analysis. Make sure the backend server is running at http://localhost:3001.',
        suggestedFix: 'Check backend server logs and ensure your repository has been analyzed.',
        verifyCommand: 'npm run dev',
        confidence: 'low',
      };
    }

    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    runAnalysis(input);
  };

  const loadExample = (key: string) => {
    const examples: Record<string, string> = {
      mongo: 'MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017\n    at Timeout._onTimeout (/app/node_modules/mongodb/lib/sdam/topology.js:278:38)',
      jwt: 'JsonWebTokenError: invalid signature\n    at /app/node_modules/jsonwebtoken/verify.js:89:21\n    at src/middleware/auth.ts:45:12',
      module: "Cannot find module '@/components/ui/Button' from 'src/pages/index.tsx'\n    Require stack:\n    - src/pages/index.tsx",
    };
    setInput(examples[key] || '');
    setAnalysis(null);
    setAnalysisLog([]);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Debug Agent</div>
        <h1 className="text-xl font-semibold text-text-primary">Error Analysis</h1>
        <p className="text-sm text-text-secondary mt-1">
          Paste an error. RepoPilot analyzes it in the context of your repository.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Input panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <form onSubmit={handleSubmit} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug size={14} className="text-text-secondary" />
                <span className="text-sm font-medium">Error Input</span>
              </div>
              {(input || analysis) && (
                <button
                  type="button"
                  onClick={() => { setInput(''); setAnalysis(null); setAnalysisLog([]); }}
                  className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste your error message or stack trace here..."
              rows={10}
              className="w-full bg-elevated border border-border rounded p-3 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-cyan/50 resize-none leading-relaxed transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || analyzing}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Analyze Error
                </>
              )}
            </button>
          </form>

          {/* Examples */}
          <div className="card p-4">
            <div className="section-label mb-3">Example Errors</div>
            <div className="space-y-1">
              {EXAMPLE_ERRORS.map(ex => (
                <button
                  key={ex.key}
                  onClick={() => loadExample(ex.key)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors text-left"
                >
                  <Send size={11} className="shrink-0" />
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Analysis output */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <StatusBadge status="analyzing" label="ANALYZING" />
                </div>
                <div className="space-y-1">
                  {analysisLog.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-xs font-mono"
                    >
                      <span className="text-success">›</span>
                      <span className="text-text-secondary">{line}</span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 text-xs font-mono text-text-secondary mt-1">
                    <span className="w-4 h-px bg-accent-cyan animate-pulse" />
                  </div>
                </div>
              </motion.div>
            )}

            {!analyzing && analysis && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* Error header */}
                <div className="card p-5 border-error/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon size={14} className="text-error shrink-0" />
                      <span className="text-[10px] font-mono tracking-widest text-error">ERROR</span>
                    </div>
                    <ConfidenceBadge confidence={analysis.confidence} />
                  </div>
                  <div className="font-mono text-sm text-text-primary leading-relaxed">{analysis.errorType}</div>
                  <div className="font-mono text-xs text-text-secondary mt-1 break-all">{analysis.error}</div>
                </div>

                {/* Likely cause */}
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={13} className="text-warning" />
                    <span className="text-[10px] font-mono tracking-widest text-warning">LIKELY CAUSE</span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{analysis.likelyCause}</p>
                </div>

                {/* Relevant file */}
                {analysis.relevantFile && (
                  <div className="card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode size={13} className="text-accent-cyan" />
                      <span className="text-[10px] font-mono tracking-widest text-accent-cyan">RELEVANT FILE</span>
                    </div>
                    <ClickableFilePath path={analysis.relevantFile} />
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">{analysis.whyItHappens}</p>
                  </div>
                )}

                {/* Suggested fix */}
                <div className="card p-5 border-success/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckSquare size={13} className="text-success" />
                    <span className="text-[10px] font-mono tracking-widest text-success">SUGGESTED FIX</span>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed mb-3">{analysis.suggestedFix}</p>
                  {analysis.verifyCommand && (
                    <div>
                      <div className="text-[10px] font-mono text-text-secondary mb-2 tracking-widest">VERIFY</div>
                      <CodeBlock code={analysis.verifyCommand} language="bash" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {!analyzing && !analysis && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-8 flex flex-col items-center justify-center text-center min-h-[300px]"
              >
                <Bug size={28} className="text-text-secondary mb-3" />
                <div className="text-sm font-medium text-text-secondary mb-1">No error analyzed yet</div>
                <div className="text-xs text-text-secondary max-w-xs">
                  Paste an error or stack trace and the agent will analyze it in the context of your repository.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
