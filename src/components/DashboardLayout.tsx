import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HomeModernIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/dashboard/scan',
      label: 'Scansioni',
      icon: DocumentTextIcon
    },
    {
      path: '/dashboard/properties',
      label: 'Strutture',
      icon: HomeModernIcon
    },
    {
      path: '/dashboard/receipts',
      label: 'Ricevute',
      icon: ReceiptPercentIcon
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/dashboard/scan" className="flex items-center space-x-2">
              <HomeModernIcon className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-gray-900">CheckInly</span>
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="hidden sm:flex items-center space-x-2 text-sm">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{user.email}</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                      {user.subscriptionPlan === 'free' ? 'Free' :
                       user.subscriptionPlan === 'basic' ? 'Basic' :
                       user.subscriptionPlan === 'pro' ? 'Pro' : 'Enterprise'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Esci</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 mt-4 border-b border-gray-200">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
