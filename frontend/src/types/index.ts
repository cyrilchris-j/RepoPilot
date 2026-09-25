export interface Repository {
  url: string;
  name: string;
  owner: string;
  branch: string;
  description?: string;
  language?: string;
  stars?: number;
  analyzedAt?: string;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
}

export interface RepositoryMetrics {
  totalFiles: number;
  dependencies: number;
  routes: number;
  modules: number;
  linesOfCode?: number;
  testCoverage?: number;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'frontend' | 'backend' | 'database' | 'service' | 'external' | 'auth' | 'config';
  technology?: string;
  filePath?: string;
  description?: string;
  children?: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Dependency {
  name: string;
  version: string;
  type: 'production' | 'development';
  status: 'ok' | 'outdated' | 'vulnerable' | 'unused';
  latestVersion?: string;
  description?: string;
}

export interface EnvVariable {
  name: string;
  required: boolean;
  detected: boolean;
  description?: string;
  example?: string;
}

export interface SetupStep {
  id: string;
  label: string;
  command?: string;
  status: 'ok' | 'warning' | 'error' | 'pending';
  description?: string;
  details?: string;
}

export interface DebugAnalysis {
  error: string;
  errorType: string;
  likelyCause: string;
  relevantFile?: string;
  whyItHappens: string;
  suggestedFix: string;
  verifyCommand?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface QAAnswer {
  question: string;
  explanation: string;
  relevantFiles: Array<{ path: string; description: string }>;
  relevantFunctions?: Array<{ name: string; file: string }>;
  confidence: 'high' | 'medium' | 'low';
}

export interface StarterTask {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  relevantFiles: string[];
  whyItMatters: string;
  nextStep: string;
  estimatedTime?: string;
  tags?: string[];
}

export interface AnalysisActivity {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AnalysisState {
  step: string;
  progress: number;
  log: string[];
}
