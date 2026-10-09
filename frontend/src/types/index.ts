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
  license?: string;
  auditAdvisory?: string;
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QAAnswer {
  question: string;
  explanation: string;
  relevantFiles: Array<{ path: string; description: string }>;
  relevantFunctions?: Array<{ name: string; file: string }>;
  developerBenefits?: string[];
  userBenefits?: string[];
  userFlowSteps?: Array<{ step: number; title: string; description: string }>;
  confidence: 'high' | 'medium' | 'low';
  suggestedFollowUps?: string[];
}

export interface UserFlowStep {
  step: number;
  phase: string;
  title: string;
  description: string;
  userAction: string;
  systemAction: string;
  keyFiles: string[];
  outcome: string;
}

export interface ProjectSummaryData {
  projectName: string;
  repoOwner: string;
  tagline: string;
  motto: string;
  executiveSummary: string;
  howItWorks: string;
  developerBenefits: Array<{ title: string; description: string; metric?: string }>;
  userBenefits: Array<{ title: string; description: string; metric?: string }>;
  userFlowSteps: UserFlowStep[];
  technicalArchitecture: Array<{
    tier: string;
    description: string;
    technologies: string[];
    entryFiles: string[];
  }>;
  keyHighlights: string[];
  metricsOverview: {
    totalFiles: number;
    linesOfCode: number;
    dependencies: number;
    language: string;
  };
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

export interface RepoAnalysisResult {
  repository: Repository;
  metrics: RepositoryMetrics;
  architectureNodes: ArchitectureNode[];
  dependenciesList: Dependency[];
  envVariables: EnvVariable[];
  setupSteps: SetupStep[];
  starterTasks: StarterTask[];
  gitInsights?: GitInsights;
  message?: string;
}

export type FeedbackCategory =
  | 'feature'
  | 'ui_ux'
  | 'agent_ai'
  | 'performance'
  | 'integration'
  | 'other';

export type FeedbackStatus = 'under_review' | 'planned' | 'in_progress' | 'completed';

export interface UserFeedback {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  submittedBy: string;
  userHandle?: string;
  createdAt: string;
  votes: number;
  hasVoted?: boolean;
  status: FeedbackStatus;
  priority?: 'low' | 'medium' | 'high';
  adminNote?: string;
}

export interface TrackedRepository {
  id: string;
  url: string;
  name: string;
  owner: string;
  language?: string;
  analyzedAt: string;
  analysisCount: number;
  lastAnalyzedAt: string;
  stars?: number;
  totalFiles?: number;
  linesOfCode?: number;
  status: 'complete' | 'analyzing' | 'error';
}

export interface AdminStats {
  totalRepositories: number;
  totalAnalyses: number;
  uniqueUsers: number;
  totalFeedback: number;
  totalVotes: number;
  topLanguages: Array<{ language: string; count: number }>;
}


