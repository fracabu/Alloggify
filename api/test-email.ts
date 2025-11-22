/**
 * Test SMTP Email Endpoint (Vercel)
 * GET /api/test-email
 *
 * Tests Aruba SMTP configuration on Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from '../lib/email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Aruba SMTP configuration on Vercel...\n');

    // Check environment variables
    const config = {
      host: process.env.SMTP_HOST || '❌ MISSING',
      port: process.env.SMTP_PORT || '❌ MISSING',
      user: process.env.SMTP_USER || '❌ MISSING',
      password: process.env.SMTP_PASSWORD ? '✅ Set' : '❌ MISSING',
      fromName: process.env.SMTP_FROM_NAME || 'CheckInly',
      publicUrl: process.env.NEXT_PUBLIC_URL || '❌ MISSING'
    };

    console.log('📧 SMTP Configuration:', config);

    // Validate required variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return res.status(500).json({
        success: false,
        error: 'Missing SMTP credentials',
        config: {
          ...config,
          password: undefined // Don't expose password in response
        }
      });
    }

    // Send test email to the configured SMTP user (send to yourself)
    const testEmailAddress = process.env.SMTP_USER;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #28a745; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .config { font-family: monospace; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <p class="success">✅ SMTP Test Successful from Vercel!</p>
        <p>This is a test email from CheckInly running on <strong>Vercel Serverless</strong>.</p>

        <div class="info">
            <p><strong>Configuration:</strong></p>
            <ul class="config">
                <li>Host: ${process.env.SMTP_HOST}</li>
                <li>Port: ${process.env.SMTP_PORT}</li>
                <li>User: ${process.env.SMTP_USER}</li>
                <li>From: ${config.fromName}</li>
                <li>Environment: Vercel Production</li>
                <li>Timestamp: ${new Date().toISOString()}</li>
            </ul>
        </div>

        <p>✅ If you received this email, your Aruba SMTP configuration is working correctly on Vercel!</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated test email. No reply needed.
        </p>
    </div>
</body>
</html>
    `;

    console.log(`📤 Sending test email to: ${testEmailAddress}...`);

    await sendEmail({
      to: testEmailAddress,
      subject: '🧪 Test Email - CheckInly SMTP (Vercel)',
      html
    });

    console.log(`✅ Email sent successfully from Vercel!`);

    // Return success response
    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmailAddress}`,
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        fromName: config.fromName,
        timestamp: new Date().toISOString()
      },
      instructions: `Check your inbox at ${testEmailAddress}`
    });

  } catch (error: any) {
    console.error(`❌ Failed to send test email:`, error);

    return res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      details: {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      },
      suggestions: getErrorSuggestions(error.code)
    });
  }
}

/**
 * Get helpful error suggestions based on error code
 */
function getErrorSuggestions(errorCode: string): string[] {
  switch (errorCode) {
    case 'EAUTH':
      return [
        'Check SMTP_USER and SMTP_PASSWORD in Vercel environment variables',
        'Verify the email account exists on Aruba',
        'Ensure SMTP is enabled for this account in Aruba dashboard'
      ];
    case 'ECONNECTION':
    case 'ETIMEDOUT':
      return [
        'Check internet connection',
        'Verify SMTP_HOST and SMTP_PORT are correct',
        'Aruba might be blocking Vercel IPs - check firewall settings',
        'Try using port 587 with STARTTLS instead of port 465'
      ];
    case 'EMESSAGE':
      return [
        'Email format or content issue',
        'Check sender and recipient addresses'
      ];
    default:
      return [
        'Check Vercel logs for more details',
        'Verify all SMTP environment variables are set correctly',
        'Contact Aruba support if the issue persists'
      ];
  }
}
