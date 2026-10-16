import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface ActiveToken {
  issuedAt: number;
  expiresAt: number;
}

// In-memory store of valid admin session tokens
const activeTokens = new Map<string, ActiveToken>();

// Token lifetime: 4 hours
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Periodically purge expired tokens every 15 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, meta] of activeTokens.entries()) {
    if (now > meta.expiresAt) {
      activeTokens.delete(token);
    }
  }
}, 15 * 60 * 1000).unref();

/**
 * Issue a cryptographically secure random admin token
 */
export function issueAdminToken(): string {
  const token = 'rp_adm_' + crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeTokens.set(token, {
    issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS,
  });
  return token;
}

/**
 * Revoke an existing admin token
 */
export function revokeAdminToken(token: string): void {
  activeTokens.delete(token);
}

/**
 * Check if a token is valid and unexpired
 */
export function isTokenValid(token: string): boolean {
  if (!token) return false;
  const meta = activeTokens.get(token);
  if (!meta) return false;
  if (Date.now() > meta.expiresAt) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}

/**
 * Express middleware to enforce admin authentication
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const adminApiKey = process.env.ADMIN_API_KEY;

  // Check optional server-to-server API key header
  const customHeader = req.headers['x-admin-key'];
  if (adminApiKey && typeof customHeader === 'string' && customHeader.length > 0) {
    if (crypto.timingSafeEqual(Buffer.from(customHeader), Buffer.from(adminApiKey))) {
      return next();
    }
  }

  // Check Bearer Token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Admin authentication required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!isTokenValid(token)) {
    res.status(403).json({
      error: 'Invalid or expired administrator token',
      code: 'TOKEN_INVALID',
    });
    return;
  }

  return next();
}
