/**
 * Google OAuth - Redirect to Google
 * GET /api/auth/google
 *
 * Redirects user to Google OAuth consent screen
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
        );

        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });

        // Redirect to Google
        return res.redirect(authUrl);

    } catch (error: any) {
        console.error('❌ Google OAuth redirect error:', error);
        return res.status(500).json({
            error: 'OAuth error',
            message: 'Errore durante il redirect a Google'
        });
    }
}
