import { Router } from 'express';
import { analyzeDebug, answerQuestion, analyzeRepository } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze', analyzeRepository);
router.post('/debug', analyzeDebug);
router.post('/ask', answerQuestion);

export default router;
