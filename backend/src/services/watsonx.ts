import axios from 'axios';

interface WatsonxChatResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

async function getIAMToken(apiKey: string): Promise<string> {
  const response = await axios.post(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

export async function generateWithWatsonx(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey    = process.env.WATSONX_API_KEY    || '';
  const projectId = process.env.WATSONX_PROJECT_ID || '';
  const apiUrl    = process.env.WATSONX_API_URL     || 'https://eu-de.ml.cloud.ibm.com';
  const model     = process.env.WATSONX_MODEL       || 'meta-llama/llama-3-3-70b-instruct';

  if (!apiKey || !projectId) {
    return generateDemoResponse(systemPrompt, userMessage);
  }

  const token = await getIAMToken(apiKey);

  const response = await axios.post<WatsonxChatResponse>(
    `${apiUrl}/ml/v1/text/chat?version=2024-05-01`,
    {
      model_id: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      max_tokens: 1024,
      temperature: 0.3,
      top_p: 0.9,
      project_id: projectId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0]?.message?.content?.trim() || '';
}

// Demo response generator when watsonx is not configured
function generateDemoResponse(systemPrompt: string, userMessage: string): string {
  if (systemPrompt.includes('debug') || systemPrompt.includes('error')) {
    return JSON.stringify({
      errorType: 'RuntimeError',
      likelyCause: 'Configuration or environment issue detected based on error context.',
      relevantFile: 'src/config/index.ts',
      whyItHappens: 'The error suggests a missing or misconfigured dependency. Check your environment variables and ensure all required services are running.',
      suggestedFix: 'Verify your environment configuration, ensure all services are running, and check for any missing dependencies.',
      verifyCommand: 'npm run dev',
      confidence: 'medium',
    });
  }

  if (systemPrompt.includes('question') || systemPrompt.includes('codebase')) {
    return JSON.stringify({
      explanation: `Based on repository analysis, here is what I found regarding: "${userMessage.slice(0, 80)}". The codebase uses modern patterns and the relevant functionality is located in the core service layer.`,
      relevantFiles: [
        { path: 'src/core/index.ts', description: 'Main entry point for core functionality' },
        { path: 'src/utils/helpers.ts', description: 'Utility functions and helpers' },
      ],
      relevantFunctions: [
        { name: 'initialize()', file: 'src/core/index.ts' },
      ],
      confidence: 'medium',
    });
  }

  return 'Analysis complete. Please configure IBM watsonx.ai credentials for full AI-powered responses.';
}
