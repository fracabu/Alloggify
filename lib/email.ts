/**
 * Email Service using Aruba SMTP
 *
 * Configuration via environment variables:
 * - SMTP_HOST (default: smtps.aruba.it)
 * - SMTP_PORT (default: 465)
 * - SMTP_USER (your email: noreply@yourdomain.it)
 * - SMTP_PASSWORD (your email password)
 * - SMTP_FROM_NAME (default: CheckInly)
 * - NEXT_PUBLIC_URL (for email links)
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// SMTP Configuration
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtps.aruba.it',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // false for port 587 (use STARTTLS), true for port 465 (SSL)
    requireTLS: true, // Force TLS upgrade via STARTTLS
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
    },
    tls: {
        rejectUnauthorized: false // Disable SSL verification (needed for some Aruba configs)
    }
};

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (!transporter) {
        transporter = nodemailer.createTransport(SMTP_CONFIG);
    }
    return transporter;
}

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string; // Optional, uses default if not provided
}

/**
 * Send email using Aruba SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html, from } = options;

    const fromName = process.env.SMTP_FROM_NAME || 'CheckInly';
    const fromEmail = from || `${fromName} <${process.env.SMTP_USER}>`;

    const mailOptions = {
        from: fromEmail,
        to,
        subject,
        html
    };

    try {
        const transporter = getTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ [Aruba SMTP] Email sent to ${to} - Message ID: ${info.messageId}`);
    } catch (error: any) {
        console.error(`❌ [Aruba SMTP] Failed to send email to ${to}:`, error.message);
        throw new Error(`Email send failed: ${error.message}`);
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
    const loginUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/login`;

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
                <h1>🎊 Benvenuto su CheckInly!</h1>
            </div>
            <div class="content">
                <p>Ciao <strong>${fullName}</strong>,</p>
                <p>Grazie per esserti registrato su CheckInly! Il tuo account è pronto all'uso.</p>

                <h2>🚀 Primi passi:</h2>
                <div class="feature">
                    <strong>1. Accedi al tuo account</strong><br>
                    Clicca il pulsante qui sotto per fare login
                </div>
                <div class="feature">
                    <strong>2. Scansiona un documento</strong><br>
                    Carica una foto di un documento e lascia che l'AI estragga i dati
                </div>
                <div class="feature">
                    <strong>3. Esporta i dati</strong><br>
                    Usa il Chrome Extension o l'API SOAP per inviare i dati al portale Alloggiati Web
                </div>

                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Accedi Ora</a>
                </div>

                <p style="margin-top: 30px;">
                    <strong>Piano attuale:</strong> Free (5 scansioni al mese)<br>
                    <strong>Hai bisogno di più scansioni?</strong> Scopri i nostri piani Basic, Pro ed Enterprise
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
        subject: '🎊 Benvenuto su CheckInly!',
        html
    });
}
