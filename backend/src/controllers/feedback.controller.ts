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

const SEED_FEEDBACK: UserFeedback[] = [
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
];

function readFeedback(): UserFeedback[] {
  try {
    if (!fs.existsSync(FEEDBACK_FILE)) {
      const dir = path.dirname(FEEDBACK_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(SEED_FEEDBACK, null, 2), 'utf8');
      return SEED_FEEDBACK;
    }
    const data = fs.readFileSync(FEEDBACK_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_FEEDBACK;
  } catch {
    return SEED_FEEDBACK;
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
