import { Router } from 'express';
import {
  analyzeDebug,
  answerQuestion,
  analyzeRepository,
  getFileContent,
  explainFile,
  generateTaskPlan,
  getGitInsights,
} from '../controllers/ai.controller';
import { getDiagnostics } from '../controllers/diagnostics.controller';

const router = Router();

router.post('/analyze', analyzeRepository);
router.post('/debug', analyzeDebug);
router.post('/ask', answerQuestion);
router.get('/file', getFileContent);
router.post('/explain-file', explainFile);
router.post('/task-plan', generateTaskPlan);
router.get('/git-insights', getGitInsights);
router.get('/diagnostics', getDiagnostics);

export default router;
