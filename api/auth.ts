/**
 * Consolidated Authentication API
 * Endpoint: /api/auth?action=<action>
 *
 * Consolidates 7 auth functions into 1 mega-route to reduce Vercel function count
 *
 * Actions:
 * - login: User login with email/password
 * - register: New user registration + email verification
 * - verify: Email verification via token
 * - forgot: Password reset request
 * - reset: Password reset confirmation
 * - google: Google OAuth initiation
 * - google-callback: Google OAuth callback handler
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  comparePassword,
  hashPassword,
  generateAccessToken,
  generateRefreshToken,
  isValidEmail,
  isStrongPassword,
  generateRandomToken,
  getIpAddress,
  getUserAgent
} from '../lib/auth';
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateLastLogin,
  logUserAction
} from '../lib/db';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../lib/email';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get action from query params
  const action = (req.query.action as string)?.toLowerCase();

  if (!action) {
    return res.status(400).json({
      error: 'Missing action parameter',
      message: 'Specify ?action=login|register|verify|forgot|reset|google|google-callback'
    });
  }

  try {
    // Route to appropriate handler
    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'register':
        return await handleRegister(req, res);
      case 'verify':
        return await handleVerify(req, res);
      case 'forgot':
        return await handleForgotPassword(req, res);
      case 'reset':
        return await handleResetPassword(req, res);
      case 'google':
        return await handleGoogleAuth(req, res);
      case 'google-callback':
        return await handleGoogleCallback(req, res);
      default:
        return res.status(400).json({
          error: 'Invalid action',
          message: `Unknown action: ${action}`
        });
    }
  } catch (error: any) {
    console.error(`[Auth API] Error in action "${action}":`, error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Errore del server. Riprova più tardi.'
    });
  }
}

// ============================================
// LOGIN HANDLER
// ============================================
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Validation
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

  // Get user
  const user = await getUserByEmail(email.toLowerCase());

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: 'Email o password non corretti'
    });
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
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

  // Check email verification
  if (!user.email_verified) {
    return res.status(403).json({
      error: 'Email not verified',
      message: 'Devi verificare la tua email prima di accedere. Controlla la tua casella di posta.',
      requiresVerification: true
    });
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    subscriptionPlan: user.subscription_plan
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await updateLastLogin(user.id);

  await logUserAction({
    userId: user.id,
    action: 'user_logged_in',
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

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
}

// ============================================
// REGISTER HANDLER
// ============================================
async function handleRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body if string
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

  // Validation
  if (!email || !password || !fullName) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Email, password e nome completo sono obbligatori'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Email non valida'
    });
  }

  const passwordCheck = isStrongPassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({
      error: 'Validation error',
      message: passwordCheck.message
    });
  }

  if (fullName.trim().length < 2) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Nome completo deve essere almeno 2 caratteri'
    });
  }

  // Check if user exists
  const existingUser = await getUserByEmail(email.toLowerCase());

  if (existingUser) {
    return res.status(409).json({
      error: 'User exists',
      message: 'Esiste già un account con questa email'
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Generate verification token
  const verificationToken = generateRandomToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user
  const newUser = await createUser({
    email: email.toLowerCase(),
    passwordHash,
    fullName: fullName.trim(),
    companyName: companyName?.trim() || null,
    verificationToken,
    verificationExpires
  });

  // Send verification email
  try {
    await sendVerificationEmail({
      to: newUser.email,
      fullName: newUser.full_name,
      verificationToken
    });

    console.log(`✅ Verification email sent to ${newUser.email}`);
  } catch (emailError) {
    console.error('❌ Failed to send verification email:', emailError);
    // Don't fail registration if email fails
  }

  // Log action
  await logUserAction({
    userId: newUser.id,
    action: 'user_registered',
    metadata: {
      email: newUser.email,
      hasCompanyName: !!companyName
    },
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  return res.status(201).json({
    success: true,
    message: 'Registrazione completata! Controlla la tua email per verificare il tuo account.',
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      emailVerified: false
    }
  });
}

// ============================================
// VERIFY EMAIL HANDLER
// ============================================
async function handleVerify(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      error: 'Missing token',
      message: 'Token di verifica mancante'
    });
  }

  // Find user with token
  const { rows } = await sql`
    SELECT id, email, full_name, verification_token_expires, email_verified
    FROM users
    WHERE verification_token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return res.status(404).json({
      error: 'Invalid token',
      message: 'Token di verifica non valido o già utilizzato'
    });
  }

  const user = rows[0];

  // Check if already verified
  if (user.email_verified) {
    return res.status(400).json({
      error: 'Already verified',
      message: 'Email già verificata. Puoi effettuare il login.'
    });
  }

  // Check expiration
  const now = new Date();
  const expires = new Date(user.verification_token_expires);

  if (now > expires) {
    return res.status(410).json({
      error: 'Token expired',
      message: 'Token di verifica scaduto. Richiedi un nuovo link di verifica.'
    });
  }

  // Update user
  await sql`
    UPDATE users
    SET
      email_verified = TRUE,
      verification_token = NULL,
      verification_token_expires = NULL
    WHERE id = ${user.id}
  `;

  // Send welcome email
  try {
    await sendWelcomeEmail({
      to: user.email,
      fullName: user.full_name
    });
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  // Log action
  await logUserAction({
    userId: user.id,
    action: 'email_verified',
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  console.log(`✅ Email verified for user: ${user.email}`);

  return res.status(200).json({
    success: true,
    message: 'Email verificata con successo! Ora puoi effettuare il login.',
    user: {
      id: user.id,
      email: user.email,
      emailVerified: true
    }
  });
}

// ============================================
// FORGOT PASSWORD HANDLER
// ============================================
async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Email non valida'
    });
  }

  // Find user
  const user = await getUserByEmail(email.toLowerCase());

  // Always return success to prevent email enumeration
  const successResponse = {
    success: true,
    message: 'Se esiste un account con questa email, riceverai un link per reimpostare la password.'
  };

  if (!user) {
    // Still return 200 to prevent enumeration
    return res.status(200).json(successResponse);
  }

  // Generate reset token
  const resetToken = generateRandomToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Save token
  await sql`
    UPDATE users
    SET
      reset_password_token = ${resetToken},
      reset_password_expires = ${resetExpires.toISOString()}
    WHERE id = ${user.id}
  `;

  // Send email
  try {
    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.full_name,
      resetToken
    });

    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (emailError) {
    console.error('❌ Failed to send password reset email:', emailError);
  }

  // Log action
  await logUserAction({
    userId: user.id,
    action: 'password_reset_requested',
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  return res.status(200).json(successResponse);
}

// ============================================
// RESET PASSWORD HANDLER
// ============================================
async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Token e nuova password sono obbligatori'
    });
  }

  // Validate password
  const passwordCheck = isStrongPassword(newPassword);
  if (!passwordCheck.valid) {
    return res.status(400).json({
      error: 'Validation error',
      message: passwordCheck.message
    });
  }

  // Find user with token
  const { rows } = await sql`
    SELECT id, email, full_name, reset_password_expires
    FROM users
    WHERE reset_password_token = ${token}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return res.status(404).json({
      error: 'Invalid token',
      message: 'Token non valido o già utilizzato'
    });
  }

  const user = rows[0];

  // Check expiration
  const now = new Date();
  const expires = new Date(user.reset_password_expires);

  if (now > expires) {
    return res.status(410).json({
      error: 'Token expired',
      message: 'Token scaduto. Richiedi un nuovo link di reset.'
    });
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password and clear token
  await sql`
    UPDATE users
    SET
      password_hash = ${newPasswordHash},
      reset_password_token = NULL,
      reset_password_expires = NULL
    WHERE id = ${user.id}
  `;

  // Log action
  await logUserAction({
    userId: user.id,
    action: 'password_reset_completed',
    ipAddress: getIpAddress(req),
    userAgent: getUserAgent(req)
  });

  console.log(`✅ Password reset for user: ${user.email}`);

  return res.status(200).json({
    success: true,
    message: 'Password reimpostata con successo! Ora puoi effettuare il login.'
  });
}

// ============================================
// GOOGLE AUTH HANDLER
// ============================================
async function handleGoogleAuth(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_URL}/api/auth?action=google-callback`;

  if (!clientId) {
    return res.status(500).json({
      error: 'Configuration error',
      message: 'Google OAuth not configured'
    });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile&` +
    `access_type=offline&` +
    `prompt=consent`;

  return res.redirect(googleAuthUrl);
}

// ============================================
// GOOGLE CALLBACK HANDLER
// ============================================
async function handleGoogleCallback(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error } = req.query;

  if (error) {
    console.error('[Google OAuth] Error from Google:', error);
    return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=google_auth_failed`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=missing_code`);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_URL}/api/auth?action=google-callback`,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const googleUser = await userInfoResponse.json();

    // Check if user exists
    let user = await getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user
      user = await createUser({
        email: googleUser.email.toLowerCase(),
        passwordHash: null, // OAuth users don't have password
        fullName: googleUser.name,
        companyName: null,
        verificationToken: null,
        verificationExpires: null,
        googleId: googleUser.id
      });

      // Mark email as verified for OAuth
      await sql`UPDATE users SET email_verified = TRUE WHERE id = ${user.id}`;

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to: user.email,
          fullName: user.full_name
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      await logUserAction({
        userId: user.id,
        action: 'user_registered_google',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });
    } else {
      // Update Google ID if missing
      if (!user.google_id) {
        await sql`UPDATE users SET google_id = ${googleUser.id} WHERE id = ${user.id}`;
      }

      await updateLastLogin(user.id);

      await logUserAction({
        userId: user.id,
        action: 'user_logged_in_google',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      subscriptionPlan: user.subscription_plan
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Redirect to dashboard with tokens
    const redirectUrl = `${process.env.NEXT_PUBLIC_URL}/dashboard?` +
      `accessToken=${encodeURIComponent(accessToken)}&` +
      `refreshToken=${encodeURIComponent(refreshToken)}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('[Google OAuth] Error:', error);
    return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=google_auth_error`);
  }
}
