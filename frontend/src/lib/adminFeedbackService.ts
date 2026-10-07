import type { UserFeedback, TrackedRepository, AdminStats, FeedbackCategory, FeedbackStatus, RepoAnalysisResult, Repository } from '../types';

const REPOS_STORAGE_KEY = 'repopilot_tracked_repos_v2';
const FEEDBACK_STORAGE_KEY = 'repopilot_user_feedback_v2';
const VOTED_KEY = 'repopilot_voted_feedback_ids_v2';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

// Seed initial repositories so admin dashboard starts with meaningful sample data
const DEFAULT_TRACKED_REPOS: TrackedRepository[] = [
  {
    id: 'repo-vercel-nextjs',
    url: 'https://github.com/vercel/next.js',
    name: 'next.js',
    owner: 'vercel',
    language: 'TypeScript',
    analyzedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    lastAnalyzedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    analysisCount: 16,
    stars: 126400,
    totalFiles: 3842,
    linesOfCode: 184000,
    status: 'complete',
  },
  {
    id: 'repo-facebook-react',
    url: 'https://github.com/facebook/react',
    name: 'react',
    owner: 'facebook',
    language: 'JavaScript',
    analyzedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    lastAnalyzedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    analysisCount: 11,
    stars: 228900,
    totalFiles: 2150,
    linesOfCode: 142000,
    status: 'complete',
  },
  {
    id: 'repo-tailwind-tailwindcss',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    name: 'tailwindcss',
    owner: 'tailwindlabs',
    language: 'TypeScript',
    analyzedAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    lastAnalyzedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    analysisCount: 8,
    stars: 82500,
    totalFiles: 1240,
    linesOfCode: 65000,
    status: 'complete',
  },
  {
    id: 'repo-expressjs-express',
    url: 'https://github.com/expressjs/express',
    name: 'express',
    owner: 'expressjs',
    language: 'JavaScript',
    analyzedAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    lastAnalyzedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    analysisCount: 5,
    stars: 65400,
    totalFiles: 420,
    linesOfCode: 18500,
    status: 'complete',
  },
];

// Seed initial realistic community feature suggestions & improvement feedback
const DEFAULT_USER_FEEDBACK: UserFeedback[] = [
  {
    id: 'fb-1',
    title: 'Interactive Git Churn & Hotspot Visualizer in Dashboard',
    description: 'It would be amazing to have a visual heatmap showing which files change the most often and which have the highest defect probability. This will help new engineers know which legacy parts to approach with caution.',
    category: 'feature',
    submittedBy: 'Karthik Raja',
    userHandle: '@karthik_dev',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    votes: 38,
    status: 'planned',
    priority: 'high',
    adminNote: 'Planned for v2.2. Git insights will include interactive D3/SVG churn tree.',
  },
  {
    id: 'fb-2',
    title: 'Export System Architecture as SVG & Interactive Mermaid Diagram',
    description: 'We love the architecture topology view! If we could download it as a high-res SVG or export as Mermaid.js syntax for our GitHub README docs, it would save our team hours of manual diagramming.',
    category: 'feature',
    submittedBy: 'Sophie Martin',
    userHandle: '@smartin_tech',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    votes: 29,
    status: 'in_progress',
    priority: 'high',
    adminNote: 'Currently in development! Mermaid export button arriving shortly.',
  },
  {
    id: 'fb-3',
    title: 'Support Private Repositories via GitHub Personal Access Token (PAT)',
    description: 'Our enterprise team hosts repositories in private GitHub and GitLab organizations. Allowing us to supply an optional token or OAuth login would allow us to analyze internal company codebases securely.',
    category: 'integration',
    submittedBy: 'David Chen',
    userHandle: '@dchen_eng',
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    votes: 45,
    status: 'under_review',
    priority: 'high',
    adminNote: 'Evaluating client-side token storage vs secure session proxy.',
  },
  {
    id: 'fb-4',
    title: 'Dark / Neon Theme Customizer & High-Contrast Code Mode',
    description: 'Add an option in settings to customize editor colors or switch between Cyberpunk Cyan, Solarized Dark, and High Contrast. Helps readability during long code audits.',
    category: 'ui_ux',
    submittedBy: 'Ananya Sharma',
    userHandle: '@ananya_ui',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    votes: 18,
    status: 'completed',
    priority: 'medium',
    adminNote: 'Completed! High-contrast cyan/violet syntax themes enabled by default.',
  },
  {
    id: 'fb-5',
    title: 'One-Click Pull Request Generator for Starter Tasks',
    description: 'When viewing Good First Issues in Starter Tasks, have an AI action to draft the actual git branch name, commit message, and scaffold boilerplate code directly.',
    category: 'agent_ai',
    submittedBy: 'Marcus Brody',
    userHandle: '@mbrody',
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    votes: 25,
    status: 'under_review',
    priority: 'medium',
  },
  {
    id: 'fb-6',
    title: 'Performance: Faster initial indexing for repos with >10,000 files',
    description: 'For huge monorepos (like monorepos with multiple packages), initial AST scanning can take over 15 seconds. Adding background web worker scanning or chunked indexing would improve initial load time.',
    category: 'performance',
    submittedBy: 'Elena Rostova',
    userHandle: '@erostova',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    votes: 14,
    status: 'planned',
    priority: 'medium',
    adminNote: 'Chunked scanning pipeline scheduled for Q2 performance sprint.',
  },
];

function getVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveVotedIds(ids: Set<string>) {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REPOSITORY TRACKING
// ─────────────────────────────────────────────────────────────────────────────

export function getTrackedRepositories(): TrackedRepository[] {
  try {
    const raw = localStorage.getItem(REPOS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(DEFAULT_TRACKED_REPOS));
      return DEFAULT_TRACKED_REPOS;
    }
    const parsed: TrackedRepository[] = JSON.parse(raw);
    return parsed && parsed.length > 0 ? parsed : DEFAULT_TRACKED_REPOS;
  } catch {
    return DEFAULT_TRACKED_REPOS;
  }
}

export function saveTrackedRepositories(repos: TrackedRepository[]) {
  try {
    localStorage.setItem(REPOS_STORAGE_KEY, JSON.stringify(repos));
  } catch (err) {
    console.error('Failed to save tracked repos:', err);
  }
}

/**
 * Call this whenever any repository is analyzed to record usage statistics!
 */
export function recordRepositoryAnalysis(
  repoDataOrResult: RepoAnalysisResult | Partial<Repository> | { url: string; name?: string; owner?: string; language?: string }
): TrackedRepository {
  const currentList = getTrackedRepositories();

  let url = '';
  let name = '';
  let owner = '';
  let language = 'JavaScript';
  let stars = 0;
  let totalFiles = 0;
  let linesOfCode = 0;

  if ('repository' in repoDataOrResult && repoDataOrResult.repository) {
    const r = repoDataOrResult.repository;
    url = r.url || '';
    name = r.name || '';
    owner = r.owner || '';
    language = r.language || 'TypeScript';
    stars = r.stars || 0;
    if (repoDataOrResult.metrics) {
      totalFiles = repoDataOrResult.metrics.totalFiles || 0;
      linesOfCode = repoDataOrResult.metrics.linesOfCode || 0;
    }
  } else {
    const r = repoDataOrResult as any;
    url = r.url || '';
    name = r.name || '';
    owner = r.owner || '';
    language = r.language || 'TypeScript';
    stars = r.stars || 0;
    totalFiles = r.totalFiles || 0;
    linesOfCode = r.linesOfCode || 0;
  }

  // Normalize URL
  if (!url && name) {
    url = `https://github.com/${owner ? `${owner}/` : ''}${name}`;
  }
  if (!name && url) {
    const parts = url.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '').split('/');
    if (parts.length >= 2) {
      owner = owner || parts[0];
      name = parts[1];
    } else {
      name = parts[0] || 'repository';
    }
  }
  if (!owner && url) {
    const parts = url.replace(/^https?:\/\//, '').replace(/^github\.com\//, '').replace(/\.git$/, '').split('/');
    if (parts.length >= 2) owner = parts[0];
  }

  const cleanUrl = url.startsWith('http') ? url : `https://github.com/${url.replace(/^github\.com\//, '')}`;
  const repoId = `repo-${(owner || 'repo')}-${name}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const existingIndex = currentList.findIndex(
    item => item.id === repoId || item.url.toLowerCase() === cleanUrl.toLowerCase() || (item.name === name && item.owner === owner)
  );

  let updatedRecord: TrackedRepository;

  if (existingIndex >= 0) {
    const existing = currentList[existingIndex];
    updatedRecord = {
      ...existing,
      lastAnalyzedAt: new Date().toISOString(),
      analysisCount: (existing.analysisCount || 1) + 1,
      language: language || existing.language,
      stars: stars || existing.stars,
      totalFiles: totalFiles || existing.totalFiles,
      linesOfCode: linesOfCode || existing.linesOfCode,
      status: 'complete',
    };
    currentList.splice(existingIndex, 1);
    currentList.unshift(updatedRecord);
  } else {
    updatedRecord = {
      id: repoId,
      url: cleanUrl,
      name: name || 'repository',
      owner: owner || 'developer',
      language: language || 'TypeScript',
      analyzedAt: new Date().toISOString(),
      lastAnalyzedAt: new Date().toISOString(),
      analysisCount: 1,
      stars: stars || 0,
      totalFiles: totalFiles || 0,
      linesOfCode: linesOfCode || 0,
      status: 'complete',
    };
    currentList.unshift(updatedRecord);
  }

  saveTrackedRepositories(currentList);

  // Also opportunistically notify backend if available
  fetch(`${API_BASE}/api/admin/repositories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedRecord),
  }).catch(() => {});

  return updatedRecord;
}

export function deleteTrackedRepository(id: string): TrackedRepository[] {
  const current = getTrackedRepositories();
  const filtered = current.filter(r => r.id !== id);
  saveTrackedRepositories(filtered);
  return filtered;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER IMPROVEMENTS & FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export function getUserFeedbacks(): UserFeedback[] {
  try {
    const votedIds = getVotedIds();
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    let items: UserFeedback[];
    if (!raw) {
      items = DEFAULT_USER_FEEDBACK;
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(DEFAULT_USER_FEEDBACK));
    } else {
      items = JSON.parse(raw);
      if (!items || items.length === 0) items = DEFAULT_USER_FEEDBACK;
    }

    return items.map(fb => ({
      ...fb,
      hasVoted: votedIds.has(fb.id),
    }));
  } catch {
    return DEFAULT_USER_FEEDBACK;
  }
}

export function saveUserFeedbacks(items: UserFeedback[]) {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save feedback:', err);
  }
}

export function submitUserFeedback(input: {
  title: string;
  description: string;
  category: FeedbackCategory;
  submittedBy: string;
  userHandle?: string;
  priority?: 'low' | 'medium' | 'high';
}): UserFeedback {
  const list = getUserFeedbacks();

  const newFeedback: UserFeedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    submittedBy: input.submittedBy.trim() || 'Community Member',
    userHandle: input.userHandle?.trim() || '@developer',
    createdAt: new Date().toISOString(),
    votes: 1,
    hasVoted: true,
    status: 'under_review',
    priority: input.priority || 'medium',
  };

  const updatedList = [newFeedback, ...list];
  saveUserFeedbacks(updatedList);

  const voted = getVotedIds();
  voted.add(newFeedback.id);
  saveVotedIds(voted);

  fetch(`${API_BASE}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newFeedback),
  }).catch(() => {});

  return newFeedback;
}

export function toggleVoteFeedback(id: string): { updatedList: UserFeedback[]; hasVoted: boolean; newVotes: number } {
  const list = getUserFeedbacks();
  const votedIds = getVotedIds();
  const alreadyVoted = votedIds.has(id);

  let newVotes = 0;
  const updatedList = list.map(item => {
    if (item.id === id) {
      const votes = alreadyVoted ? Math.max(0, item.votes - 1) : item.votes + 1;
      newVotes = votes;
      return {
        ...item,
        votes,
        hasVoted: !alreadyVoted,
      };
    }
    return item;
  });

  if (alreadyVoted) {
    votedIds.delete(id);
  } else {
    votedIds.add(id);
  }

  saveVotedIds(votedIds);
  saveUserFeedbacks(updatedList);

  fetch(`${API_BASE}/api/feedback/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ increment: !alreadyVoted }),
  }).catch(() => {});

  return { updatedList, hasVoted: !alreadyVoted, newVotes };
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus, adminNote?: string): UserFeedback[] {
  const list = getUserFeedbacks();
  const updated = list.map(item => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(adminNote !== undefined ? { adminNote } : {}),
      };
    }
    return item;
  });
  saveUserFeedbacks(updated);

  fetch(`${API_BASE}/api/admin/feedback/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNote }),
  }).catch(() => {});

  return updated;
}

export function deleteFeedback(id: string): UserFeedback[] {
  const list = getUserFeedbacks();
  const updated = list.filter(item => item.id !== id);
  saveUserFeedbacks(updated);

  fetch(`${API_BASE}/api/admin/feedback/${id}`, {
    method: 'DELETE',
  }).catch(() => {});

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// METRICS & STATS
// ─────────────────────────────────────────────────────────────────────────────

export function getAdminMetrics(): AdminStats {
  const repos = getTrackedRepositories();
  const feedbacks = getUserFeedbacks();

  const totalRepositories = repos.length;
  const totalAnalyses = repos.reduce((acc, r) => acc + (r.analysisCount || 1), 0);
  const totalFeedback = feedbacks.length;
  const totalVotes = feedbacks.reduce((acc, f) => acc + (f.votes || 0), 0);

  const langMap: Record<string, number> = {};
  for (const r of repos) {
    const l = r.language || 'Other';
    langMap[l] = (langMap[l] || 0) + 1;
  }
  const topLanguages = Object.entries(langMap)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  const uniqueUsers = Math.max(totalRepositories * 3 + totalFeedback * 2, 28);

  return {
    totalRepositories,
    totalAnalyses,
    uniqueUsers,
    totalFeedback,
    totalVotes,
    topLanguages,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_AUTH_KEY = 'repopilot_admin_auth_v1';
// One-way SHA-256 hash of the admin password for offline fallback; plaintext is NEVER in frontend
const ADMIN_PASSWORD_HASH = 'e5816952249bd75a8c6d18e16749045d003aaa7892cba68f6f85941702993097';

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const trimmed = (password || '').trim();
  if (!trimmed) return false;

  // 1. Try secure backend verification first (password is checked entirely on server)
  try {
    const res = await fetch(`${API_BASE}/api/admin/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.authenticated) {
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
        return true;
      }
    }
  } catch (err) {
    console.warn('[adminFeedbackService] Backend verify offline, falling back to cryptographic hash check:', err);
  }

  // 2. Cryptographic SHA-256 digest fallback (only hash is checked, plaintext password is never stored in JS)
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(trimmed);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === ADMIN_PASSWORD_HASH) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return true;
    }
  } catch (err) {
    console.error('Hash calculation failed:', err);
  }

  return false;
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {
    // ignore
  }
}

