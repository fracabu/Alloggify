import React from 'react';
import { Logo } from './Logo';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <Logo className="h-8 w-auto" />
                         <span className="text-xl font-semibold text-white">Alloggify</span>
                    </div>
                </div>
            </nav>
        </header>
    );
};