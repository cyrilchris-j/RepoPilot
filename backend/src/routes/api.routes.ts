import { Router } from 'express';
import { analyzeDebug, answerQuestion, analyzeRepository, getFileContent } from '../controllers/ai.controller';
import { getDiagnostics } from '../controllers/diagnostics.controller';

const router = Router();

router.post('/analyze', analyzeRepository);
router.post('/debug', analyzeDebug);
router.post('/ask', answerQuestion);
router.get('/file', getFileContent);
router.get('/diagnostics', getDiagnostics);

export default router;
