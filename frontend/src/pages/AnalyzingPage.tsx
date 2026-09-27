import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanningLine } from '../components/ui/CodeBlock';
import { useRepo } from '../lib/RepoContext';

const ANALYSIS_STEPS = [
  'Connecting to repository...',
  'Cloning repository index...',
  'Scanning source files...',
  'Resolving dependency graph...',
  'Building architecture map...',
  'Detecting environment configuration...',
  'Analyzing authentication patterns...',
  'Indexing API routes...',
  'Running security audit...',
  'Generating developer workspace...',
  'WORKSPACE READY',
];

export function AnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { repoUrl, setRepoUrl, setRepoData } = useRepo();
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Support direct navigation with state (e.g. from LandingPage)
  const urlFromState = (location.state as { repoUrl?: string } | null)?.repoUrl || '';
  const activeRepo = urlFromState || repoUrl || 'github.com/vercel/next.js';

  useEffect(() => {
    // Save to context if arriving via state
    if (urlFromState && !repoUrl) setRepoUrl(urlFromState);
  }, [urlFromState, repoUrl, setRepoUrl]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Fire the backend analysis call
    fetch(`${apiUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repositoryUrl: activeRepo }),
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.repository) {
          setRepoData(data);
        }
      })
      .catch(err => {
        console.warn('[AnalyzingPage] backend analysis error:', err);
      });


    // Step animation
    let idx = 0;
    const durations = [600, 700, 900, 800, 900, 700, 600, 500, 700, 800, 500];
    const run = () => {
      if (idx >= ANALYSIS_STEPS.length - 1) {
        setStepIndex(idx);
        setCompleted(true);
        setTimeout(() => navigate('/app'), 1200);
        return;
      }
      setStepIndex(idx);
      const d = durations[idx] ?? 700;
      setTimeout(() => { idx++; run(); }, d);
    };
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [activeRepo, navigate]);

  const progress = Math.round((stepIndex / (ANALYSIS_STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-text-secondary tracking-widest mb-1">
                INDEXING REPOSITORY
              </div>
              <div className="font-mono text-sm text-accent-cyan truncate max-w-xs">
                {activeRepo}
              </div>
            </div>
            <div className={`text-sm font-mono font-semibold ${completed ? 'text-success' : 'text-accent-cyan'}`}>
              {progress}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-elevated rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${completed ? 'bg-success' : 'bg-accent-cyan'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Scanning line */}
          {!completed && <ScanningLine />}

          {/* Step log */}
          <div className="space-y-1.5 min-h-[200px]">
            <AnimatePresence>
              {ANALYSIS_STEPS.slice(0, stepIndex + 1).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: i === stepIndex ? 1 : 0.35, x: 0 }}
                  className={`flex items-center gap-3 font-mono text-xs ${
                    i === stepIndex && !completed ? 'text-accent-cyan' :
                    s === 'WORKSPACE READY' ? 'text-success font-semibold' :
                    'text-text-secondary'
                  }`}
                >
                  <span className={`shrink-0 ${
                    i < stepIndex ? 'text-success' :
                    i === stepIndex && !completed ? 'text-accent-cyan' : 'text-text-secondary'
                  }`}>
                    {i < stepIndex ? '✓' : i === stepIndex && !completed ? '›' : ' '}
                  </span>
                  {s}
                  {i === stepIndex && !completed && (
                    <span className="inline-block w-1.5 h-3 bg-accent-cyan animate-blink ml-0.5" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-success text-sm font-mono"
            >
              <span className="w-2 h-2 rounded-full bg-success" />
              Developer workspace ready — redirecting...
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
