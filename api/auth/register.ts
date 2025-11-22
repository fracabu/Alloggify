/**
 * User Registration Endpoint
 * POST /api/auth/register
 *
 * Creates new user account with email verification
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  hashPassword,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  getIpAddress,
  getUserAgent
} from '../../lib/auth';
import { createUser, getUserByEmail, logUserAction } from '../../lib/db';
import { sendVerificationEmail } from '../../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body if it's a string (Vercel sometimes sends body as string)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid JSON',
          message: 'Il corpo della richiesta non è un JSON valido'
        });
      }
    }

    const { email, password, fullName, companyName } = body;

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

    try {
      await sendVerificationEmail(email, fullName.trim(), verificationToken);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError: any) {
      // Log error but don't fail registration
      console.error('⚠️ Failed to send verification email:', {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        responseCode: emailError.responseCode,
        stack: emailError.stack
      });
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
