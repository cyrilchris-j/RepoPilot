import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { generateWithWatsonx } from '../services/watsonx';
import {
  getOrCloneRepository,
  getCachedRepo,
  searchRepositoryCode,
  getGitInsightsForRepo,
} from '../services/repoManager';
import type { FileExplanation, TaskPlan, ChatMessage } from '../types';
import { saveTrackedRepoInternal } from './admin.controller';

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

    try {
      saveTrackedRepoInternal({
        url: repoData.url,
        name: repoData.name,
        owner: repoData.owner,
        language: repoData.language,
        totalFiles: repoData.files?.length || 0,
        linesOfCode: repoData.metrics?.linesOfCode || 0,
      });
    } catch {
      // ignore
    }

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
      gitInsights: repoData.gitInsights,
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
  const { question, repositoryContext, messages } = req.body as {
    question: string;
    repositoryContext?: string;
    messages?: ChatMessage[];
  };

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

    let historyContext = '';
    if (Array.isArray(messages) && messages.length > 0) {
      historyContext = '\n--- Prior Conversation Thread ---\n' +
        messages.slice(-6).map(m => `${m.role === 'user' ? 'Developer' : 'Assistant'}: ${m.content}`).join('\n') + '\n';
    }

    const systemPrompt = `You are RepoPilot's codebase Q&A agent.
Analyze the provided repository files and question carefully. Provide accurate, truthful explanations based strictly on the actual repository code.
Do not invent files or features that do not exist.
Respond with valid JSON only, without markdown formatting:
{
  "explanation": "clear, direct explanation (2-5 sentences) referencing actual code patterns found in the repository",
  "relevantFiles": [{"path": "file/path.ext", "description": "why relevant based on code"}],
  "relevantFunctions": [{"name": "functionName()", "file": "file/path.ext"}],
  "confidence": "high|medium|low",
  "suggestedFollowUps": ["Relevant follow-up question 1", "Relevant follow-up question 2"]
}`;

    const userMessage = `Repository Code Context:
${codeContext}
${historyContext}
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
        suggestedFollowUps: ['How do I run tests for this module?', 'Where is the data layer configured?'],
      };
    }

    // Ensure relevantFiles is populated if model returned empty
    if (!parsed.relevantFiles || parsed.relevantFiles.length === 0) {
      parsed.relevantFiles = relevantFilesList;
    }
    if (!parsed.suggestedFollowUps || parsed.suggestedFollowUps.length === 0) {
      parsed.suggestedFollowUps = [
        'Where is the entry point for this feature?',
        'How is error handling implemented here?',
      ];
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

export async function explainFile(req: Request, res: Response): Promise<void> {
  const { path: filePath, repo, codeSnippet } = req.body;

  if (!filePath) {
    res.status(400).json({ error: 'path is required' });
    return;
  }

  try {
    const repoData = getCachedRepo(repo) || getCachedRepo();
    let content = codeSnippet || '';
    if (!content && repoData) {
      const fullPath = path.join(repoData.localPath, filePath);
      if (fs.existsSync(fullPath)) {
        content = fs.readFileSync(fullPath, 'utf8');
      }
    }

    if (!content) {
      res.status(404).json({ error: `File content not found for ${filePath}` });
      return;
    }

    const lines = content.split('\n');
    const truncatedContent = lines.slice(0, 150).join('\n');

    const systemPrompt = `You are RepoPilot's expert code explainer agent.
Analyze the provided code file and provide a structured technical explanation for a new developer onboarding to this project.
Respond with valid JSON only, without markdown fences:
{
  "path": "${filePath}",
  "summary": "Concise 1-2 sentence description of what this file does and its core responsibility.",
  "architectureRole": "How this file fits into the broader architecture (e.g. API controller, UI component, utility, data model)",
  "keyExports": [
    {"name": "identifier or function()", "type": "function|component|hook|type|class|constant", "description": "short description"}
  ],
  "dependencies": ["primary imported packages or local modules"],
  "gotchas": [
    "1-2 essential tips, edge cases, or conventions for a developer modifying this file"
  ]
}`;

    const userMessage = `Repository: ${repoData?.name || 'project'}
File Path: ${filePath} (${lines.length} lines total)

Code:
\`\`\`
${truncatedContent}
\`\`\``;

    const raw = await generateWithWatsonx(systemPrompt, userMessage);
    let explanation: FileExplanation;
    try {
      explanation = cleanJsonResponse(raw);
    } catch {
      explanation = {
        path: filePath,
        summary: `Core module implementing ${path.basename(filePath)} logic for ${repoData?.name || 'this repository'}.`,
        architectureRole: filePath.includes('route') ? 'API Routing Layer' : (filePath.includes('component') ? 'UI Presentation Component' : 'Core Business Logic'),
        keyExports: [
          { name: path.basename(filePath).replace(/\.[^.]+$/, ''), type: 'module', description: 'Primary exported functionality' },
        ],
        dependencies: [repoData?.language || 'JavaScript'],
        gotchas: ['Verify type declarations and ensure accompanying unit tests are updated when modifying this file.'],
      };
    }

    res.json({ explanation });
  } catch (err) {
    console.error('[ai.controller] explainFile error:', err);
    res.status(500).json({ error: 'File explanation failed', details: (err as Error).message });
  }
}

export async function generateTaskPlan(req: Request, res: Response): Promise<void> {
  const { taskId, title, description, relevantFiles, repoContext } = req.body;

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  try {
    const repoData = getCachedRepo(repoContext) || getCachedRepo();
    let fileContexts = '';
    if (repoData && Array.isArray(relevantFiles)) {
      for (const rel of relevantFiles.slice(0, 3)) {
        try {
          const fullPath = path.join(repoData.localPath, rel);
          if (fs.existsSync(fullPath)) {
            const lines = fs.readFileSync(fullPath, 'utf8').split('\n').slice(0, 60).join('\n');
            fileContexts += `\n--- File: ${rel} ---\n${lines}\n`;
          }
        } catch {
          // ignore
        }
      }
    }

    const systemPrompt = `You are RepoPilot's senior engineer mentoring a new contributor.
Given a starter task for this repository, create an actionable step-by-step implementation plan, sample code diff template, suggested unit test, and draft PR description.
Respond with valid JSON only, without markdown fences:
{
  "taskId": "${taskId || 'task-1'}",
  "title": "${title}",
  "summary": "1-2 sentence overview of the recommended approach",
  "steps": [
    {"step": 1, "title": "Inspect & setup", "description": "what to check first", "targetFile": "file/path.ext"},
    {"step": 2, "title": "Implement core logic", "description": "exact change to make", "targetFile": "file/path.ext"},
    {"step": 3, "title": "Verify & test", "description": "how to test the change", "targetFile": "file/path.ext"}
  ],
  "codeSnippet": "// Actionable code diff or scaffolding template\\nexport function example() {\\n  // Implementation\\n}",
  "testSnippet": "// Suggested test case\\ndescribe('task implementation', () => {\\n  it('verifies expected behavior', () => {\\n    expect(true).toBe(true);\\n  });\\n});",
  "prDraft": {
    "title": "feat: ${title.toLowerCase()}",
    "body": "## Summary\\nImplements ${title}.\\n\\n## Proposed Changes\\n- Added logic in target files\\n- Added unit tests\\n\\n## How to Test\\nRun \`npm test\` or verify via local dev server."
  }
}`;

    const userMessage = `Repository: ${repoData?.name || 'project'}
Task Title: ${title}
Task Description: ${description || 'Starter task'}
Relevant Files: ${(relevantFiles || []).join(', ')}

Code Context:
${fileContexts || 'No file snippets available.'}`;

    const raw = await generateWithWatsonx(systemPrompt, userMessage);
    let plan: TaskPlan;
    try {
      plan = cleanJsonResponse(raw);
    } catch {
      plan = {
        taskId: taskId || 'task-1',
        title,
        summary: `Action plan for implementing "${title}" in ${repoData?.name || 'the codebase'}.`,
        steps: [
          { step: 1, title: 'Analyze existing implementation', description: 'Review the entry points and relevant files.', targetFile: relevantFiles?.[0] },
          { step: 2, title: 'Scaffold new functionality', description: 'Apply the necessary changes adhering to existing patterns.', targetFile: relevantFiles?.[0] },
          { step: 3, title: 'Execute verification tests', description: 'Run test suite and verify build passes cleanly.' },
        ],
        codeSnippet: `// Implementation template for: ${title}\n// Target: ${relevantFiles?.[0] || 'src/index.ts'}\n\nexport function runTaskVerification() {\n  console.log("Ready to implement ${title}");\n}`,
        testSnippet: `// Unit test verification\nimport { describe, it, expect } from 'vitest';\n\ndescribe('${title}', () => {\n  it('executes successfully', () => {\n    expect(true).toBe(true);\n  });\n});`,
        prDraft: {
          title: `feat: ${title.toLowerCase()}`,
          body: `## Summary\nImplements ${title}.\n\n## Changes\n- Updated ${relevantFiles?.join(', ') || 'codebase'}\n- Verified with test suite\n\n## Testing\nVerified locally.`,
        },
      };
    }

    res.json({ plan });
  } catch (err) {
    console.error('[ai.controller] generateTaskPlan error:', err);
    res.status(500).json({ error: 'Task plan generation failed', details: (err as Error).message });
  }
}

export async function getGitInsights(req: Request, res: Response): Promise<void> {
  const { repo } = req.query as { repo?: string };
  try {
    const repoData = getCachedRepo(repo) || getCachedRepo();
    if (!repoData) {
      res.status(404).json({ error: 'Repository not found in cache' });
      return;
    }
    const insights = getGitInsightsForRepo(repo) || repoData.gitInsights;
    res.json({ insights, repoName: repoData.name });
  } catch (err) {
    console.error('[ai.controller] getGitInsights error:', err);
    res.status(500).json({ error: 'Failed to get git insights', details: (err as Error).message });
  }
}

