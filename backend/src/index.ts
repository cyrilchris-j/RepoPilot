import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://repopilot20.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'RepoPilot API',
    timestamp: new Date().toISOString(),
    ai: process.env.WATSONX_API_KEY ? 'IBM watsonx.ai connected' : 'Demo mode (configure WATSONX_API_KEY)',
  });
});

app.use('/api', apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[RepoPilot API Error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[RepoPilot API] Running on http://localhost:${PORT}`);
  console.log(`[RepoPilot API] AI: ${process.env.WATSONX_API_KEY ? 'IBM watsonx.ai' : 'Demo mode'}`);
});

export default app;
