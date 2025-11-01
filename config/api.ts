/**
 * API Configuration
 * Configure backend URL based on environment
 */

// Backend URL configuration
const getApiBaseUrl = (): string => {
    // Check if there's a custom backend URL in localStorage (for testing)
    const customUrl = localStorage.getItem('backendUrl');
    if (customUrl) {
        return customUrl;
    }

    // In development, use local Express server
    if (import.meta.env.DEV) {
        return 'http://localhost:3001';
    }

    // In production, use environment variable or default to production backend
    return import.meta.env.VITE_BACKEND_URL || 'https://your-backend-url.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
    auth: `${API_BASE_URL}/api/alloggiati/auth`,
    test: `${API_BASE_URL}/api/alloggiati/test`,
    send: `${API_BASE_URL}/api/alloggiati/send`,
    ricevuta: `${API_BASE_URL}/api/alloggiati/ricevuta`,
};
