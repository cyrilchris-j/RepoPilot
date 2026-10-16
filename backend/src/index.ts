import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. HTTP Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // API server does not serve HTML; allows frontend API communication
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Strict CORS Configuration
const allowedOriginRegexes = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, server-to-server or curl) in non-production
      if (!origin) {
        if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_NO_ORIGIN) {
          return callback(new Error('CORS: Missing Origin header is not allowed in production'), false);
        }
        return callback(null, true);
      }

      // Check configured FRONTEND_URL
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      // Check patterns
      const isAllowed = allowedOriginRegexes.some((regex) => regex.test(origin));
      if (isAllowed) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error('CORS: Access denied from this origin'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    credentials: true,
    maxAge: 86400, // Preflight cache 24h
  })
);

// 3. Rate Limiters
// General API rate limiter (250 requests per 15 minutes per IP)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

// Strict limiter for admin verification (prevents password brute forcing: 5 attempts per 15 mins)
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin authentication attempts. Please wait 15 minutes.' },
});

// Limiter for resource-heavy AI operations (30 requests per minute)
const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait a moment before trying again.' },
});

// Apply rate limiting
app.use('/api', globalApiLimiter);
app.use('/api/admin/verify', adminAuthLimiter);
app.use('/api/analyze', aiEndpointLimiter);
app.use('/api/ask', aiEndpointLimiter);
app.use('/api/debug', aiEndpointLimiter);
app.use('/api/task-plan', aiEndpointLimiter);
app.use('/api/explain-file', aiEndpointLimiter);
app.use('/api/project-summary', aiEndpointLimiter);

// 4. Request Body Size Limiting (Prevents payload inflation / memory bombing)
app.use(express.json({ limit: '1mb' }));

// 5. Sanitized Health Check (Does NOT reveal API key status or service configurations)
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'RepoPilot API',
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount API Routes
app.use('/api', apiRoutes);

// 7. 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 8. Centralized Secure Error Handler (Never discloses internal stack traces to clients)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[RepoPilot Error Caught]', err.message);
  if (err.message && err.message.includes('CORS:')) {
    res.status(403).json({ error: 'Forbidden by CORS policy' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[RepoPilot API] Running securely on port ${PORT}`);
});

export default app;
