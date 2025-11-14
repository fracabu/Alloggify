/**
 * User Registration Endpoint
 * POST /api/auth/register
 *
 * Creates new user account with email verification
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import {
  hashPassword,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  getIpAddress,
  getUserAgent
} from '../../lib/auth';
import { createUser, getUserByEmail, logUserAction } from '../../lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, fullName, companyName } = req.body;

    // ========================================
    // 1. VALIDATION
    // ========================================

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email, password e nome completo sono obbligatori'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email non valida'
      });
    }

    // Validate password strength
    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Validation error',
        message: passwordCheck.message
      });
    }

    // Validate name length
    if (fullName.trim().length < 2) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Nome completo deve essere almeno 2 caratteri'
      });
    }

    // ========================================
    // 2. CHECK IF USER EXISTS
    // ========================================

    const existingUser = await getUserByEmail(email.toLowerCase());

    if (existingUser) {
      return res.status(409).json({
        error: 'User exists',
        message: 'Un account con questa email esiste già'
      });
    }

    // ========================================
    // 3. CREATE USER
    // ========================================

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateRandomToken();

    // Create user in database
    const newUser = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      companyName: companyName?.trim(),
      verificationToken
    });

    // ========================================
    // 4. SEND VERIFICATION EMAIL
    // ========================================

    const verificationUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;

    try {
      await resend.emails.send({
        from: 'CheckInly <noreply@checkinly.com>', // Change this to your verified domain
        to: email,
        subject: '✅ Verifica il tuo account CheckInly',
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
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Benvenuto su CheckInly!</h1>
                </div>
                <div class="content">
                  <p>Ciao <strong>${fullName}</strong>,</p>
                  <p>Grazie per esserti registrato su CheckInly! Siamo felici di averti con noi.</p>
                  <p>Per completare la registrazione e iniziare a utilizzare tutte le funzionalità, verifica il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
                  <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">Verifica Email</a>
                  </div>
                  <p style="font-size: 12px; color: #666;">
                    Se il pulsante non funziona, copia e incolla questo link nel browser:<br>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                  </p>
                  <p style="margin-top: 30px;">
                    <strong>Il tuo piano:</strong> Free (5 scansioni al mese)<br>
                    <strong>Upgrade disponibile:</strong> Basic (€19/mese), Pro (€49/mese), Enterprise (€199/mese)
                  </p>
                  <p>Buon lavoro con CheckInly! 🚀</p>
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

      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('⚠️ Failed to send verification email:', emailError);
      // User can request resend later
    }

    // ========================================
    // 5. LOG ACTION & RETURN SUCCESS
    // ========================================

    // Log registration for analytics
    await logUserAction({
      userId: newUser.id,
      action: 'user_registered',
      metadata: { email, fullName, companyName },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    // Return success (don't send sensitive data!)
    return res.status(201).json({
      success: true,
      message: 'Registrazione completata! Controlla la tua email per verificare l\'account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        companyName: newUser.company_name,
        subscriptionPlan: newUser.subscription_plan,
        monthlyScanLimit: newUser.monthly_scan_limit
      }
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);

    // Check for database errors
    if (error.code === '23505') {
      // Unique violation (email already exists)
      return res.status(409).json({
        error: 'User exists',
        message: 'Un account con questa email esiste già'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      message: 'Errore durante la registrazione. Riprova più tardi.'
    });
  }
}
