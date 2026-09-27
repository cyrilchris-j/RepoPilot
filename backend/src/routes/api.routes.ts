import { Router } from 'express';
import { analyzeDebug, answerQuestion, analyzeRepository, getFileContent } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze', analyzeRepository);
router.post('/debug', analyzeDebug);
router.post('/ask', answerQuestion);
router.get('/file', getFileContent);

export default router;
