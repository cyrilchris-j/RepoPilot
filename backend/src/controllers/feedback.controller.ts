import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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

const VALID_CATEGORIES = new Set(['bug', 'feature', 'improvement', 'other']);
const VALID_STATUSES = new Set(['under_review', 'planned', 'in_progress', 'completed']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);

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
      return parsed.filter((f: any) => f && typeof f.id === 'string');
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
    console.error('[feedback.controller] Failed to read feedback:', err);
    res.status(500).json({ error: 'Failed to read feedback' });
  }
}

export function createFeedback(req: Request, res: Response) {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Request body must be a valid JSON object' });
    }

    const rawTitle = typeof body.title === 'string' ? body.title.trim() : '';
    const rawDesc = typeof body.description === 'string' ? body.description.trim() : '';

    if (!rawTitle || !rawDesc) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (rawTitle.length > 200) {
      return res.status(400).json({ error: 'Title cannot exceed 200 characters' });
    }

    if (rawDesc.length > 2500) {
      return res.status(400).json({ error: 'Description cannot exceed 2500 characters' });
    }

    const category = typeof body.category === 'string' && VALID_CATEGORIES.has(body.category)
      ? body.category
      : 'feature';

    const submittedBy = typeof body.submittedBy === 'string'
      ? body.submittedBy.trim().slice(0, 50) || 'Anonymous Developer'
      : 'Anonymous Developer';

    const userHandle = typeof body.userHandle === 'string'
      ? body.userHandle.trim().slice(0, 30) || '@developer'
      : '@developer';

    const current = readFeedback();

    // Server-enforced secure properties:
    // Attacker cannot override ID, set arbitrary initial votes, set status, set priority, or inject adminNote
    const newFeedback: UserFeedback = {
      id: `fb-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      title: rawTitle,
      description: rawDesc,
      category,
      submittedBy,
      userHandle,
      createdAt: new Date().toISOString(),
      votes: 1,
      status: 'under_review',
      priority: 'medium',
      adminNote: undefined,
    };

    current.unshift(newFeedback);
    writeFeedback(current);

    return res.status(201).json({ status: 'ok', feedback: newFeedback });
  } catch (err: any) {
    console.error('[feedback.controller] Failed to create feedback:', err);
    return res.status(500).json({ error: 'Failed to create feedback' });
  }
}

export function voteFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const { increment = true } = req.body || {};
    const shouldIncrement = Boolean(increment);
    const current = readFeedback();

    let targetItem: UserFeedback | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        const delta = shouldIncrement ? 1 : -1;
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
    console.error('[feedback.controller] Failed to update vote:', err);
    return res.status(500).json({ error: 'Failed to update vote' });
  }
}

export function updateFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const { status, adminNote, priority } = req.body || {};
    const current = readFeedback();

    let updatedItem: UserFeedback | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        const newStatus = typeof status === 'string' && VALID_STATUSES.has(status)
          ? (status as UserFeedback['status'])
          : item.status;

        const newPriority = typeof priority === 'string' && VALID_PRIORITIES.has(priority)
          ? (priority as UserFeedback['priority'])
          : item.priority;

        const newAdminNote = typeof adminNote === 'string'
          ? adminNote.trim().slice(0, 1000)
          : item.adminNote;

        updatedItem = {
          ...item,
          status: newStatus,
          priority: newPriority,
          adminNote: newAdminNote,
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
    console.error('[feedback.controller] Failed to update feedback:', err);
    return res.status(500).json({ error: 'Failed to update feedback' });
  }
}

export function deleteFeedback(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'Invalid feedback ID' });
    }

    const current = readFeedback();
    const filtered = current.filter(item => item.id !== id);
    writeFeedback(filtered);
    return res.json({ status: 'ok', total: filtered.length });
  } catch (err: any) {
    console.error('[feedback.controller] Failed to delete feedback:', err);
    return res.status(500).json({ error: 'Failed to delete feedback' });
  }
}
