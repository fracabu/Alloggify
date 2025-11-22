/**
 * Test SMTP Email
 * Run with: node scripts/test-email.cjs
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🧪 Testing Aruba SMTP configuration...\n');

    // Check environment variables
    console.log('📧 SMTP Configuration:');
    console.log(`   Host: ${process.env.SMTP_HOST || '❌ MISSING'}`);
    console.log(`   Port: ${process.env.SMTP_PORT || '❌ MISSING'}`);
    console.log(`   User: ${process.env.SMTP_USER || '❌ MISSING'}`);
    console.log(`   Password: ${process.env.SMTP_PASSWORD ? '✅ Set' : '❌ MISSING'}`);
    console.log(`   From Name: ${process.env.SMTP_FROM_NAME || 'CheckInly'}\n`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ Missing SMTP credentials in .env.local');
        process.exit(1);
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtps.aruba.it',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Disable SSL verification for local development
        }
    });

    // Test email
    const testEmailAddress = process.env.SMTP_USER; // Send to yourself for testing
    const fromName = process.env.SMTP_FROM_NAME || 'CheckInly';

    const mailOptions = {
        from: `${fromName} <${process.env.SMTP_USER}>`,
        to: testEmailAddress,
        subject: '🧪 Test Email - CheckInly SMTP',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #f7f7f7; padding: 30px; border-radius: 8px; }
        .success { color: #28a745; font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <p class="success">✅ SMTP Test Successful!</p>
        <p>This is a test email from CheckInly.</p>
        <p><strong>Configuration:</strong></p>
        <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>User: ${process.env.SMTP_USER}</li>
            <li>From: ${fromName}</li>
        </ul>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
    </div>
</body>
</html>
        `
    };

    try {
        console.log(`📤 Sending test email to: ${testEmailAddress}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`\n🎉 Check your inbox at: ${testEmailAddress}`);
    } catch (error) {
        console.error(`❌ Failed to send email:`);
        console.error(`   Error: ${error.message}`);

        if (error.code === 'EAUTH') {
            console.error('\n💡 Possible issues:');
            console.error('   - Check SMTP_USER and SMTP_PASSWORD in .env.local');
            console.error('   - Verify the email account exists on Aruba');
            console.error('   - Ensure SMTP is enabled for this account');
        } else if (error.code === 'ECONNECTION') {
            console.error('\n💡 Possible issues:');
            console.error('   - Check internet connection');
            console.error('   - Verify SMTP_HOST and SMTP_PORT are correct');
            console.error('   - Check firewall settings');
        }

        throw error;
    }
}

testEmail()
    .then(() => {
        console.log('\n✅ Test completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed');
        process.exit(1);
    });
