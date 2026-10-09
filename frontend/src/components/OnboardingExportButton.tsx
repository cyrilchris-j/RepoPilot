import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, X, Eye, Download, Check, BookOpen } from 'lucide-react';
import { useOnboardingExport } from '../lib/useOnboardingExport';

interface OnboardingExportButtonProps {
  /** 'sidebar' = compact icon+label, 'header' = full button */
  variant?: 'sidebar' | 'header';
}

export function OnboardingExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { generate, download, repoName } = useOnboardingExport();
  const [activeTab, setActiveTab] = useState<'markdown' | 'script' | 'devcontainer'>('markdown');
  const [downloaded, setDownloaded] = useState(false);
  const [content, setContent] = useState('');

  // Generate content on open or when tab changes
  useEffect(() => {
    if (isOpen) {
      setContent(generate(activeTab));
    }
  }, [isOpen, activeTab, generate]);

  const handleDownload = () => {
    download(activeTab);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleDownloadAndClose = () => {
    download(activeTab);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  const fileLabel = activeTab === 'markdown' ? 'ONBOARDING.md' : activeTab === 'script' ? 'setup.sh' : 'devcontainer.json';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="ob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            key="ob-modal"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-12 lg:inset-16 z-50 flex flex-col rounded-xl border border-border bg-[#0d1117] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-[#161b22] shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff3b30] transition-colors group flex items-center justify-center"
                  >
                    <X size={7} className="opacity-0 group-hover:opacity-100 text-[#7a0a00]" />
                  </button>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-surface/80 p-0.5 rounded-lg border border-border/80">
                  <button
                    type="button"
                    onClick={() => setActiveTab('markdown')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'markdown'
                        ? 'bg-elevated text-accent-cyan font-medium border border-accent-cyan/30 shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Eye size={12} />
                    <span>ONBOARDING.md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('script')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'script'
                        ? 'bg-elevated text-accent-cyan font-medium border border-accent-cyan/30 shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span>⚡ setup.sh</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('devcontainer')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all ${
                      activeTab === 'devcontainer'
                        ? 'bg-elevated text-accent-cyan font-medium border border-accent-cyan/30 shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span>🐳 devcontainer.json</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-text-secondary hidden sm:inline">— {repoName}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadAndClose}
                  className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded transition-all ${
                    downloaded
                      ? 'bg-success/10 border border-success/30 text-success'
                      : 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20'
                  }`}
                >
                  {downloaded ? (
                    <><Check size={12} /> Saved!</>
                  ) : (
                    <><Download size={12} /> Download {fileLabel}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 font-mono">
              <div className="max-w-3xl mx-auto">
                {activeTab !== 'markdown' ? (
                  <pre className="text-xs leading-5 text-[#e2e8f0] bg-[#161b22] p-4 rounded-lg border border-border/80 overflow-x-auto whitespace-pre">
                    {content}
                  </pre>
                ) : (
                  <div className="text-[12.5px] leading-6 text-[#e2e8f0] whitespace-pre-wrap">
                    {content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) {
                        return (
                          <div key={i} className="text-xl font-bold text-white mb-2 mt-4 font-sans">
                            {line.replace(/^# /, '')}
                          </div>
                        );
                      }
                      if (line.startsWith('## ')) {
                        return (
                          <div key={i} className="text-base font-semibold text-accent-cyan mt-6 mb-2 font-sans border-b border-border pb-1">
                            {line.replace(/^## /, '')}
                          </div>
                        );
                      }
                      if (line.startsWith('### ')) {
                        return (
                          <div key={i} className="text-sm font-semibold text-text-primary mt-4 mb-1 font-sans">
                            {line.replace(/^### /, '')}
                          </div>
                        );
                      }
                      if (line.startsWith('---')) {
                        return <hr key={i} className="border-border my-4" />;
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <div key={i} className="pl-3 border-l-2 border-accent-cyan/40 text-text-secondary text-sm italic my-1 font-sans">
                            {line.replace(/^> /, '')}
                          </div>
                        );
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <div key={i} className="flex gap-2 text-sm text-text-secondary font-sans my-0.5">
                            <span className="text-accent-cyan shrink-0">•</span>
                            <span dangerouslySetInnerHTML={{
                              __html: line.replace(/^[-*] /, '').replace(/`([^`]+)`/g, '<code class="text-accent-cyan bg-accent-cyan/10 px-1 rounded text-[11px]">$1</code>')
                            }} />
                          </div>
                        );
                      }
                      if (line.startsWith('|')) {
                        return (
                          <div key={i} className="font-mono text-[11px] text-text-secondary my-0">
                            {line}
                          </div>
                        );
                      }
                      if (line.startsWith('```')) {
                        return (
                          <div key={i} className="font-mono text-[11px] text-[#4b5563]">{line}</div>
                        );
                      }
                      if (!line.trim()) {
                        return <div key={i} className="h-2" />;
                      }
                      return (
                        <div key={i} className="text-sm text-text-secondary font-sans my-0.5"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/`([^`]+)`/g, '<code class="text-accent-cyan bg-accent-cyan/10 px-1 rounded text-[11px] font-mono">$1</code>')
                              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-text-primary">$1</strong>')
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-[#161b22] shrink-0">
              <div className="text-[10px] font-mono text-[#4b5563]">
                {content.split('\n').length} lines · {(new TextEncoder().encode(content).length / 1024).toFixed(1)} KB · {activeTab === 'markdown' ? 'Markdown' : activeTab === 'script' ? 'Bash' : 'JSON'}
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className={`flex items-center gap-1.5 text-xs font-mono px-4 py-1.5 rounded transition-all ${
                  downloaded
                    ? 'bg-success/10 border border-success/30 text-success'
                    : 'bg-accent-cyan text-bg font-semibold hover:bg-accent-cyan/90'
                }`}
              >
                {downloaded ? (
                  <><Check size={12} /> Saved to {fileLabel}</>
                ) : (
                  <><Download size={12} /> Download {fileLabel}</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function OnboardingExportButton({ variant = 'sidebar' }: OnboardingExportButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-elevated transition-all group"
          title="Export ONBOARDING.md"
        >
          <BookOpen size={14} className="shrink-0 text-text-secondary group-hover:text-accent-cyan transition-colors" />
          <span className="text-[13px] font-medium">Export Handbook</span>
          <span className="ml-auto text-[10px] font-mono text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">.md</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded border border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/10 transition-all"
        >
          <FileDown size={15} />
          Export ONBOARDING.md
        </button>
      )}

      <OnboardingExportModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

