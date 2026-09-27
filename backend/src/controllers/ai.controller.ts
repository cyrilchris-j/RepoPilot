import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generateWithWatsonx } from '../services/watsonx';
import {
  getOrCloneRepository,
  getCachedRepo,
  searchRepositoryCode,
} from '../services/repoManager';

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'tsx', '.js': 'javascript', '.jsx': 'jsx',
  '.json': 'json', '.md': 'markdown', '.py': 'python', '.go': 'go',
  '.rs': 'rust', '.java': 'java', '.html': 'html', '.css': 'css',
  '.scss': 'scss', '.yaml': 'yaml', '.yml': 'yaml', '.toml': 'toml',
  '.sh': 'bash', '.bash': 'bash', '.sql': 'sql', '.env': 'bash',
  '.graphql': 'graphql', '.prisma': 'prisma', '.c': 'c', '.cpp': 'cpp',
  '.h': 'c', '.rb': 'ruby',
};

export async function getFileContent(req: Request, res: Response): Promise<void> {
  const { repo, path: filePath } = req.query as { repo?: string; path?: string };

  if (!filePath) {
    res.status(400).json({ error: 'path query param is required' });
    return;
  }

  try {
    // Find the cached repo
    const repoData = getCachedRepo(repo) || getCachedRepo();
    if (!repoData) {
      res.status(404).json({ error: 'Repository not found in cache. Analyze a repository first.' });
      return;
    }

    // Sanitize path — prevent directory traversal
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(repoData.localPath, normalizedPath);

    // Ensure the resolved path is within the repo directory
    if (!fullPath.startsWith(path.resolve(repoData.localPath))) {
      res.status(403).json({ error: 'Access denied: path traversal detected' });
      return;
    }

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: `File not found: ${normalizedPath}` });
      return;
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) {
      res.status(400).json({ error: 'Path is not a file' });
      return;
    }
    if (stat.size > 500 * 1024) {
      res.status(413).json({ error: 'File too large to display (>500KB)' });
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const ext = path.extname(normalizedPath).toLowerCase();
    const language = LANGUAGE_MAP[ext] || 'text';
    const lines = content.split('\n');

    res.json({
      path: normalizedPath,
      content,
      language,
      lineCount: lines.length,
      sizeBytes: stat.size,
      repoName: repoData.name,
    });
  } catch (err) {
    console.error('[ai.controller] getFileContent error:', err);
    res.status(500).json({ error: 'Failed to read file', details: (err as Error).message });
  }
}

function cleanJsonResponse(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

export async function analyzeRepository(req: Request, res: Response): Promise<void> {
  const repositoryUrl = req.body.repositoryUrl || req.body.url || req.body.repoUrl;

  if (!repositoryUrl) {
    res.status(400).json({ error: 'repositoryUrl is required' });
    return;
  }

  try {
    console.log(`[ai.controller] Starting analysis for: ${repositoryUrl}`);
    const repoData = await getOrCloneRepository(repositoryUrl);

    res.json({
      status: 'complete',
      repository: {
        url: repoData.url,
        name: repoData.name,
        owner: repoData.owner,
        branch: repoData.branch,
        description: repoData.description,
        language: repoData.language,
        analyzedAt: repoData.analyzedAt,
        status: 'complete',
      },
      metrics: repoData.metrics,
      architectureNodes: repoData.architectureNodes,
      dependenciesList: repoData.dependenciesList,
      envVariables: repoData.envVariables,
      setupSteps: repoData.setupSteps,
      starterTasks: repoData.starterTasks,
      filesSummary: {
        totalFiles: repoData.files.length,
        topFiles: repoData.files.slice(0, 20).map(f => f.relativePath),
      },
      message: `Repository ${repoData.name} analyzed successfully.`,
    });
  } catch (err) {
    console.error('[ai.controller] Repository analysis error:', err);
    res.status(500).json({
      error: 'Repository analysis failed',
      details: (err as Error).message,
    });
  }
}

export async function answerQuestion(req: Request, res: Response): Promise<void> {
  const { question, repositoryContext } = req.body;

  if (!question) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  try {
    let repoData = getCachedRepo(repositoryContext);

    // If not cached, attempt to analyze the repository context or current workspace
    if (!repoData && repositoryContext) {
      try {
        repoData = await getOrCloneRepository(repositoryContext);
      } catch (err) {
        console.warn(`[ai.controller] Could not clone context:`, err);
      }
    }

    // Fallback: If still no repo, try analyzing current workspace repository
    if (!repoData) {
      try {
        repoData = await getOrCloneRepository('.');
      } catch {
        // ignore
      }
    }

    let codeContext = '';
    let relevantFilesList: Array<{ path: string; description: string }> = [];

    if (repoData) {
      const searchResult = searchRepositoryCode(repoData, question);
      codeContext = searchResult.contextString;
      relevantFilesList = searchResult.relevantFiles;
    } else {
      codeContext = repositoryContext || 'No repository files available.';
    }

    const systemPrompt = `You are RepoPilot's codebase Q&A agent.
Analyze the provided repository files and question carefully. Provide accurate, truthful explanations based strictly on the actual repository code.
Do not invent files or features that do not exist.
Respond with valid JSON only, without markdown formatting:
{
  "explanation": "clear, direct explanation (2-5 sentences) referencing actual code patterns found in the repository",
  "relevantFiles": [{"path": "file/path.ext", "description": "why relevant based on code"}],
  "relevantFunctions": [{"name": "functionName()", "file": "file/path.ext"}],
  "confidence": "high|medium|low"
}`;

    const userMessage = `Repository Code Context:
${codeContext}

User Question:
${question}`;

    console.log(`[ai.controller] Answering question: "${question}" with repo: ${repoData?.name || 'unknown'}`);

    const rawResponse = await generateWithWatsonx(systemPrompt, userMessage);
    let parsed: any;
    try {
      parsed = cleanJsonResponse(rawResponse);
    } catch {
      parsed = {
        explanation: rawResponse.slice(0, 300),
        relevantFiles: relevantFilesList,
        relevantFunctions: [],
        confidence: 'medium',
      };
    }

    // Ensure relevantFiles is populated if model returned empty
    if (!parsed.relevantFiles || parsed.relevantFiles.length === 0) {
      parsed.relevantFiles = relevantFilesList;
    }

    res.json({ answer: { ...parsed, question } });
  } catch (err) {
    console.error('[ai.controller] Q&A error:', err);
    res.status(500).json({ error: 'Q&A failed', details: (err as Error).message });
  }
}

export async function analyzeDebug(req: Request, res: Response): Promise<void> {
  const { errorMessage, repositoryContext } = req.body;

  if (!errorMessage) {
    res.status(400).json({ error: 'errorMessage is required' });
    return;
  }

  try {
    let repoData = getCachedRepo(repositoryContext);
    if (!repoData && repositoryContext) {
      try {
        repoData = await getOrCloneRepository(repositoryContext);
      } catch {
        // ignore
      }
    }
    if (!repoData) {
      try {
        repoData = await getOrCloneRepository('.');
      } catch {
        // ignore
      }
    }

    let codeContext = '';
    if (repoData) {
      const searchResult = searchRepositoryCode(repoData, errorMessage);
      codeContext = searchResult.contextString;
    } else {
      codeContext = repositoryContext || '';
    }

    const systemPrompt = `You are RepoPilot's debug agent. Analyze software errors against the actual repository files with precision.
Respond with valid JSON only, no markdown fences:
{
  "errorType": "name of error class",
  "likelyCause": "1-2 sentence root cause based on repository code",
  "relevantFile": "most likely file path from repository",
  "whyItHappens": "technical explanation (2-3 sentences)",
  "suggestedFix": "actionable fix instructions (2-4 sentences)",
  "verifyCommand": "command to verify fix",
  "confidence": "high|medium|low"
}`;

    const userMessage = `Repository Context:
${codeContext}

Error to Debug:
${errorMessage}`;

    const rawResponse = await generateWithWatsonx(systemPrompt, userMessage);
    const parsed = cleanJsonResponse(rawResponse);
    res.json({ analysis: parsed });
  } catch (err) {
    console.error('[ai.controller] Debug analysis error:', err);
    res.status(500).json({ error: 'Analysis failed', details: (err as Error).message });
  }
}
