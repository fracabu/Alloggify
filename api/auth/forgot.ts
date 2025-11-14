/**
 * Forgot Password Endpoint
 * POST /api/auth/forgot
 *
 * Sends password reset email with token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { isValidEmail, generateRandomToken, getIpAddress, getUserAgent } from '../../lib/auth';
import { getUserByEmail, setPasswordResetToken, logUserAction } from '../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: 'CheckInly <onboarding@resend.dev>', // Using Resend's test domain (free tier)
        to: email,
        subject: '🔐 Reimposta la tua password - CheckInly',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #FF385C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                .button:hover { background: #e31c5f; }
                .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Reimposta Password</h1>
                </div>
                <div class="content">
                  <p>Ciao <strong>${user.full_name}</strong>,</p>
                  <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account CheckInly.</p>
                  <p>Clicca sul pulsante qui sotto per scegliere una nuova password:</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reimposta Password</a>
                  </div>
                  <p style="font-size: 12px; color: #666;">
                    Se il pulsante non funziona, copia e incolla questo link nel browser:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                  </p>
                  <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul style="margin: 5px 0;">
                      <li>Questo link scade tra <strong>1 ora</strong></li>
                      <li>Se non hai richiesto il reset, ignora questa email</li>
                      <li>Non condividere questo link con nessuno</li>
                    </ul>
                  </div>
                  <p style="margin-top: 30px; color: #666;">
                    Se non hai richiesto questa modifica, la tua password è al sicuro e puoi ignorare questa email.
                  </p>
                </div>
                <div class="footer">
                  <p>CheckInly - Semplifica la gestione degli alloggiati</p>
                  <p>Questo è un messaggio automatico, si prega di non rispondere.</p>
                </div>
              </div>
            </body>
          </html>
        `
      });

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
