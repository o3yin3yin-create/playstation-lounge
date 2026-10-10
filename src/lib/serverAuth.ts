import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { UserRole } from '../types';

// Persistent server secret for HMAC signing
const SECRET_FILE = path.join(process.cwd(), 'data', '.security-secret');

function getOrCreateSecret(): string {
  try {
    const dir = path.dirname(SECRET_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(SECRET_FILE)) {
      const secret = fs.readFileSync(SECRET_FILE, 'utf-8').trim();
      if (secret.length >= 32) return secret;
    }
    const newSecret = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, newSecret, { mode: 0o600 });
    return newSecret;
  } catch {
    return 'fallback-clash-lounge-super-secret-key-salt-987123456';
  }
}

const SERVER_SECRET = getOrCreateSecret();

// In-Memory Rate Limiting for Login Attempts
interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute window
const BLOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes block after 5 failed attempts

export function checkRateLimit(ipOrIdentifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrIdentifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if blocked
  if (record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  // Check if window has expired
  if (now - record.firstAttempt > WINDOW_MS) {
    rateLimitMap.delete(ipOrIdentifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    const retryAfter = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds: retryAfter };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.attempts };
}

export function recordFailedAttempt(ipOrIdentifier: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrIdentifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    rateLimitMap.set(ipOrIdentifier, {
      attempts: 1,
      firstAttempt: now,
      blockedUntil: 0,
    });
  } else {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
      record.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

export function clearRateLimit(ipOrIdentifier: string): void {
  rateLimitMap.delete(ipOrIdentifier);
}

// Cryptographic Session Token Generation & Verification
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSessionToken(role: 'admin' | 'it'): string {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${role}:${issuedAt}:${expiresAt}:${nonce}`;
  
  const signature = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(payload)
    .digest('hex');

  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

export function verifySessionToken(token: string): { valid: boolean; role: 'admin' | 'it' | 'guest' } {
  if (!token || typeof token !== 'string') {
    return { valid: false, role: 'guest' };
  }

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parts = raw.split(':');
    if (parts.length !== 5) {
      return { valid: false, role: 'guest' };
    }

    const [role, issuedAtStr, expiresAtStr, nonce, signature] = parts;
    if (role !== 'admin' && role !== 'it') {
      return { valid: false, role: 'guest' };
    }

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return { valid: false, role: 'guest' };
    }

    const payload = `${role}:${issuedAtStr}:${expiresAtStr}:${nonce}`;
    const expectedSignature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const actualBuf = Buffer.from(signature, 'hex');

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return { valid: false, role: 'guest' };
    }

    return { valid: true, role: role as 'admin' | 'it' };
  } catch {
    return { valid: false, role: 'guest' };
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function extractTokenFromRequest(req: Request): string | null {
  // 1. From Cookie header
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith('clash_auth_token=')) {
      return decodeURIComponent(c.substring('clash_auth_token='.length));
    }
  }

  // 2. From Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring('Bearer '.length).trim();
  }

  return null;
}

export function authenticateRequest(req: Request): { authenticated: boolean; role: UserRole } {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return { authenticated: false, role: 'guest' };
  }
  const verified = verifySessionToken(token);
  return { authenticated: verified.valid, role: verified.role };
}
