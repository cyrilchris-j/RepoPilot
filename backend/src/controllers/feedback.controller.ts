import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface UserFeedback {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  userHandle?: string;
  createdAt: string;
  votes: number;
  status: 'under_review' | 'planned' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  adminNote?: string;
}

const FEEDBACK_FILE = path.resolve(__dirname, '../../cache/user_feedback.json');

const SEED_FEEDBACK: UserFeedback[] = [];

const LEGACY_MOCK_FEEDBACK_IDS = new Set(['fb-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5', 'fb-6']);

function readFeedback(): UserFeedback[] {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      const dir = path.dirname(FEEDBACK_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed.filter((f: any) => f && !LEGACY_MOCK_FEEDBACK_IDS.has(f.id));
    }
    return [];
  } catch {
    return [];
  }
}

function writeFeedback(list: UserFeedback[]) {
  try {
    const dir = path.dirname(FEEDBACK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('[feedback.controller] Failed to write feedback:', err);
  }
}

export function getAllFeedback(_req: Request, res: Response) {
  try {
    const list = readFeedback();
    res.json({ status: 'ok', total: list.length, feedback: list });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read feedback', details: err.message });
  }
}

export function createFeedback(req: Request, res: Response) {
  try {
    const body = req.body;
    if (!body || !body.title || !body.description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const current = readFeedback();
    const newFeedback: UserFeedback = {
      id: body.id || `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category || 'feature',
      submittedBy: body.submittedBy?.trim() || 'Anonymous Developer',
      userHandle: body.userHandle?.trim() || '@developer',
      createdAt: body.createdAt || new Date().toISOString(),
      votes: body.votes !== undefined ? body.votes : 1,
      status: body.status || 'under_review',
      priority: body.priority || 'medium',
      adminNote: body.adminNote,
    };

    current.unshift(newFeedback);
    writeFeedback(current);

    return res.status(201).json({ status: 'ok', feedback: newFeedback });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create feedback', details: err.message });
  }
}

export function voteFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { increment = true } = req.body;
    const current = readFeedback();

    let targetItem: UserFeedback | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        const delta = increment ? 1 : -1;
        const votes = Math.max(0, item.votes + delta);
        targetItem = { ...item, votes };
        return targetItem;
      }
      return item;
    });

    if (!targetItem) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    writeFeedback(updated);
    return res.json({ status: 'ok', feedback: targetItem });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update vote', details: err.message });
  }
}

export function updateFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { status, adminNote } = req.body;
    const current = readFeedback();

    let updatedItem: UserFeedback | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...(status ? { status } : {}),
          ...(adminNote !== undefined ? { adminNote } : {}),
        };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    writeFeedback(updated);
    return res.json({ status: 'ok', feedback: updatedItem });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update feedback', details: err.message });
  }
}

export function deleteFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const current = readFeedback();
    const filtered = current.filter(item => item.id !== id);
    writeFeedback(filtered);
    return res.json({ status: 'ok', total: filtered.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete feedback', details: err.message });
  }
}
