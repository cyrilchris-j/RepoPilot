import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, FileText, BarChart2, RotateCcw } from 'lucide-react';
import { FilePath } from '../components/ui/CodeBlock';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { QAAnswer } from '../types';

const DEMO_QA: Array<{ question: string; answer: QAAnswer }> = [
  {
    question: 'Where is authentication handled?',
    answer: {
      question: 'Where is authentication handled?',
      explanation: 'Authentication in this repository is handled by NextAuth.js, integrated at the Next.js middleware level. Incoming requests are intercepted before reaching route handlers. Session validation, JWT signing/verification, and OAuth provider configuration all live in the auth module. The middleware applies authentication guards globally, with per-route exceptions configured via matcher patterns.',
      relevantFiles: [
        { path: 'packages/next-auth/src/core/index.ts', description: 'Core auth engine — session creation, token signing, provider resolution' },
        { path: 'packages/next/src/server/middleware-routine.ts', description: 'Edge middleware — applies auth checks to incoming requests' },
        { path: 'packages/next-auth/src/providers/', description: 'OAuth provider configurations (GitHub, Google, credentials)' },
        { path: 'apps/docs/middleware.ts', description: 'Example: route-level matcher configuration' },
      ],
      relevantFunctions: [
        { name: 'NextAuth()', file: 'packages/next-auth/src/core/index.ts' },
        { name: 'getServerSession()', file: 'packages/next-auth/src/next/index.ts' },
        { name: 'withAuth()', file: 'packages/next-auth/src/next/middleware.ts' },
      ],
      confidence: 'high',
    },
  },
  {
    question: 'How does user registration work?',
    answer: {
      question: 'How does user registration work?',
      explanation: 'User registration depends on the authentication provider. For OAuth providers (GitHub, Google), registration is implicit — users are created on first login via the signIn callback. For credentials-based auth, the `authorize()` function in the credentials provider handles validation. User records are persisted to the database through Prisma in the `createUser` adapter method.',
      relevantFiles: [
        { path: 'packages/next-auth/src/providers/credentials.ts', description: 'Credentials provider — defines authorize() callback' },
        { path: 'packages/next-auth/src/core/callbacks.ts', description: 'signIn, session, and jwt callbacks' },
        { path: 'packages/adapter-prisma/src/index.ts', description: 'Prisma adapter — createUser, linkAccount methods' },
        { path: 'prisma/schema.prisma', description: 'User, Account, Session data models' },
      ],
      relevantFunctions: [
        { name: 'authorize()', file: 'packages/next-auth/src/providers/credentials.ts' },
        { name: 'createUser()', file: 'packages/adapter-prisma/src/index.ts' },
        { name: 'signIn callback', file: 'packages/next-auth/src/core/callbacks.ts' },
      ],
      confidence: 'high',
    },
  },
  {
    question: 'Which API handles payments?',
    answer: {
      question: 'Which API handles payments?',
      explanation: 'No payment processing logic was detected in this repository. This is the Next.js framework repository itself, which does not include application-specific payment routes. If you are working on an application built with Next.js, payment handling would typically be implemented in your own API routes under `app/api/` or `pages/api/`. Look for Stripe, Paddle, or similar integrations in your own application layer.',
      relevantFiles: [
        { path: 'packages/next/src/server/route-modules/app-route/', description: 'App Router route module — where custom API routes are served from' },
      ],
      relevantFunctions: [],
      confidence: 'high',
    },
  },
  {
    question: 'Where is the database connected?',
    answer: {
      question: 'Where is the database connected?',
      explanation: 'Database connectivity is managed through Prisma ORM. The Prisma client is initialized as a singleton to avoid exhausting database connections in development (due to hot module reloading). The connection string is read from the DATABASE_URL environment variable. The adapter-prisma package provides the NextAuth.js adapter that bridges session storage to the database.',
      relevantFiles: [
        { path: 'prisma/schema.prisma', description: 'Data model definitions and database provider configuration' },
        { path: 'packages/adapter-prisma/src/index.ts', description: 'NextAuth Prisma adapter — session, user, account operations' },
        { path: 'apps/dev/lib/prisma.ts', description: 'Prisma client singleton (prevents hot-reload connection exhaustion)' },
      ],
      relevantFunctions: [
        { name: 'PrismaClient()', file: 'apps/dev/lib/prisma.ts' },
        { name: 'PrismaAdapter()', file: 'packages/adapter-prisma/src/index.ts' },
      ],
      confidence: 'high',
    },
  },
];

const EXAMPLE_QUESTIONS = [
  'Where is authentication handled?',
  'How does user registration work?',
  'Where is the database connected?',
  'Which API handles payments?',
];

function ConfidenceBar({ confidence }: { confidence: QAAnswer['confidence'] }) {
  const widths = { high: 'w-full', medium: 'w-2/3', low: 'w-1/3' };
  const colors = { high: 'bg-success', medium: 'bg-warning', low: 'bg-error' };
  const labels = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] font-mono text-text-secondary tracking-widest">CONFIDENCE</div>
      <div className="flex-1 h-1 rounded-full bg-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.6 }}
          className={`h-full rounded-full ${colors[confidence]} ${widths[confidence]}`}
          style={{ width: undefined }}
        />
      </div>
      <div className={`text-[10px] font-mono ${colors[confidence].replace('bg-', 'text-')}`}>{labels[confidence]}</div>
    </div>
  );
}

export function AskPage() {
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState<QAAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QAAnswer[]>([]);

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const match = DEMO_QA.find(q =>
      question.toLowerCase().includes(q.question.toLowerCase().split(' ').slice(2).join(' ').toLowerCase()) ||
      q.question.toLowerCase().includes(question.toLowerCase().split(' ').slice(1, 4).join(' ').toLowerCase())
    ) || DEMO_QA[Math.floor(Math.random() * DEMO_QA.length)];

    const result = { ...match.answer, question };
    setAnswer(result);
    setHistory(prev => [result, ...prev.slice(0, 4)]);
    setLoading(false);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(input);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="section-label mb-1">Ask Codebase</div>
        <h1 className="text-xl font-semibold text-text-primary">ASK YOUR CODEBASE</h1>
        <p className="text-sm text-text-secondary mt-1">
          Ask a natural language question about this repository. RepoPilot answers with file-level context.
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-5 border-accent-cyan/20"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk(input);
              }
            }}
            placeholder="What would you like to understand about this codebase?"
            rows={3}
            className="w-full bg-elevated border border-border rounded p-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-cyan/50 resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-text-secondary font-mono">
              Press <kbd className="px-1.5 py-0.5 bg-elevated rounded text-[10px] border border-border">Enter</kbd> to ask
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><span className="w-3 h-3 rounded-full border-2 border-bg border-t-transparent animate-spin" /> Thinking...</>
              ) : (
                <><Send size={13} /> Ask</>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Example questions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        {EXAMPLE_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => { setInput(q); handleAsk(q); }}
            className="text-xs font-mono px-3 py-1.5 rounded border border-border text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan transition-all"
          >
            {q}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card p-6 flex items-center gap-3"
          >
            <StatusBadge status="analyzing" label="SEARCHING CODEBASE" />
            <span className="text-xs text-text-secondary font-mono">Scanning files and building answer...</span>
          </motion.div>
        )}

        {!loading && answer && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Question echo */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded bg-elevated border border-border flex items-center justify-center shrink-0 mt-0.5">
                <MessageCircle size={13} className="text-text-secondary" />
              </div>
              <div className="text-sm text-text-secondary italic">{answer.question}</div>
            </div>

            {/* Answer */}
            <div className="card p-5 space-y-4">
              {/* Explanation */}
              <div>
                <div className="section-label mb-2">Explanation</div>
                <p className="text-sm text-text-primary leading-relaxed">{answer.explanation}</p>
              </div>

              {/* Confidence */}
              <ConfidenceBar confidence={answer.confidence} />

              {/* Relevant files */}
              {answer.relevantFiles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={13} className="text-text-secondary" />
                    <span className="section-label">Relevant Files</span>
                  </div>
                  <div className="space-y-2">
                    {answer.relevantFiles.map(f => (
                      <div key={f.path} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 py-2 border-b border-border/40 last:border-0">
                        <div className="sm:w-72 shrink-0">
                          <FilePath path={f.path} />
                        </div>
                        <div className="text-xs text-text-secondary leading-relaxed">{f.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant functions */}
              {answer.relevantFunctions && answer.relevantFunctions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 size={13} className="text-text-secondary" />
                    <span className="section-label">Key Functions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {answer.relevantFunctions.map(fn => (
                      <div key={fn.name} className="px-2.5 py-1 rounded border border-border bg-elevated">
                        <span className="font-mono text-xs text-accent-cyan">{fn.name}</span>
                        <span className="text-[10px] text-text-secondary ml-2">{fn.file.split('/').pop()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="section-label">Session History</div>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1"
            >
              <RotateCcw size={10} /> Clear
            </button>
          </div>
          <div className="space-y-2">
            {history.slice(1).map((h, i) => (
              <button
                key={i}
                onClick={() => setAnswer(h)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-colors"
              >
                <MessageCircle size={11} className="shrink-0" />
                {h.question}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
