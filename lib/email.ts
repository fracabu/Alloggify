/**
 * Email Service Wrapper
 * Supports both Resend and SendGrid
 *
 * Configuration via environment variables:
 * - EMAIL_PROVIDER=sendgrid|resend (default: resend)
 * - SENDGRID_API_KEY (if using SendGrid)
 * - SENDGRID_FROM_EMAIL (if using SendGrid)
 * - RESEND_API_KEY (if using Resend)
 */

import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';

// Email provider configuration
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

// SendGrid configuration
if (EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Resend configuration
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string; // Optional, uses default if not provided
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html, from } = options;

    if (EMAIL_PROVIDER === 'sendgrid') {
        // ========================================
        // SENDGRID
        // ========================================
        const fromEmail = from || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
        const fromName = process.env.SENDGRID_FROM_NAME || 'CheckInly';

        await sgMail.send({
            to,
            from: {
                email: fromEmail,
                name: fromName
            },
            subject,
            html
        });

        console.log(`✅ [SendGrid] Email sent to ${to}`);
    } else {
        // ========================================
        // RESEND (default)
        // ========================================
        const fromEmail = from || process.env.RESEND_FROM_EMAIL || 'CheckInly <onboarding@resend.dev>';

        await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html
        });

        console.log(`✅ [Resend] Email sent to ${to}`);
    }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    email: string,
    fullName: string,
    verificationToken: string
): Promise<void> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;

    const html = `
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
    `;

    await sendEmail({
        to: email,
        subject: '✅ Verifica il tuo account CheckInly',
        html
    });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    fullName: string,
    resetToken: string
): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
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
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Reset Password CheckInly</h1>
            </div>
            <div class="content">
                <p>Ciao <strong>${fullName}</strong>,</p>
                <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account CheckInly.</p>
                <p>Clicca sul pulsante qui sotto per creare una nuova password:</p>
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reimposta Password</a>
                </div>
                <p style="font-size: 12px; color: #666;">
                    Se il pulsante non funziona, copia e incolla questo link nel browser:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                <div class="warning">
                    <strong>⚠️ Nota importante:</strong> Questo link scadrà tra 1 ora per motivi di sicurezza.
                </div>
                <p>Se non hai richiesto il reset della password, ignora questa email. La tua password rimarrà invariata.</p>
            </div>
            <div class="footer">
                <p>CheckInly - Semplifica la gestione degli alloggiati</p>
                <p>Questo è un messaggio automatico, si prega di non rispondere.</p>
            </div>
        </div>
    </body>
</html>
    `;

    await sendEmail({
        to: email,
        subject: '🔒 Reset Password - CheckInly',
        html
    });
}

/**
 * Send welcome email (after successful verification)
 */
export async function sendWelcomeEmail(
    email: string,
    fullName: string
): Promise<void> {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard`;

    const html = `
<!DOCTYPE html>
<html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f7f7f7; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #FF385C; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #FF385C; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎊 Account Verificato!</h1>
            </div>
            <div class="content">
                <p>Ciao <strong>${fullName}</strong>,</p>
                <p>Il tuo account CheckInly è stato verificato con successo! Ora puoi iniziare a semplificare la gestione degli alloggiati.</p>

                <h2>🚀 Primi passi:</h2>
                <div class="feature">
                    <strong>1. Scansiona un documento</strong><br>
                    Carica una foto di un documento e lascia che l'AI estragga i dati
                </div>
                <div class="feature">
                    <strong>2. Esporta i dati</strong><br>
                    Usa il Chrome Extension o l'API SOAP per inviare i dati
                </div>
                <div class="feature">
                    <strong>3. Upgrade (opzionale)</strong><br>
                    Passa a Basic/Pro per scansioni illimitate e funzionalità avanzate
                </div>

                <div style="text-align: center;">
                    <a href="${dashboardUrl}" class="button">Vai alla Dashboard</a>
                </div>

                <p style="margin-top: 30px;">
                    <strong>Piano attuale:</strong> Free (5 scansioni al mese)<br>
                    <strong>Hai bisogno di più scansioni?</strong> <a href="${process.env.NEXT_PUBLIC_URL}/pricing">Scopri i nostri piani</a>
                </p>

                <p>Buon lavoro! 💼</p>
            </div>
            <div class="footer">
                <p>CheckInly - Semplifica la gestione degli alloggiati</p>
                <p>Questo è un messaggio automatico, si prega di non rispondere.</p>
            </div>
        </div>
    </body>
</html>
    `;

    await sendEmail({
        to: email,
        subject: '🎊 Benvenuto su CheckInly - Account Verificato!',
        html
    });
}
