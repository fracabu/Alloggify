/**
 * Authentication Utilities
 * JWT generation, password hashing, token validation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// JWT Secret (must be set in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days
const JWT_REFRESH_EXPIRES_IN = '30d'; // Refresh token expires in 30 days

export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionPlan: string;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'checkinly',
    audience: 'checkinly-users'
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'checkinly',
    audience: 'checkinly-users'
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'checkinly',
      audience: 'checkinly-users'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Generate random token (for email verification, password reset)
 */
export function generateRandomToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password deve essere lunga almeno 8 caratteri' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno una lettera maiuscola' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno una lettera minuscola' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password deve contenere almeno un numero' };
  }

  return { valid: true };
}

/**
 * Extract user ID from JWT token in request
 */
export function getUserIdFromRequest(req: any): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const payload = verifyToken(token);

  return payload ? payload.userId : null;
}

/**
 * Middleware: Verify authentication
 * Use this in API routes to protect endpoints
 */
export async function requireAuth(req: any, res: any, next?: () => void): Promise<JWTPayload | null> {
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    res.status(401).json({ error: 'Non autorizzato. Token mancante o non valido.' });
    return null;
  }

  const payload = verifyToken(req.headers.authorization.substring(7));

  if (!payload) {
    res.status(401).json({ error: 'Token non valido o scaduto' });
    return null;
  }

  // Attach user info to request for use in handler
  req.user = payload;

  if (next) next();

  return payload;
}

/**
 * Get IP address from request
 */
export function getIpAddress(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: any): string {
  return req.headers['user-agent'] || 'unknown';
}
