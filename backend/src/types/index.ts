export interface AnalysisRequest {
  repositoryUrl: string;
  branch?: string;
}

export interface RepositoryInfo {
  url: string;
  name: string;
  owner: string;
  branch: string;
  description?: string;
  language?: string;
}

export interface DebugRequest {
  errorMessage: string;
  repositoryContext?: string;
  filePath?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QARequest {
  question: string;
  repositoryContext?: string;
  messages?: ChatMessage[];
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface GitHotspot {
  path: string;
  commits: number;
  churnScore: 'high' | 'medium' | 'low';
}

export interface ContributorInfo {
  name: string;
  commits: number;
  percentage: number;
}

export interface CommitSummary {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitInsights {
  hotspots: GitHotspot[];
  contributors: ContributorInfo[];
  recentCommits: CommitSummary[];
  totalCommits: number;
}

export interface FileExplanation {
  path: string;
  summary: string;
  architectureRole: string;
  keyExports: Array<{ name: string; type: string; description: string }>;
  dependencies: string[];
  gotchas: string[];
}

export interface TaskPlanStep {
  step: number;
  title: string;
  description: string;
  targetFile?: string;
}

export interface TaskPlan {
  taskId: string;
  title: string;
  summary: string;
  steps: TaskPlanStep[];
  codeSnippet: string;
  testSnippet: string;
  prDraft: {
    title: string;
    body: string;
  };
}

