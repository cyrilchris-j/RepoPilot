import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Activity,
  MessageSquareCode,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  Layers,
  Wifi,
  Battery,
} from 'lucide-react';

type TabType = 'arch' | 'debug' | 'ask' | 'tasks';

export function IPhoneShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('arch');
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [debugFixed, setDebugFixed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Mouse tilt physics for the 3D Apple device showcase
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Gentle tilt angle (max 5 degrees)
    setRotateX(-y * 0.015);
    setRotateY(x * 0.015);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Auto-switch tabs every 6 seconds if not manually interacted with recently
  useEffect(() => {
    if (!autoRotate) return;
    const tabs: TabType[] = ['arch', 'debug', 'ask', 'tasks'];
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const nextIdx = (tabs.indexOf(prev) + 1) % tabs.length;
        return tabs[nextIdx];
      });
    }, 6500);
    return () => clearInterval(timer);
  }, [autoRotate]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center py-6 select-none"
      style={{ perspective: 1200 }}
    >
      {/* Ambient glow behind the phone */}
      <div
        className="absolute w-[360px] h-[640px] rounded-full -z-10 pointer-events-none transition-all duration-700"
        style={{
          background:
            activeTab === 'arch'
              ? 'radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 75%)'
              : activeTab === 'debug'
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.16) 0%, rgba(245, 158, 11, 0.06) 50%, transparent 75%)'
              : activeTab === 'ask'
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.06) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(34, 211, 238, 0.06) 50%, transparent 75%)',
          filter: 'blur(50px)',
          transform: `translate(${rotateY * 4}px, ${-rotateX * 4}px)`,
        }}
      />

      {/* iPhone 16 Pro Chassis */}
      <motion.div
        animate={{ rotateX, rotateY }}
        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
        className="relative w-[340px] sm:w-[380px] h-[720px] rounded-[52px] p-[10px] shadow-[0_30px_90px_rgba(0,0,0,0.85)] border border-white/20"
        style={{
          background:
            'linear-gradient(145deg, #2A2C30 0%, #15161A 30%, #101115 70%, #202227 100%)',
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.15) inset,
            0 2px 4px rgba(255, 255, 255, 0.25) inset,
            0 -2px 4px rgba(0, 0, 0, 0.6) inset,
            0 35px 80px -15px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(59, 130, 246, 0.12)
          `,
        }}
      >
        {/* Hardware Action Button (Left side) */}
        <div
          className="absolute -left-[14px] top-[115px] w-[4px] h-[28px] rounded-l-md"
          style={{
            background: 'linear-gradient(to right, #40434A, #1C1E23)',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
          }}
        />

        {/* Volume Buttons (Left side) */}
        <div
          className="absolute -left-[14px] top-[160px] w-[4px] h-[50px] rounded-l-md"
          style={{
            background: 'linear-gradient(to right, #40434A, #1C1E23)',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
          }}
        />
        <div
          className="absolute -left-[14px] top-[225px] w-[4px] h-[50px] rounded-l-md"
          style={{
            background: 'linear-gradient(to right, #40434A, #1C1E23)',
            boxShadow: '-1px 0 2px rgba(0,0,0,0.5)',
          }}
        />

        {/* Side Power Button (Right side) */}
        <div
          className="absolute -right-[14px] top-[180px] w-[4px] h-[72px] rounded-r-md"
          style={{
            background: 'linear-gradient(to left, #40434A, #1C1E23)',
            boxShadow: '1px 0 2px rgba(0,0,0,0.5)',
          }}
        />

        {/* Inner Titanium Bezel & Concentric Edge */}
        <div className="relative w-full h-full rounded-[44px] overflow-hidden bg-black flex flex-col border border-white/[0.08]">
          {/* Glass Specular Glare (Top to Bottom Apple diagonal shine) */}
          <div
            className="absolute -inset-full pointer-events-none opacity-20 z-40 transform -rotate-45"
            style={{
              background:
                'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
            }}
          />

          {/* iOS Status Bar */}
          <div className="relative z-30 h-11 px-7 pt-3 flex items-center justify-between text-white text-[12px] font-semibold tracking-tight">
            <span>9:41</span>

            {/* Dynamic Island Pill */}
            <motion.div
              onClick={() => setIslandExpanded((prev) => !prev)}
              animate={{
                width: islandExpanded ? 240 : 108,
                height: islandExpanded ? 46 : 28,
                borderRadius: 24,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute left-1/2 -translate-x-1/2 top-2.5 bg-black border border-white/10 flex items-center justify-between px-3 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.9)] z-50 overflow-hidden"
            >
              {!islandExpanded ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="text-[10px] font-mono text-white/70">PRO AI</span>
                  </div>
                  {/* Camera lens & sensor dot */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" />
                      <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce delay-75" />
                      <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/20" />
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Terminal size={12} />
                    </div>
                    <div>
                      <div className="text-white font-medium text-[10px] leading-none">RepoPilot AI Active</div>
                      <div className="text-white/40 text-[9px] mt-0.5">3,842 files · watsonx</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    READY
                  </span>
                </div>
              )}
            </motion.div>

            {/* Right Icons: Wifi, Battery */}
            <div className="flex items-center gap-1.5 text-white/80">
              <span className="text-[10px] font-mono mr-0.5">5G</span>
              <Wifi size={13} />
              <Battery size={14} className="text-white" />
            </div>
          </div>

          {/* Screen Header inside Phone */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-blue-400 shadow-sm">
                <Terminal size={12} />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-white tracking-tight leading-none">
                  RepoPilot Pro
                </div>
                <div className="text-[9px] font-mono text-cyan-400/80 mt-0.5">
                  vercel/next.js
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Segmented Apple-Style Tabs */}
          <div className="p-2.5 bg-[#090B0F]/90 border-b border-white/[0.04]">
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              {[
                { id: 'arch', label: 'Arch', icon: <GitBranch size={11} /> },
                { id: 'debug', label: 'Debug', icon: <Activity size={11} /> },
                { id: 'ask', label: 'Ask AI', icon: <MessageSquareCode size={11} /> },
                { id: 'tasks', label: 'Tasks', icon: <ListTodo size={11} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setAutoRotate(false);
                    }}
                    className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-mono font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab.icon}
                    <span className="mt-0.5 text-[9px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Interactive Screen Content */}
          <div className="flex-1 p-3.5 overflow-hidden flex flex-col justify-between bg-gradient-to-b from-[#090B0F] to-[#040608]">
            <AnimatePresence mode="wait">
              {/* TAB 1: ARCHITECTURE MAP */}
              {activeTab === 'arch' && (
                <motion.div
                  key="arch"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5 flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">
                      Neural Topology
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">4 Modules Active</span>
                  </div>

                  {/* Visual Topology Diagram inside Phone */}
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex-1 flex flex-col justify-center items-center relative overflow-hidden">
                    {/* Animated Flow Packets */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute left-1/2 -translate-x-1/2 top-10 animate-ping opacity-75" />
                    </div>

                    <div className="w-full flex flex-col items-center gap-2 z-10">
                      {/* Node 1: Frontend */}
                      <div className="w-full p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers size={12} className="text-cyan-400" />
                          <span className="text-[11px] font-medium text-cyan-300">Next.js App Router</span>
                        </div>
                        <span className="text-[9px] font-mono text-cyan-400/70">Frontend</span>
                      </div>

                      {/* Connection Line */}
                      <div className="h-3 w-px bg-gradient-to-b from-cyan-400 to-indigo-400" />

                      {/* Node 2: Backend & AI */}
                      <div className="w-full p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu size={12} className="text-indigo-400" />
                          <span className="text-[11px] font-medium text-indigo-300">WatsonX LLM Pipeline</span>
                        </div>
                        <span className="text-[9px] font-mono text-indigo-400/70">Edge Engine</span>
                      </div>

                      {/* Connection Line */}
                      <div className="h-3 w-px bg-gradient-to-b from-indigo-400 to-emerald-400" />

                      {/* Node 3 & 4: Database & Auth */}
                      <div className="w-full grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col">
                          <div className="text-[10px] font-semibold text-emerald-400">PostgreSQL</div>
                          <div className="text-[8px] font-mono text-emerald-400/60">Prisma ORM</div>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col">
                          <div className="text-[10px] font-semibold text-amber-400">NextAuth v5</div>
                          <div className="text-[8px] font-mono text-amber-400/60">OAuth + JWT</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric pill */}
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40">Routes Detected</span>
                    <span className="text-white font-semibold">89 Endpoints</span>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: DEBUG AGENT */}
              {activeTab === 'debug' && (
                <motion.div
                  key="debug"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5 flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">
                      Error Diagnostics
                    </span>
                    <span className="text-[10px] font-mono text-rose-400">1 Issue Flagged</span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-medium text-rose-300">
                          Missing CORS Middleware
                        </div>
                        <div className="text-[9px] font-mono text-rose-300/60 mt-0.5">
                          api/v1/routes.ts:42
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fix preview box */}
                  <div className="p-2.5 rounded-2xl bg-black/60 border border-white/[0.08] flex-1 flex flex-col justify-between font-mono text-[10px]">
                    <div>
                      <div className="text-[9px] text-white/30 mb-1 flex items-center justify-between">
                        <span>SUGGESTED DIFF</span>
                        <span className="text-emerald-400">WATSONX RESOLUTION</span>
                      </div>
                      <div className="text-rose-400/80 leading-relaxed">- app.use(express.json())</div>
                      <div className="text-emerald-400 leading-relaxed">{"+ app.use(cors({ origin: '*' }))"}</div>
                      <div className="text-emerald-400 leading-relaxed">+ app.use(express.json())</div>
                    </div>

                    <button
                      onClick={() => setDebugFixed(true)}
                      className={`w-full mt-2 py-2 rounded-xl text-[10px] font-sans font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                        debugFixed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                      }`}
                    >
                      {debugFixed ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-400" />
                          Fix Applied & Verified!
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          Apply 1-Click AI Patch
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: ASK CODEBASE AI */}
              {activeTab === 'ask' && (
                <motion.div
                  key="ask"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2.5 flex-1 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">
                      Codebase Assistant
                    </span>
                    <span className="text-[10px] font-mono text-indigo-400">Granite 20B</span>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-2 flex-1 flex flex-col justify-center">
                    {/* User message */}
                    <div className="self-end max-w-[85%] p-2.5 rounded-2xl rounded-tr-sm bg-blue-600 text-white text-[11px] leading-relaxed shadow-sm">
                      Where is the authentication session verified?
                    </div>

                    {/* AI Response */}
                    <div className="self-start max-w-[90%] p-2.5 rounded-2xl rounded-tl-sm bg-white/[0.05] border border-white/[0.08] text-white/90 text-[10.5px] leading-relaxed">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-indigo-400 mb-1">
                        <Sparkles size={10} />
                        <span>RepoPilot Assistant</span>
                      </div>
                      Session check is implemented in{' '}
                      <span className="font-mono text-cyan-300 bg-cyan-950/40 px-1 rounded">
                        lib/auth/session.ts
                      </span>{' '}
                      via JWT cookies with 7-day expiration.
                    </div>
                  </div>

                  {/* Input Simulation */}
                  <div className="p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-white/30">
                    <span className="pl-2">Ask anything about this repo...</span>
                    <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <ArrowRight size={10} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: STARTER TASKS */}
              {activeTab === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2 flex-1 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase">
                      Ranked Starter Tasks
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">AI Curated</span>
                  </div>

                  {/* Task 1 */}
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        GOOD FIRST ISSUE
                      </span>
                      <span className="text-[9px] font-mono text-white/30">15 mins</span>
                    </div>
                    <div className="text-[11px] font-medium text-white">Add Redis rate limiting to /api/auth</div>
                    <div className="text-[9px] text-white/40 mt-0.5">Files: middleware.ts, auth.config.ts</div>
                  </div>

                  {/* Task 2 */}
                  <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        ARCHITECTURE
                      </span>
                      <span className="text-[9px] font-mono text-white/30">45 mins</span>
                    </div>
                    <div className="text-[11px] font-medium text-white">Migrate REST endpoints to Server Actions</div>
                    <div className="text-[9px] text-white/40 mt-0.5">Files: app/actions/repo.ts</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Apple Home Bar */}
            <div className="pt-2 flex justify-center">
              <div className="w-28 h-1 rounded-full bg-white/25" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
