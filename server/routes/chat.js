/**
 * AI Chat Route
 * Endpoint for Gemini 2.0 Flash AI assistant
 */

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI Chat will not work.');
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * POST /api/ai/chat
 * Send message to AI assistant and get response
 *
 * Body:
 * {
 *   "systemPrompt": "System instructions...",
 *   "messages": [
 *     { "role": "user", "content": "message" },
 *     { "role": "assistant", "content": "response" }
 *   ]
 * }
 *
 * Response:
 * {
 *   "response": "AI response text",
 *   "usage": { "inputTokens": 100, "outputTokens": 200 }
 * }
 */
router.post('/chat', async (req, res) => {
    try {
        const { systemPrompt, messages } = req.body;

        // Validation
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'messages array is required and must not be empty'
            });
        }

        if (!apiKey) {
            return res.status(500).json({
                error: 'Configuration error',
                message: 'GEMINI_API_KEY not configured on server'
            });
        }

        // Initialize model (Gemini 2.0 Flash - fastest and FREE)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt || ''
        });

        // Build conversation history
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Last message must be from user'
            });
        }

        // Start chat with history
        const chat = model.startChat({
            history: history,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        // Send message and get response
        const result = await chat.sendMessage(lastMessage.content);
        const response = result.response;
        const text = response.text();

        // Get usage metadata (if available)
        const usageMetadata = response.usageMetadata || {};

        console.log(`[AI Chat] Request processed - Input: ${usageMetadata.promptTokenCount || 0} tokens, Output: ${usageMetadata.candidatesTokenCount || 0} tokens`);

        res.json({
            response: text,
            usage: {
                inputTokens: usageMetadata.promptTokenCount || 0,
                outputTokens: usageMetadata.candidatesTokenCount || 0,
                totalTokens: usageMetadata.totalTokenCount || 0
            }
        });

    } catch (error) {
        console.error('[AI Chat Error]', error);

        // Handle specific errors
        if (error.message && error.message.includes('API_KEY_INVALID')) {
            return res.status(401).json({
                error: 'API key invalid',
                message: 'The GEMINI_API_KEY is invalid or expired'
            });
        }

        if (error.message && error.message.includes('RATE_LIMIT_EXCEEDED')) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'AI service error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process your request'
        });
    }
});

module.exports = router;
