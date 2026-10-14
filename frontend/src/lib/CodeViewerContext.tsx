import { createContext, useContext, useState, type ReactNode } from 'react';

interface CodeViewerState {
  open: boolean;
  filePath: string;
  repoUrl?: string;
}

interface CodeViewerContextValue {
  viewerState: CodeViewerState;
  openFile: (filePath: string, repoUrl?: string) => void;
  closeFile: () => void;
}

const CodeViewerContext = createContext<CodeViewerContextValue>({
  viewerState: { open: false, filePath: '' },
  openFile: () => {},
  closeFile: () => {},
});

export function CodeViewerProvider({ children }: { children: ReactNode }) {
  const [viewerState, setViewerState] = useState<CodeViewerState>({
    open: false,
    filePath: '',
    repoUrl: undefined,
  });

  const openFile = (filePath: string, repoUrl?: string) => {
    setViewerState({ open: true, filePath, repoUrl });
  };

  const closeFile = () => {
    setViewerState(prev => ({ ...prev, open: false }));
  };

  return (
    <CodeViewerContext.Provider value={{ viewerState, openFile, closeFile }}>
      {children}
    </CodeViewerContext.Provider>
  );
}

export function useCodeViewer() {
  return useContext(CodeViewerContext);
}
