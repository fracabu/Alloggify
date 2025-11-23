import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    fullName: string;
    companyName?: string;
    subscriptionPlan: 'free' | 'starter' | 'pro' | 'enterprise';
    scanCount: number;
    monthlyScanLimit: number;
    propertyLimit?: number; // New: multi-property support
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
    logout: () => void;
    updateScanCount: (scanCount: number, monthlyScanLimit: number) => void;
    updateUser: (userData: Partial<User>) => void;
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

        try {
            const response = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login fallito');
            }

            // Store user and token
            const user: User = {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.fullName,
                companyName: data.user.companyName,
                subscriptionPlan: data.user.subscriptionPlan,
                scanCount: data.user.scanCount || 0,
                monthlyScanLimit: data.user.monthlyScanLimit || 5
            };

            sessionStorage.setItem('alloggify_user', JSON.stringify(user));
            sessionStorage.setItem('alloggify_token', data.accessToken);

            setUser(user);
        } catch (error: any) {
            throw new Error(error.message || 'Errore durante il login');
        } finally {
            setLoading(false);
        }
    };

    const signup = async (
        email: string,
        password: string,
        fullName: string,
        companyName?: string
    ): Promise<void> => {
        setLoading(true);

        try {
            const response = await fetch('/api/auth?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName, companyName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registrazione fallita');
            }

            // Do NOT auto-login after signup - user must verify email first
            // SignupPage will handle the success message and redirect
        } catch (error: any) {
            throw new Error(error.message || 'Errore durante la registrazione');
        } finally {
            setLoading(false);
        }
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

    const updateScanCount = (scanCount: number, monthlyScanLimit: number): void => {
        if (user) {
            const updatedUser = {
                ...user,
                scanCount,
                monthlyScanLimit
            };
            setUser(updatedUser);
            sessionStorage.setItem('alloggify_user', JSON.stringify(updatedUser));
        }
    };

    const updateUser = (userData: Partial<User>): void => {
        if (user) {
            const updatedUser = {
                ...user,
                ...userData
            };
            setUser(updatedUser);
            sessionStorage.setItem('alloggify_user', JSON.stringify(updatedUser));
            console.log('[AuthContext] User updated:', updatedUser);
        }
    };

    const value: AuthContextType = {
        user,
        login,
        signup,
        logout,
        updateScanCount,
        updateUser,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
