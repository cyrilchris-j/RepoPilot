import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { MobileNav } from '../components/MobileNav';
import { CommandPalette } from '../components/CommandPalette';
import { OnboardingExportModal } from '../components/OnboardingExportButton';
import { useRepo } from '../lib/RepoContext';
import { Search, ExternalLink, FileCode2, MessageSquareCode } from 'lucide-react';

export function AppLayout() {
  const { repoUrl, repoData } = useRepo();
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  const displayName = (() => {
    if (repoData?.repository) {
      return `${repoData.repository.owner}/${repoData.repository.name}`;
    }
    const target = repoUrl || '';
    const clean = target.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '');
    return clean || 'workspace';
  })();

  const branch = repoData?.repository?.branch || 'main';

  const pageTitle = (() => {
    const p = location.pathname;
    if (p.includes('/summary'))      return 'Project Summary & User Flow';
    if (p.includes('/improvements')) return 'Improvement Feedback & Wishlist';
    if (p.includes('/architecture')) return 'Architecture';
    if (p.includes('/setup'))        return 'Environment & Setup';
    if (p.includes('/dependencies')) return 'Dependencies';
    if (p.includes('/debug'))        return 'Debug Agent';
    if (p.includes('/ask'))          return 'Codebase Assistant';
    if (p.includes('/tasks'))        return 'Starter Tasks';
    return 'Overview';
  })();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080A0F' }}>
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
        {/* Desktop Top Header */}
        <header
          className="hidden md:flex items-center justify-between px-5 py-2 shrink-0"
          style={{
            background: 'rgba(8, 10, 15, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white/25">{displayName}</span>
            <span className="text-white/15">/</span>
            <span className="text-white/70 font-medium">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search / Command Palette */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              <Search size={12} className="text-white/30 group-hover:text-blue-400 transition-colors" />
              <span className="text-white/30 group-hover:text-white/60 transition-colors text-[11px]">Search codebase, actions...</span>
              <kbd
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-md text-white/20 ml-1"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                ⌘K
              </kbd>
            </button>

            {/* Ask AI */}
            <Link
              to="/app/ask"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-150"
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: '#60A5FA',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.18)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.1)';
              }}
            >
              <MessageSquareCode size={12} />
              <span className="hidden lg:inline">Ask AI</span>
            </Link>

            {/* Export */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <FileCode2 size={12} className="text-blue-400" />
              <span className="hidden lg:inline font-mono text-[11px]">Export Handbook</span>
            </button>

            {/* GitHub link */}
            {repoUrl && (
              <a
                href={repoUrl.startsWith('http') ? repoUrl : `https://${repoUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.35)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                }}
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
        <main className="flex-1 overflow-y-auto" style={{ background: '#080A0F' }}>
          <Outlet />
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onTriggerExport={() => setIsExportModalOpen(true)}
      />

      <OnboardingExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
