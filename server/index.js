/**
 * Alloggify Backend Server
 * Express server for SOAP API integration with Alloggiati Web
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import routes
const authRoute = require('./routes/auth');
const testRoute = require('./routes/test');
const sendRoute = require('./routes/send');
const ricevutaRoute = require('./routes/ricevuta');
const tabelleRoute = require('./routes/tabelle');
const chatRoute = require('./routes/chat');

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/alloggiati', authRoute);
app.use('/api/alloggiati', testRoute);
app.use('/api/alloggiati', sendRoute);
app.use('/api/alloggiati', ricevutaRoute);
app.use('/api/alloggiati', tabelleRoute);
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
    console.log(`🔗 API endpoints:`);
    console.log(`   POST /api/alloggiati/auth - Generate token`);
    console.log(`   POST /api/alloggiati/test - Test schedina`);
    console.log(`   POST /api/alloggiati/send - Send schedina`);
    console.log(`   POST /api/alloggiati/ricevuta - Download receipt`);
    console.log(`   POST /api/ai/chat - AI Chat assistant (Gemini 2.0 Flash)`);
    console.log('='.repeat(60));
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(60));
});
