import React from 'react';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = false }) => {
    return (
        <div className="flex items-center gap-2">
            {/* House Icon */}
            <svg
                className={className}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="CheckInly Logo"
            >
                <defs>
                    <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#6366F1', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                
                {/* Roof - Triangle */}
                <path
                    d="M 50 15 L 10 50 L 20 50 L 20 85 L 80 85 L 80 50 L 90 50 Z"
                    fill="url(#houseGradient)"
                />
                
                {/* House body */}
                <rect
                    x="20"
                    y="50"
                    width="60"
                    height="35"
                    fill="url(#houseGradient)"
                />
                
                {/* Open Door - Darker shade to show it's open */}
                <path
                    d="M 40 60 L 40 85 L 60 85 L 60 60 L 55 60 L 55 80 L 45 80 L 45 60 Z"
                    fill="#312E81"
                    opacity="0.8"
                />
                
                {/* Door handle */}
                <circle
                    cx="52"
                    cy="72"
                    r="2"
                    fill="white"
                />
                
                {/* Window left */}
                <rect
                    x="28"
                    y="58"
                    width="8"
                    height="8"
                    fill="white"
                    opacity="0.9"
                    rx="1"
                />
                
                {/* Window right */}
                <rect
                    x="64"
                    y="58"
                    width="8"
                    height="8"
                    fill="white"
                    opacity="0.9"
                    rx="1"
                />
            </svg>
            
            {/* Text "CheckInly" */}
            {showText && (
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    CheckInly
                </span>
            )}
        </div>
    );
};

