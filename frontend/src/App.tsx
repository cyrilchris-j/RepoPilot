import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
          <Route path="setup" element={<SetupPage />} />
          <Route path="dependencies" element={<DependenciesPage />} />
          <Route path="debug" element={<DebugPage />} />
          <Route path="ask" element={<AskPage />} />
          <Route path="tasks" element={<StarterTasksPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
