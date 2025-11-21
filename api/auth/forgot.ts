/**
 * Forgot Password Endpoint
 * POST /api/auth/forgot
 *
 * Sends password reset email with token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isValidEmail, generateRandomToken, getIpAddress, getUserAgent } from '../../lib/auth';
import { getUserByEmail, setPasswordResetToken, logUserAction } from '../../lib/db';
import { sendPasswordResetEmail } from '../../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email è obbligatoria'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email non valida'
      });
    }

    // ========================================
    // 2. CHECK IF USER EXISTS
    // ========================================

    const user = await getUserByEmail(email.toLowerCase());

    // SECURITY: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`⚠️ Password reset requested for non-existent email: ${email}`);

      // Log attempt
      await logUserAction({
        action: 'password_reset_failed',
        metadata: { email, reason: 'user_not_found' },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });

      // Return success anyway (security best practice)
      return res.status(200).json({
        success: true,
        message: 'Se l\'email esiste, riceverai un link per reimpostare la password.'
      });
    }

    // ========================================
    // 3. GENERATE RESET TOKEN
    // ========================================

    const resetToken = generateRandomToken();

    await setPasswordResetToken(email.toLowerCase(), resetToken);

    // ========================================
    // 4. SEND RESET EMAIL
    // ========================================

    try {
      await sendPasswordResetEmail(email, user.full_name, resetToken);
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send reset email:', emailError);
      // Don't fail the request - user can retry
    }

    // ========================================
    // 5. LOG ACTION
    // ========================================

    await logUserAction({
      userId: user.id,
      action: 'password_reset_requested',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // ========================================
    // 6. RETURN SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,
      message: 'Se l\'email esiste, riceverai un link per reimpostare la password.'
    });

  } catch (error: any) {
    console.error('❌ Forgot password error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: 'Errore durante la richiesta. Riprova più tardi.'
    });
  }
}
