import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanningLine } from '../components/ui/CodeBlock';

const ANALYSIS_STEPS = [
  { step: 'Connecting to repository...', duration: 600 },
  { step: 'Cloning repository index...', duration: 700 },
  { step: 'Scanning source files...', duration: 900 },
  { step: 'Resolving dependency graph...', duration: 800 },
  { step: 'Building architecture map...', duration: 900 },
  { step: 'Detecting environment configuration...', duration: 700 },
  { step: 'Analyzing authentication patterns...', duration: 600 },
  { step: 'Indexing API routes...', duration: 500 },
  { step: 'Running security audit...', duration: 700 },
  { step: 'Generating developer workspace...', duration: 800 },
  { step: 'WORKSPACE READY', duration: 500 },
];

export function AnalyzingPage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let idx = 0;
    const run = () => {
      if (idx >= ANALYSIS_STEPS.length - 1) {
        setStepIndex(idx);
        setCompleted(true);
        setTimeout(() => navigate('/app'), 1200);
        return;
      }
      setStepIndex(idx);
      setTimeout(() => {
        idx++;
        run();
      }, ANALYSIS_STEPS[idx].duration);
    };
    const t = setTimeout(run, 200);
    return () => clearTimeout(t);
  }, [navigate]);

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
              <div className="font-mono text-sm text-accent-cyan">github.com/vercel/next.js</div>
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
                    s.step === 'WORKSPACE READY' ? 'text-success font-semibold' :
                    'text-text-secondary'
                  }`}
                >
                  <span className={`shrink-0 ${
                    i < stepIndex ? 'text-success' :
                    i === stepIndex && !completed ? 'text-accent-cyan' : 'text-text-secondary'
                  }`}>
                    {i < stepIndex ? '✓' : i === stepIndex && !completed ? '›' : ' '}
                  </span>
                  {s.step}
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
