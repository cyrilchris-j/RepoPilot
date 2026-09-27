import { createContext, useContext, useState, type ReactNode } from 'react';

interface RepoContextValue {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
}

const RepoContext = createContext<RepoContextValue>({
  repoUrl: '',
  setRepoUrl: () => {},
});

export function RepoProvider({ children }: { children: ReactNode }) {
  const [repoUrl, setRepoUrl] = useState('');
  return (
    <RepoContext.Provider value={{ repoUrl, setRepoUrl }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  return useContext(RepoContext);
}
