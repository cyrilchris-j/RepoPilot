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

export interface QARequest {
  question: string;
  repositoryContext?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
