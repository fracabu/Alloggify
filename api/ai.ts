/**
 * AI Chat API Endpoint - Vercel Serverless Function
 * Gemini 2.5 Flash-powered AI assistant for Alloggify
 */

import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel serverless function configuration
export const config = {
    maxDuration: 30, // 30 seconds timeout
};

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI Chat will not work.');
}

const ai = new GoogleGenAI({ apiKey });

/**
 * POST /api/ai/chat
 * Send message to AI assistant and get response
 *
 * Request body:
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
 *   "response": "AI response text"
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        // Get the last user message
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Last message must be from user'
            });
        }

        console.log(`[AI Chat] Sending message to Gemini API: "${lastMessage.content.substring(0, 50)}..."`);

        // Build conversation history for context
        let conversationHistory = '';
        messages.slice(0, -1).forEach((msg: any) => {
            if (msg.role === 'user') {
                conversationHistory += `User: ${msg.content}\n`;
            } else if (msg.role === 'assistant') {
                conversationHistory += `Assistant: ${msg.content}\n`;
            }
        });

        // Build full prompt with system instruction and history
        const fullPrompt = systemPrompt
            ? `${systemPrompt}\n\n${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}User: ${lastMessage.content}`
            : `${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}User: ${lastMessage.content}`;

        // Call Gemini API (using 2.5 Flash)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [{ text: fullPrompt }]
            }
        });

        const responseText = response.text?.trim() || '';
        if (!responseText) {
            throw new Error('Empty response from Gemini API');
        }

        console.log('[AI Chat] ✅ Response generated successfully');

        return res.status(200).json({
            response: responseText
        });

    } catch (error: any) {
        console.error('[AI Chat Error]', error);

        // Handle specific errors
        if (error.message && error.message.includes('API key not valid')) {
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

        return res.status(500).json({
            error: 'AI service error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to process your request'
        });
    }
}
