/**
 * User Login Endpoint
 * POST /api/auth/login
 *
 * Authenticates user and returns JWT tokens
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  getIpAddress,
  getUserAgent
} from '../../lib/auth';
import { getUserByEmail, updateLastLogin, logUserAction } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email e password sono obbligatorie'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email non valida'
      });
    }

    // ========================================
    // 2. GET USER
    // ========================================

    const user = await getUserByEmail(email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email o password non corretti'
      });
    }

    // ========================================
    // 3. VERIFY PASSWORD
    // ========================================

    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Log failed login attempt
      await logUserAction({
        userId: user.id,
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email o password non corretti'
      });
    }

    // ========================================
    // 4. CHECK EMAIL VERIFICATION
    // ========================================

    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Devi verificare la tua email prima di accedere. Controlla la tua casella di posta.',
        requiresVerification: true
      });
    }

    // ========================================
    // 5. GENERATE JWT TOKENS
    // ========================================

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      subscriptionPlan: user.subscription_plan
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // ========================================
    // 6. UPDATE LAST LOGIN & LOG
    // ========================================

    await updateLastLogin(user.id);

    await logUserAction({
      userId: user.id,
      action: 'user_logged_in',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // ========================================
    // 7. RETURN SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,
      message: 'Login effettuato con successo!',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        companyName: user.company_name,
        subscriptionPlan: user.subscription_plan,
        subscriptionStatus: user.subscription_status,
        scanCount: user.scan_count,
        monthlyScanLimit: user.monthly_scan_limit,
        emailVerified: user.email_verified,
        createdAt: user.created_at
      }
    });

  } catch (error: any) {
    console.error('❌ Login error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: 'Errore durante il login. Riprova più tardi.'
    });
  }
}
