/**
 * Local Development Server
 * Simula le Vercel Serverless Functions localmente
 * Usa questo invece di `vercel dev` per evitare problemi SSL
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: '.env.local' });

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Log requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Helper to convert Vercel function to Express handler
const wrapVercelFunction = (vercelHandler) => {
    return async (req, res) => {
        try {
            // Simulate VercelRequest
            const vercelReq = {
                ...req,
                query: req.query,
                body: req.body,
                headers: req.headers,
                method: req.method,
                url: req.url
            };

            // Simulate VercelResponse
            const vercelRes = {
                status: (code) => {
                    res.status(code);
                    return vercelRes;
                },
                json: (data) => {
                    res.json(data);
                    return vercelRes;
                },
                send: (data) => {
                    res.send(data);
                    return vercelRes;
                },
                setHeader: (name, value) => {
                    res.setHeader(name, value);
                    return vercelRes;
                }
            };

            await vercelHandler(vercelReq, vercelRes);
        } catch (error) {
            console.error('Error in API handler:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        }
    };
};

// Dynamically import and mount API routes
const loadApiRoutes = async () => {
    try {
        // Auth routes
        const loginHandler = (await import('./api/auth/login.ts')).default;
        app.post('/api/auth/login', wrapVercelFunction(loginHandler));

        const registerHandler = (await import('./api/auth/register.ts')).default;
        app.post('/api/auth/register', wrapVercelFunction(registerHandler));

        const verifyHandler = (await import('./api/auth/verify.ts')).default;
        app.get('/api/auth/verify', wrapVercelFunction(verifyHandler));

        // OCR route
        const ocrHandler = (await import('./api/ocr.ts')).default;
        app.post('/api/ocr', wrapVercelFunction(ocrHandler));

        // Stripe routes
        const checkoutHandler = (await import('./api/stripe/create-checkout-session.ts')).default;
        app.post('/api/stripe/create-checkout-session', wrapVercelFunction(checkoutHandler));

        const webhookHandler = (await import('./api/webhooks/stripe.ts')).default;
        app.post('/api/webhooks/stripe', wrapVercelFunction(webhookHandler));

        console.log('✅ API routes loaded successfully');
    } catch (error) {
        console.error('❌ Error loading API routes:', error);
        throw error;
    }
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Dev server running' });
});

// Start server
const startServer = async () => {
    try {
        await loadApiRoutes();

        app.listen(PORT, () => {
            console.log('\n===========================================');
            console.log('🚀 Local Development Server Started');
            console.log('===========================================');
            console.log(`📡 API Server: http://localhost:${PORT}`);
            console.log(`🔗 Frontend: http://localhost:3000 (run "npm run dev:vite" in another terminal)`);
            console.log('\n📋 Available endpoints:');
            console.log('  POST /api/auth/login');
            console.log('  POST /api/auth/register');
            console.log('  GET  /api/auth/verify');
            console.log('  POST /api/ocr');
            console.log('  POST /api/stripe/create-checkout-session');
            console.log('  POST /api/webhooks/stripe');
            console.log('\n💡 Press Ctrl+C to stop');
            console.log('===========================================\n');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
