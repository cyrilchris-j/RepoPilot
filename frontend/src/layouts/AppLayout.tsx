import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { MobileNav } from '../components/MobileNav';
import { useRepo } from '../lib/RepoContext';
import { DEMO_REPO } from '../lib/demo-data';

export function AppLayout() {
  const { repoUrl } = useRepo();

  // Parse "github.com/owner/repo" or "https://github.com/owner/repo"
  const displayName = (() => {
    if (!repoUrl) return `${DEMO_REPO.owner}/${DEMO_REPO.name}`;
    const clean = repoUrl.replace(/^https?:\/\//, '').replace(/^github\.com\//, '');
    return clean || `${DEMO_REPO.owner}/${DEMO_REPO.name}`;
  })();

  const branch = DEMO_REPO.branch;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar
          repoName={displayName}
          repoBranch={branch}
          analysisStatus="complete"
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile nav */}
        <div className="md:hidden">
          <MobileNav
            repoName={displayName}
            analysisStatus="complete"
          />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
