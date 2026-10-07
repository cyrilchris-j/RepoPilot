import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { MobileNav } from '../components/MobileNav';
import { CommandPalette } from '../components/CommandPalette';
import { OnboardingExportModal } from '../components/OnboardingExportButton';
import { useRepo } from '../lib/RepoContext';
import { Search, ExternalLink, BookOpen, MessageCircle } from 'lucide-react';

export function AppLayout() {
  const { repoUrl, repoData } = useRepo();
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse repo name from live analysis or repoUrl
  const displayName = (() => {
    if (repoData?.repository) {
      return `${repoData.repository.owner}/${repoData.repository.name}`;
    }
    const target = repoUrl || '';
    const clean = target.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '');
    return clean || 'workspace';
  })();

  const branch = repoData?.repository?.branch || 'main';

  // Current page breadcrumb title
  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes('/improvements')) return 'Improvement Feedback & Wishlist';
    if (p.includes('/architecture')) return 'Architecture';
    if (p.includes('/setup')) return 'Environment & Setup';
    if (p.includes('/dependencies')) return 'Dependencies';
    if (p.includes('/debug')) return 'Debug Agent';
    if (p.includes('/ask')) return 'Codebase Assistant';
    if (p.includes('/tasks')) return 'Starter Tasks';
    return 'Overview';
  })();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar
          repoName={displayName}
          repoBranch={branch}
          analysisStatus="complete"
          repoUrl={repoUrl}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-surface border-b border-border/80 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-secondary">{displayName}</span>
            <span className="text-text-secondary/50">/</span>
            <span className="text-text-primary font-medium">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Command Palette Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-elevated/70 hover:bg-elevated border border-border/70 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors group shadow-sm"
              title="Search files, tasks, actions (⌘K)"
            >
              <div className="flex items-center gap-2">
                <Search size={13} className="text-text-secondary group-hover:text-accent-cyan transition-colors" />
                <span className="text-[12px] font-sans">Search codebase, actions, tasks...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Quick Ask AI button */}
            <Link
              to="/app/ask"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 hover:border-accent-cyan/50 text-accent-cyan text-xs transition-colors"
              title="Ask Codebase AI"
            >
              <MessageCircle size={13} />
              <span className="hidden lg:inline text-[11px] font-mono font-medium">Ask AI</span>
            </Link>

            {/* Quick Export Handbook */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-elevated/50 hover:bg-elevated border border-border/60 hover:border-border text-text-secondary hover:text-text-primary text-xs transition-colors"
              title="Export ONBOARDING.md handbook"
            >
              <BookOpen size={13} className="text-accent-cyan" />
              <span className="hidden lg:inline text-[11px] font-mono">Export Handbook</span>
            </button>

            {/* GitHub external link if valid URL */}
            {repoUrl && (
              <a
                href={repoUrl.startsWith('http') ? repoUrl : `https://${repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-elevated/50 hover:bg-elevated border border-border/60 text-text-secondary hover:text-text-primary transition-colors"
                title="Open GitHub repository"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </header>

        {/* Mobile nav */}
        <div className="md:hidden">
          <MobileNav
            repoName={displayName}
            repoUrl={repoUrl}
            analysisStatus="complete"
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onTriggerExport={() => setIsExportModalOpen(true)}
      />

      {/* Global Onboarding Export Modal */}
      <OnboardingExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
