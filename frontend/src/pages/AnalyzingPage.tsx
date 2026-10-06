import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanningLine } from '../components/ui/CodeBlock';
import { useRepo } from '../lib/RepoContext';
import { analyzeRepositoryUniversal } from '../lib/repoAnalyzer';

export function AnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { repoUrl, setRepoUrl, setRepoData } = useRepo();
  const [logs, setLogs] = useState<string[]>([
    'Initializing repository scanner...',
  ]);
  const [progress, setProgress] = useState(15);
  const [completed, setCompleted] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Support direct navigation with state (e.g. from LandingPage)
  const urlFromState = (location.state as { repoUrl?: string } | null)?.repoUrl || '';
  const activeRepo = urlFromState || repoUrl || '';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRepo) {
      navigate('/');
      return;
    }
    if (urlFromState && urlFromState !== repoUrl) {
      setRepoUrl(urlFromState);
    }
  }, [urlFromState, repoUrl, activeRepo, setRepoUrl, navigate]);

  useEffect(() => {
    if (!activeRepo) return;
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    let isCancelled = false;

    async function runAnalysis() {
      try {
        const stepProgresses: Record<string, number> = {
          'Connecting': 25,
          'Fetching': 40,
          'Scanning': 60,
          'Resolving': 75,
          'Analyzing': 85,
          'Fetching real Git': 90,
          'Generating': 95,
          'WORKSPACE': 100,
        };

        const result = await analyzeRepositoryUniversal(activeRepo, (stepMsg) => {
          if (isCancelled) return;
          setLogs(prev => [...prev.slice(-6), stepMsg]);

          // Dynamically adjust progress based on current stage
          for (const [key, p] of Object.entries(stepProgresses)) {
            if (stepMsg.includes(key)) {
              setProgress(prevP => Math.max(prevP, p));
              break;
            }
          }
        });

        if (isCancelled) return;

        setRepoData(result);
        setProgress(100);
        setCompleted(true);
        setLogs(prev => [...prev.slice(-6), 'WORKSPACE READY — 100% Analyzed']);

        // Update recents
        try {
          const key = 'repopilot_recent_repos';
          const recents: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = recents.filter(u => u !== activeRepo);
          filtered.unshift(activeRepo);
          localStorage.setItem(key, JSON.stringify(filtered.slice(0, 5)));
        } catch {
          // ignore
        }

        setTimeout(() => {
          navigate('/app');
        }, 900);
      } catch (err: any) {
        console.error('[AnalyzingPage] analysis failed:', err);
        if (isCancelled) return;
        const msg = err.message || 'Analysis failed. Could not inspect repository.';
        setLogs(prev => [...prev, `Error: ${msg}`]);
        setErrorMessage(msg);
      }
    }

    runAnalysis();

    return () => {
      isCancelled = true;
    };
  }, [activeRepo, navigate, setRepoData]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 space-y-6 border-accent-cyan/30 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1 uppercase">
                INDEXING &amp; ANALYZING REPOSITORY
              </div>
              <div className="font-mono text-sm font-semibold text-accent-cyan truncate max-w-xs">
                {activeRepo}
              </div>
            </div>
            <div className={`text-sm font-mono font-semibold ${completed ? 'text-success' : 'text-accent-cyan'}`}>
              {progress}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-elevated rounded-full overflow-hidden border border-border/40">
            <motion.div
              className={`h-full rounded-full ${completed ? 'bg-success' : 'bg-gradient-to-r from-accent-cyan to-accent-violet'}`}
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Scanning line */}
          {!completed && <ScanningLine />}

          {/* Dynamic real-time step log */}
          <div className="space-y-2 min-h-[180px]">
            <AnimatePresence>
              {logs.map((logMsg, i) => {
                const isLast = i === logs.length - 1;
                const isReady = logMsg.includes('WORKSPACE READY');
                return (
                  <motion.div
                    key={`${i}-${logMsg}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: isLast ? 1 : 0.45, x: 0 }}
                    className={`flex items-center gap-2.5 font-mono text-xs ${
                      isReady ? 'text-success font-semibold' :
                      isLast && !completed ? 'text-accent-cyan' :
                      'text-text-secondary'
                    }`}
                  >
                    <span className={`shrink-0 ${isReady ? 'text-success' : isLast ? 'text-accent-cyan' : 'text-text-secondary'}`}>
                      {isReady ? '✓' : isLast ? '›' : '•'}
                    </span>
                    <span className="truncate">{logMsg}</span>
                    {isLast && !completed && (
                      <span className="inline-block w-1.5 h-3 bg-accent-cyan animate-blink shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 bg-error/10 border border-error/30 p-3.5 rounded text-xs font-mono"
            >
              <div className="flex items-start gap-2 text-error">
                <span className="font-bold shrink-0">✕</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-3 py-1.5 rounded bg-surface border border-border text-text-primary hover:bg-elevated transition-colors text-xs"
                >
                  ← Back to Home
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/25 transition-colors text-xs"
                >
                  Retry Analysis
                </button>
              </div>
            </motion.div>
          )}

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-success text-xs font-mono bg-success/10 border border-success/30 p-2.5 rounded"
            >
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <span>Real repository architecture indexed — redirecting to workspace...</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
