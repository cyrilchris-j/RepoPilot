import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RepoProvider } from './lib/RepoContext';
import { CodeViewerProvider } from './lib/CodeViewerContext';
import { CodeViewerModal } from './components/CodeViewerModal';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AnalyzingPage } from './pages/AnalyzingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SetupPage } from './pages/SetupPage';
import { DependenciesPage } from './pages/DependenciesPage';
import { DebugPage } from './pages/DebugPage';
import { AskPage } from './pages/AskPage';
import { StarterTasksPage } from './pages/StarterTasksPage';
import { ImprovementsPage } from './pages/ImprovementsPage';
import { AdminPage } from './pages/AdminPage';
import { ProjectSummaryPage } from './pages/ProjectSummaryPage';

export default function App() {
  return (
    <RepoProvider>
      <CodeViewerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="summary" element={<ProjectSummaryPage />} />
              <Route path="improvements" element={<ImprovementsPage />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="setup" element={<SetupPage />} />
              <Route path="dependencies" element={<DependenciesPage />} />
              <Route path="debug" element={<DebugPage />} />
              <Route path="ask" element={<AskPage />} />
              <Route path="tasks" element={<StarterTasksPage />} />
            </Route>
          </Routes>
          <CodeViewerModal />
        </BrowserRouter>
      </CodeViewerProvider>
    </RepoProvider>
  );
}

