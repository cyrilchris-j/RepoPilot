import { Router } from 'express';
import {
  analyzeDebug,
  answerQuestion,
  analyzeRepository,
  getFileContent,
  explainFile,
  generateTaskPlan,
  getGitInsights,
  getProjectSummary,
} from '../controllers/ai.controller';
import { getDiagnostics } from '../controllers/diagnostics.controller';
import {
  getTrackedRepositories,
  recordTrackedRepository,
  deleteTrackedRepository,
  getAdminStats,
  verifyAdminPassword,
} from '../controllers/admin.controller';
import {
  getAllFeedback,
  createFeedback,
  voteFeedback,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public Developer AI & Repository Exploration routes
router.post('/analyze', analyzeRepository);
router.post('/debug', analyzeDebug);
router.post('/ask', answerQuestion);
router.get('/file', getFileContent);
router.post('/explain-file', explainFile);
router.post('/task-plan', generateTaskPlan);
router.get('/git-insights', getGitInsights);
router.get('/diagnostics', getDiagnostics);
router.post('/project-summary', getProjectSummary);
router.get('/project-summary', getProjectSummary);

// Public Feedback routes
router.get('/feedback', getAllFeedback);
router.post('/feedback', createFeedback);
router.post('/feedback/:id/vote', voteFeedback);

// Admin Authentication endpoint (rate-limited, issues crypto session token)
router.post('/admin/verify', verifyAdminPassword);

// Protected Admin Routes (Requires valid Authorization: Bearer <token>)
router.get('/admin/repositories', requireAdmin, getTrackedRepositories);
router.post('/admin/repositories', requireAdmin, recordTrackedRepository);
router.delete('/admin/repositories/:id', requireAdmin, deleteTrackedRepository);
router.get('/admin/stats', requireAdmin, getAdminStats);
router.patch('/admin/feedback/:id', requireAdmin, updateFeedback);
router.delete('/admin/feedback/:id', requireAdmin, deleteFeedback);

export default router;
