/**
 * Alloggify Backend Server
 * Express server for SOAP API integration with Alloggiati Web
 */

// Load environment variables from .env.local (root directory)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// ONLY FOR LOCAL DEVELOPMENT - Disable SSL verification if behind corporate proxy/firewall
// This fixes "unable to verify the first certificate" errors with Google APIs
if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('⚠️  SSL verification disabled for local development (proxy/firewall workaround)');
}

const express = require('express');
const cors = require('cors');

// Import routes
const authRoute = require('./routes/auth'); // SOAP auth
const testRoute = require('./routes/test');
const sendRoute = require('./routes/send');
const ricevutaRoute = require('./routes/ricevuta');
const tabelleRoute = require('./routes/tabelle');
const chatRoute = require('./routes/chat');
// New routes for user authentication and OCR
const userAuthRoute = require('./routes/user-auth');
const ocrRoute = require('./routes/ocr');
const stripeCheckoutRoute = require('./routes/stripe-checkout');
const stripeSuccessRoute = require('./routes/stripe-success');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',           // Vite dev
        'http://localhost:3000',           // Alternative dev port
        'https://alloggify.vercel.app',    // Production Vercel
        /https:\/\/.*\.vercel\.app$/,      // All Vercel preview deployments
    ],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Alloggify Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

// API Routes with /api prefix (to match frontend expectations)
// User authentication routes
app.use('/api/auth', userAuthRoute);
// OCR route
app.use('/api/ocr', ocrRoute);
// Stripe routes
app.use('/api/stripe', stripeCheckoutRoute);
app.use('/api/stripe', stripeSuccessRoute);
// SOAP Alloggiati Web routes
app.use('/api/alloggiati', authRoute);
app.use('/api/alloggiati', testRoute);
app.use('/api/alloggiati', sendRoute);
app.use('/api/alloggiati', ricevutaRoute);
app.use('/api/alloggiati', tabelleRoute);
// AI Chat route
app.use('/api/ai', chatRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 Alloggify Backend Server');
    console.log('='.repeat(60));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`\n🔧 Configuration:`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
    console.log(`   POSTGRES_URL: ${process.env.POSTGRES_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`\n🔗 API endpoints:`);
    console.log(`   👤 User Authentication:`);
    console.log(`      POST /api/auth/login - User login`);
    console.log(`      POST /api/auth/register - User registration`);
    console.log(`   📄 OCR:`);
    console.log(`      POST /api/ocr - Extract document data`);
    console.log(`   💳 Stripe Payments:`);
    console.log(`      POST /api/stripe/create-checkout-session - Create Stripe checkout`);
    console.log(`   📡 SOAP Alloggiati Web:`);
    console.log(`      POST /api/alloggiati/auth - Generate SOAP token`);
    console.log(`      POST /api/alloggiati/test - Test schedina`);
    console.log(`      POST /api/alloggiati/send - Send schedina`);
    console.log(`      POST /api/alloggiati/ricevuta - Download receipt`);
    console.log(`   🤖 AI Chat:`);
    console.log(`      POST /api/ai/chat - AI Chat assistant (Gemini 2.5 Flash)`);
    console.log('='.repeat(60));
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
});
