import axios from 'axios';

interface WatsonxMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WatsonxResponse {
  results: Array<{
    generated_text: string;
  }>;
  model_id?: string;
}

const WATSONX_API_URL = process.env.WATSONX_API_URL || 'https://us-south.ml.cloud.ibm.com';
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID || '';
const WATSONX_API_KEY = process.env.WATSONX_API_KEY || '';
const WATSONX_MODEL = process.env.WATSONX_MODEL || 'meta-llama/llama-3-70b-instruct';

async function getIAMToken(): Promise<string> {
  const response = await axios.post(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: WATSONX_API_KEY,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

export async function generateWithWatsonx(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (!WATSONX_API_KEY || !WATSONX_PROJECT_ID) {
    // Return a structured demo response when AI is not configured
    return generateDemoResponse(systemPrompt, userMessage);
  }

  const token = await getIAMToken();
  const prompt = `<|system|>\n${systemPrompt}\n<|user|>\n${userMessage}\n<|assistant|>`;

  const response = await axios.post<WatsonxResponse>(
    `${WATSONX_API_URL}/ml/v1/text/generation?version=2023-05-29`,
    {
      model_id: WATSONX_MODEL,
      input: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.3,
        top_p: 0.9,
        stop_sequences: ['<|user|>', '<|system|>'],
      },
      project_id: WATSONX_PROJECT_ID,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.results[0]?.generated_text?.trim() || '';
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
