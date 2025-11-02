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
    useEffect(() => {
        const storedUser = localStorage.getItem('alloggify_user');
        const token = localStorage.getItem('alloggify_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
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

        localStorage.setItem('alloggify_user', JSON.stringify(mockUser));
        localStorage.setItem('alloggify_token', mockToken);

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

        localStorage.setItem('alloggify_user', JSON.stringify(mockUser));
        localStorage.setItem('alloggify_token', mockToken);

        setUser(mockUser);
        setLoading(false);
    };

    const logout = (): void => {
        localStorage.removeItem('alloggify_user');
        localStorage.removeItem('alloggify_token');
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
