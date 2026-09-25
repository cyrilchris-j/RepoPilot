import { Request, Response } from 'express';
import { generateWithWatsonx } from '../services/watsonx';

export async function analyzeDebug(req: Request, res: Response): Promise<void> {
  const { errorMessage, repositoryContext } = req.body;

  if (!errorMessage) {
    res.status(400).json({ error: 'errorMessage is required' });
    return;
  }

  const systemPrompt = `You are RepoPilot's debug agent. Analyze software errors with precision.
Respond with valid JSON only, no markdown fences:
{
  "errorType": "name of error class",
  "likelyCause": "1-2 sentence root cause",
  "relevantFile": "most likely file path",
  "whyItHappens": "technical explanation (2-3 sentences)",
  "suggestedFix": "actionable fix instructions (2-4 sentences)",
  "verifyCommand": "command to verify fix",
  "confidence": "high|medium|low"
}`;

  const userMessage = `Error: ${errorMessage}${repositoryContext ? `\n\nRepository context: ${repositoryContext}` : ''}`;

  try {
    const rawResponse = await generateWithWatsonx(systemPrompt, userMessage);
    const parsed = JSON.parse(rawResponse);
    res.json({ analysis: parsed });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: String(err) });
  }
}

export async function answerQuestion(req: Request, res: Response): Promise<void> {
  const { question, repositoryContext } = req.body;

  if (!question) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  const systemPrompt = `You are RepoPilot's codebase Q&A agent. Answer questions about codebases clearly.
Respond with valid JSON only:
{
  "explanation": "clear explanation (2-4 sentences)",
  "relevantFiles": [{"path": "file/path.ts", "description": "why relevant"}],
  "relevantFunctions": [{"name": "functionName()", "file": "file/path.ts"}],
  "confidence": "high|medium|low"
}`;

  const userMessage = `Question: ${question}${repositoryContext ? `\n\nRepository context: ${repositoryContext}` : ''}`;

  try {
    const rawResponse = await generateWithWatsonx(systemPrompt, userMessage);
    const parsed = JSON.parse(rawResponse);
    res.json({ answer: { ...parsed, question } });
  } catch (err) {
    res.status(500).json({ error: 'Q&A failed', details: String(err) });
  }
}

export async function analyzeRepository(req: Request, res: Response): Promise<void> {
  const { repositoryUrl } = req.body;

  if (!repositoryUrl) {
    res.status(400).json({ error: 'repositoryUrl is required' });
    return;
  }

  // Repository analysis orchestration — in production this would
  // clone, index, and analyze the actual repository
  // For the hackathon demo we return structured demo data
  res.json({
    status: 'complete',
    repository: {
      url: repositoryUrl,
      name: repositoryUrl.split('/').pop() || 'repository',
      owner: repositoryUrl.split('/').slice(-2)[0] || 'owner',
      branch: 'main',
      analyzedAt: new Date().toISOString(),
    },
    message: 'Repository analysis complete. Open the workspace to explore results.',
  });
}
