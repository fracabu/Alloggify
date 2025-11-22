/**
 * Google OAuth Callback
 * GET /api/auth/google/callback
 *
 * Handles Google OAuth callback, creates/logs in user
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth';
import { getUserByEmail, createUser } from '../../../lib/db';
import { sendWelcomeEmail } from '../../../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
            return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=missing_code`);
        }

        // Exchange code for tokens
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info from Google
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();

        if (!data.email) {
            return res.redirect(`${process.env.NEXT_PUBLIC_URL}/login?error=no_email`);
        }

        // Check if user exists
        let user = await getUserByEmail(data.email);
        let isNewUser = false;

        if (!user) {
            // Create new user
            const fullName = data.name || data.email.split('@')[0];

            user = await createUser({
                email: data.email,
                passwordHash: null, // OAuth users don't have password
                fullName,
                companyName: null,
                verificationToken: null, // Auto-verified via Google
                emailVerified: true, // Google already verified the email
                googleId: data.id // Store Google ID for future logins
            });

            console.log(`✅ New user created via Google OAuth: ${data.email}`);

            // Send welcome email (WAIT for it to complete before redirect)
            try {
                await sendWelcomeEmail(data.email, fullName);
                console.log(`✅ Welcome email sent to ${data.email} (Google OAuth)`);
            } catch (error: any) {
                console.error('❌ Failed to send welcome email (Google OAuth):', {
                    email: data.email,
                    message: error.message,
                    code: error.code,
                    response: error.response
                });
                // Continue anyway - email is not critical for OAuth signup
            }

            isNewUser = true;
        } else if (!user.email_verified) {
            // If user exists but email not verified, verify it now
            const { sql } = await import('@vercel/postgres');
            await sql`
                UPDATE users
                SET email_verified = TRUE,
                    google_id = ${data.id},
                    updated_at = NOW()
                WHERE id = ${user.id}
            `;
            user.email_verified = true;
        }

        // If new user, redirect to signup page with success message (NO auto-login)
        if (isNewUser) {
            const signupSuccessUrl = `${process.env.NEXT_PUBLIC_URL}/signup?` +
                `google_registered=true&` +
                `email=${encodeURIComponent(data.email)}`;
            return res.redirect(signupSuccessUrl);
        }

        // Existing user: proceed with login
        // Generate JWT tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            subscriptionPlan: user.subscription_plan
        });
        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            subscriptionPlan: user.subscription_plan
        });

        // Prepare user object
        const userObj = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            companyName: user.company_name,
            subscriptionPlan: user.subscription_plan,
            monthlyScanLimit: user.monthly_scan_limit,
            scanCount: user.scan_count,
            emailVerified: user.email_verified
        };

        // Redirect to frontend with tokens (for existing users doing login)
        const frontendUrl = `${process.env.NEXT_PUBLIC_URL}/login?` +
            `google_auth=success&` +
            `token=${accessToken}&` +
            `refresh=${refreshToken}&` +
            `user=${encodeURIComponent(JSON.stringify(userObj))}`;

        return res.redirect(frontendUrl);

    } catch (error: any) {
        console.error('❌ Google OAuth callback error:', error);
        return res.redirect(
            `${process.env.NEXT_PUBLIC_URL}/login?error=oauth_failed&message=${encodeURIComponent(error.message)}`
        );
    }
}
