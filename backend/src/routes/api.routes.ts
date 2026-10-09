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

const router = Router();

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


// Admin & Usage tracking routes
router.post('/admin/verify', verifyAdminPassword);
router.get('/admin/repositories', getTrackedRepositories);
router.post('/admin/repositories', recordTrackedRepository);
router.delete('/admin/repositories/:id', deleteTrackedRepository);
router.get('/admin/stats', getAdminStats);

// Community Improvement Suggestions & Feedback routes
router.get('/feedback', getAllFeedback);
router.post('/feedback', createFeedback);
router.post('/feedback/:id/vote', voteFeedback);
router.patch('/admin/feedback/:id', updateFeedback);
router.delete('/admin/feedback/:id', deleteFeedback);

export default router;
