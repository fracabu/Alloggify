/**
 * Email Verification Endpoint
 * GET /api/auth/verify?token=xxx
 *
 * Verifies user email with token from registration email
 */

import type { VercelRequest, VercelResponse} from '@vercel/node';
import { verifyUserEmail, logUserAction } from '../../lib/db';
import { getIpAddress, getUserAgent } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    // ========================================
    // 1. VALIDATION
    // ========================================

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Token di verifica mancante'
      });
    }

    // ========================================
    // 2. VERIFY EMAIL
    // ========================================

    const user = await verifyUserEmail(token);

    if (!user) {
      return res.status(400).json({
        error: 'Invalid token',
        message: 'Token non valido o scaduto. Richiedi un nuovo link di verifica.'
      });
    }

    // ========================================
    // 3. LOG ACTION
    // ========================================

    await logUserAction({
      userId: user.id,
      action: 'email_verified',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // ========================================
    // 4. RETURN SUCCESS
    // ========================================

    console.log(`✅ Email verified for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Email verificata con successo! Ora puoi effettuare il login.',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified
      }
    });

  } catch (error: any) {
    console.error('❌ Email verification error:', error);

    return res.status(500).json({
      error: 'Server error',
      message: 'Errore durante la verifica. Riprova più tardi.'
    });
  }
}
