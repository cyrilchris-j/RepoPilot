export function getApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    return envUrl || 'http://localhost:3001';
  }

  // Deployed (e.g. Vercel)
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return 'https://repopilot-backend-b295.onrender.com';
}
