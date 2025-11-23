import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DocumentTextIcon,
  HomeModernIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';

export const DashboardTabs: React.FC = () => {
  const location = useLocation();

  const tabs = [
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
    <div className="flex space-x-1 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
              isActive
                ? 'border-primary-500 text-primary-600 bg-primary-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
