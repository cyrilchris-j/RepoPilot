import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { MobileNav } from '../components/MobileNav';
import { DEMO_REPO } from '../lib/demo-data';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <AppSidebar
          repoName={`${DEMO_REPO.owner}/${DEMO_REPO.name}`}
          repoBranch={DEMO_REPO.branch}
          analysisStatus="complete"
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile nav */}
        <div className="md:hidden">
          <MobileNav
            repoName={`${DEMO_REPO.owner}/${DEMO_REPO.name}`}
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
