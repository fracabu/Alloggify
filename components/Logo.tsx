import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Alloggify Logo"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <g transform="translate(5, 5)">
                 {/* Stylized 'A' shape */}
                <path
                    d="M 45 0 L 0 90 H 15 L 35 40 H 55 L 75 90 H 90 L 45 0 Z M 45 25 L 60 65 H 30 L 45 25 Z"
                    fill="url(#logoGradient)"
                />
                 {/* Integrated checkmark */}
                <path
                    d="M 60 60 L 70 70 L 95 45"
                    stroke="white"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
};
