import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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

const CACHE_FILE = path.resolve(__dirname, '../../cache/tracked_repos.json');

const SEED_REPOSITORIES: TrackedRepository[] = [];

const LEGACY_MOCK_REPO_IDS = new Set([
  'repo-vercel-nextjs',
  'repo-facebook-react',
  'repo-tailwind-tailwindcss',
  'repo-expressjs-express',
]);

function readRepos(): TrackedRepository[] {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      const dir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CACHE_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter((r: any) => r && !LEGACY_MOCK_REPO_IDS.has(r.id));
    }
    return [];
  } catch {
    return [];
  }
}

function writeRepos(repos: TrackedRepository[]) {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(repos, null, 2), 'utf8');
  } catch (err) {
    console.error('[admin.controller] Failed to write repos:', err);
  }
}

export function saveTrackedRepoInternal(repo: Partial<TrackedRepository>) {
  const current = readRepos();
  const url = (repo.url || '').trim();
  const name = repo.name || 'repository';
  const owner = repo.owner || 'developer';
  const id = repo.id || `repo-${owner}-${name}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const existingIdx = current.findIndex(
    r => r.id === id || (url && r.url.toLowerCase() === url.toLowerCase()) || (r.name === name && r.owner === owner)
  );

  let updated: TrackedRepository;
  if (existingIdx >= 0) {
    const existing = current[existingIdx];
    updated = {
      ...existing,
      ...repo,
      lastAnalyzedAt: new Date().toISOString(),
      analysisCount: (existing.analysisCount || 1) + 1,
      status: 'complete',
    };
    current.splice(existingIdx, 1);
    current.unshift(updated);
  } else {
    updated = {
      id,
      url: url.startsWith('http') ? url : `https://github.com/${owner}/${name}`,
      name,
      owner,
      language: repo.language || 'TypeScript',
      analyzedAt: new Date().toISOString(),
      lastAnalyzedAt: new Date().toISOString(),
      analysisCount: 1,
      stars: repo.stars || 0,
      totalFiles: repo.totalFiles || 0,
      linesOfCode: repo.linesOfCode || 0,
      status: 'complete',
    };
    current.unshift(updated);
  }

  writeRepos(current);
  return updated;
}

export function getTrackedRepositories(_req: Request, res: Response) {
  try {
    const repos = readRepos();
    res.json({
      status: 'ok',
      total: repos.length,
      repositories: repos,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch repositories', details: err.message });
  }
}

export function recordTrackedRepository(req: Request, res: Response) {
  try {
    const repo = req.body;
    if (!repo || (!repo.url && !repo.name)) {
      return res.status(400).json({ error: 'url or name is required' });
    }
    const saved = saveTrackedRepoInternal(repo);
    return res.json({ status: 'ok', repository: saved });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to save repository', details: err.message });
  }
}

export function deleteTrackedRepository(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const current = readRepos();
    const filtered = current.filter(r => r.id !== id);
    writeRepos(filtered);
    res.json({ status: 'ok', total: filtered.length, repositories: filtered });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete repository', details: err.message });
  }
}

export function getAdminStats(_req: Request, res: Response) {
  try {
    const repos = readRepos();
    const totalRepositories = repos.length;
    const totalAnalyses = repos.reduce((acc, r) => acc + (r.analysisCount || 0), 0);
    const uniqueUsers = totalRepositories === 0 ? 0 : Math.max(totalRepositories, Math.ceil(totalAnalyses * 0.7));

    const langMap: Record<string, number> = {};
    for (const r of repos) {
      const l = r.language || 'Other';
      langMap[l] = (langMap[l] || 0) + 1;
    }
    const topLanguages = Object.entries(langMap)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      status: 'ok',
      metrics: {
        totalRepositories,
        totalAnalyses,
        uniqueUsers,
        topLanguages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get stats', details: err.message });
  }
}

export function verifyAdminPassword(req: Request, res: Response) {
  try {
    const { password } = req.body || {};
    const expected = process.env.ADMIN_PASSWORD || 'MaxVerstappenTheDutchKing';
    if (!password || password !== expected) {
      return res.status(401).json({ authenticated: false, error: 'Invalid administrator password' });
    }
    const token = 'rp_admin_' + Buffer.from(`${Date.now()}:${Math.random()}`).toString('base64');
    return res.json({ authenticated: true, token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Verification failed', details: err.message });
  }
}

