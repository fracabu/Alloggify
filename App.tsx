import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/context/AuthContext';
import { ProtectedRoute } from './src/components/ProtectedRoute';

// Pages
import { LandingPage } from './src/pages/LandingPage';
import { LoginPage } from './src/pages/LoginPage';
import { SignupPage } from './src/pages/SignupPage';
import { DashboardPage } from './src/pages/DashboardPage';
import { PropertiesPage } from './src/pages/PropertiesPage';
import { ReceiptsPage } from './src/pages/ReceiptsPage';
import { VerifyEmailPage } from './src/pages/VerifyEmailPage';
import { PrivacyPolicyPage } from './src/pages/PrivacyPolicy';
import { TermsOfServicePage } from './src/pages/TermsOfService';
import { TestStripePage } from './src/pages/TestStripePage';
import { UpgradePage } from './src/pages/UpgradePage';
import { NewsListPage } from './src/pages/NewsListPage';
import { NewsDetailPage } from './src/pages/NewsDetailPage';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/verify" element={<VerifyEmailPage />} />

                    {/* News */}
                    <Route path="/news" element={<NewsListPage />} />
                    <Route path="/news/:slug" element={<NewsDetailPage />} />

                    {/* Protected Routes - Dashboard */}
                    <Route
                        path="/dashboard/scan"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/properties"
                        element={
                            <ProtectedRoute>
                                <PropertiesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/receipts"
                        element={
                            <ProtectedRoute>
                                <ReceiptsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={<Navigate to="/dashboard/scan" replace />}
                    />

                    {/* Test Stripe Page (Protected) */}
                    <Route
                        path="/test-stripe"
                        element={
                            <ProtectedRoute>
                                <TestStripePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Upgrade Page (Protected) */}
                    <Route
                        path="/upgrade"
                        element={
                            <ProtectedRoute>
                                <UpgradePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Legal Pages */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/forgot-password" element={<PlaceholderPage title="Password Reset" />} />

                    {/* Fallback: redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

// Temporary placeholder component for legal pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
                <p className="text-gray-600 mb-6">
                    Questa pagina è in fase di creazione. Torneremo presto con contenuti completi.
                </p>
                <a
                    href="/"
                    className="inline-block px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    Torna alla Home
                </a>
            </div>
        </div>
    );
};

export default App;
