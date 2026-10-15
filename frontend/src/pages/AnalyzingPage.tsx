import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanningLine } from '../components/ui/CodeBlock';
import { useRepo } from '../lib/RepoContext';
import { analyzeRepositoryUniversal } from '../lib/repoAnalyzer';
import { recordRepositoryAnalysis } from '../lib/adminFeedbackService';

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

        // Update recents & track for Admin Dashboard
        try {
          const key = 'repopilot_recent_repos';
          const recents: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = recents.filter(u => u !== activeRepo);
          filtered.unshift(activeRepo);
          localStorage.setItem(key, JSON.stringify(filtered.slice(0, 5)));
        } catch {
          // ignore
        }

        try {
          recordRepositoryAnalysis(result);
        } catch (e) {
          console.warn('[AnalyzingPage] Failed to track repo for admin:', e);
        }

        setTimeout(() => {
          navigate('/app/summary');
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
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{ background: '#080A0F' }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-40%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '0', right: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="w-full max-w-lg relative">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 space-y-6 rounded-3xl"
          style={{
            background: 'rgba(10, 14, 22, 0.85)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono tracking-widest mb-1.5 uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                INDEXING &amp; ANALYZING REPOSITORY
              </div>
              <div className="font-mono text-sm font-semibold truncate max-w-xs" style={{ color: '#22D3EE' }}>
                {activeRepo}
              </div>
            </div>
            <div
              className="text-lg font-mono font-bold"
              style={{ color: completed ? '#10B981' : '#22D3EE' }}
            >
              {progress}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: completed ? '#10B981' : 'linear-gradient(90deg, #22D3EE, #6366F1)' }}
              initial={{ width: '15%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Scanning line */}
          {!completed && <ScanningLine />}

          {/* Log */}
          <div className="space-y-2 min-h-[180px]">
            <AnimatePresence>
              {logs.map((logMsg, i) => {
                const isLast = i === logs.length - 1;
                const isReady = logMsg.includes('WORKSPACE READY');
                return (
                  <motion.div
                    key={`${i}-${logMsg}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: isLast ? 1 : 0.35, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5 font-mono text-xs"
                    style={{
                      color: isReady ? '#10B981' : isLast && !completed ? '#22D3EE' : 'rgba(255,255,255,0.3)',
                      fontWeight: isReady ? 600 : 400,
                    }}
                  >
                    <span style={{ flexShrink: 0, color: isReady ? '#10B981' : isLast ? '#22D3EE' : 'rgba(255,255,255,0.2)' }}>
                      {isReady ? '✓' : isLast ? '›' : '•'}
                    </span>
                    <span className="truncate">{logMsg}</span>
                    {isLast && !completed && (
                      <span className="inline-block w-1.5 h-3 rounded-sm shrink-0 animate-blink" style={{ background: '#22D3EE' }} />
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
              className="space-y-3 p-4 rounded-2xl text-xs font-mono"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="flex items-start gap-2" style={{ color: '#FC8181' }}>
                <span className="font-bold shrink-0">✕</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  ← Back to Home
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', color: '#22D3EE' }}
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
              className="flex items-center gap-2.5 text-xs font-mono p-3 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34D399' }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
              <span>Real repository architecture indexed — redirecting to workspace...</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
