/**
 * Reset Password Endpoint
 * POST /api/auth/reset
 *
 * Resets user password with valid token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hashPassword, isStrongPassword, getIpAddress, getUserAgent } from '../../lib/auth';
import { resetPassword, logUserAction } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Token e nuova password sono obbligatori'
      });
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Validation error',
        message: passwordCheck.message
      });
    }

    // ========================================
    // 2. RESET PASSWORD
    // ========================================

    const newPasswordHash = await hashPassword(newPassword);

    const user = await resetPassword(token, newPasswordHash);

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Token non valido o scaduto. Richiedi un nuovo link di reset.'
      });
    }

    // ========================================
    // 3. LOG ACTION
    // ========================================

    await logUserAction({
      userId: user.id,
      action: 'password_reset_completed',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // ========================================
    // 4. RETURN SUCCESS
    // ========================================

    console.log(`✅ Password reset successful for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reimpostata con successo! Ora puoi effettuare il login con la nuova password.',
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('❌ Password reset error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: 'Errore durante il reset della password. Riprova più tardi.'
    });
  }
}
