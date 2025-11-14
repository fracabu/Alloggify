import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    fullName: string;
    companyName?: string;
    subscriptionPlan: 'free' | 'basic' | 'pro' | 'enterprise';
    scanCount: number;
    monthlyScanLimit: number;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Check for existing session on mount
    // Using sessionStorage to auto-logout when browser/tab closes
    useEffect(() => {
        const storedUser = sessionStorage.getItem('alloggify_user');
        const token = sessionStorage.getItem('alloggify_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        } else {
            // SECURITY: If no valid session exists, clear any leftover sensitive data
            // This handles cases where the browser was closed without explicit logout
            localStorage.removeItem('alloggiatiUtente');
            localStorage.removeItem('alloggiatiPassword');
            localStorage.removeItem('alloggiatiWskey');
            localStorage.removeItem('alloggifyToken');
            localStorage.removeItem('alloggifyData');
            localStorage.removeItem('alloggifyDataTimestamp');
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);

        // TODO: Replace with real API call when backend is ready
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock user data
        const mockUser: User = {
            id: `user_${Date.now()}`,
            email,
            fullName: email.split('@')[0], // Extract name from email for now
            subscriptionPlan: 'free',
            scanCount: 0,
            monthlyScanLimit: 5
        };

        const mockToken = `mock_jwt_token_${Date.now()}`;

        // Using sessionStorage to auto-logout when browser/tab closes
        sessionStorage.setItem('alloggify_user', JSON.stringify(mockUser));
        sessionStorage.setItem('alloggify_token', mockToken);

        setUser(mockUser);
        setLoading(false);
    };

    const signup = async (
        email: string,
        password: string,
        fullName: string,
        companyName?: string
    ): Promise<void> => {
        setLoading(true);

        // TODO: Replace with real API call when backend is ready
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock user data
        const mockUser: User = {
            id: `user_${Date.now()}`,
            email,
            fullName,
            companyName,
            subscriptionPlan: 'free',
            scanCount: 0,
            monthlyScanLimit: 5
        };

        const mockToken = `mock_jwt_token_${Date.now()}`;

        // Using sessionStorage to auto-logout when browser/tab closes
        sessionStorage.setItem('alloggify_user', JSON.stringify(mockUser));
        sessionStorage.setItem('alloggify_token', mockToken);

        setUser(mockUser);
        setLoading(false);
    };

    const logout = (): void => {
        // Clear authentication session
        sessionStorage.removeItem('alloggify_user');
        sessionStorage.removeItem('alloggify_token');

        // SECURITY: Clear ALL sensitive data from localStorage on logout
        // This prevents the next user from seeing previous user's credentials
        localStorage.removeItem('alloggiatiUtente');      // Alloggiati Web username
        localStorage.removeItem('alloggiatiPassword');    // Alloggiati Web password
        localStorage.removeItem('alloggiatiWskey');       // Alloggiati Web WSKEY
        localStorage.removeItem('alloggifyToken');        // SOAP API token
        localStorage.removeItem('alloggifyData');         // Exported document data
        localStorage.removeItem('alloggifyDataTimestamp'); // Export timestamp
        localStorage.removeItem('geminiApiKey');          // Gemini API key (if user-configured)

        setUser(null);
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
