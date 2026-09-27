import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Repository, RepositoryMetrics, ArchitectureNode, Dependency, EnvVariable, SetupStep, StarterTask } from '../types';

export interface RepoAnalysisResult {
  repository: Repository;
  metrics: RepositoryMetrics;
  architectureNodes: ArchitectureNode[];
  dependenciesList: Dependency[];
  envVariables: EnvVariable[];
  setupSteps: SetupStep[];
  starterTasks: StarterTask[];
  message?: string;
}

interface RepoContextValue {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  repoData: RepoAnalysisResult | null;
  setRepoData: (data: RepoAnalysisResult | null) => void;
}

const RepoContext = createContext<RepoContextValue>({
  repoUrl: '',
  setRepoUrl: () => {},
  repoData: null,
  setRepoData: () => {},
});

export function RepoProvider({ children }: { children: ReactNode }) {
  const [repoUrl, setRepoUrlState] = useState<string>(() => {
    return localStorage.getItem('repopilot_active_url') || '';
  });

  const [repoData, setRepoDataState] = useState<RepoAnalysisResult | null>(() => {
    try {
      const saved = localStorage.getItem('repopilot_analysis_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setRepoUrl = (url: string) => {
    setRepoUrlState(url);
    localStorage.setItem('repopilot_active_url', url);
  };

  const setRepoData = (data: RepoAnalysisResult | null) => {
    setRepoDataState(data);
    if (data) {
      try {
        localStorage.setItem('repopilot_analysis_data', JSON.stringify(data));
      } catch {
        // quota exceeded or storage disabled
      }
    } else {
      localStorage.removeItem('repopilot_analysis_data');
    }
  };

  return (
    <RepoContext.Provider value={{ repoUrl, setRepoUrl, repoData, setRepoData }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  return useContext(RepoContext);
}
