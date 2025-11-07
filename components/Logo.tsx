import React from 'react';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = false }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Airbnb-style minimal house icon */}
            <svg
                className={className}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="CheckInly Logo"
            >
                {/* Simple modern house shape - Airbnb style */}
                <path
                    d="M 50 20 L 80 45 L 80 80 L 20 80 L 20 45 Z"
                    fill="#FF385C"
                    stroke="#FF385C"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Door */}
                <rect
                    x="42"
                    y="58"
                    width="16"
                    height="22"
                    fill="white"
                    rx="1"
                />

                {/* Window */}
                <rect
                    x="30"
                    y="50"
                    width="10"
                    height="10"
                    fill="white"
                    rx="1"
                />

                {/* Window */}
                <rect
                    x="60"
                    y="50"
                    width="10"
                    height="10"
                    fill="white"
                    rx="1"
                />

                {/* Chimney accent */}
                <rect
                    x="65"
                    y="28"
                    width="6"
                    height="12"
                    fill="#222222"
                    rx="1"
                />
            </svg>

            {/* Text "CheckInly" - Airbnb style */}
            {showText && (
                <span className="text-2xl font-bold text-dark tracking-tight">
                    CheckInly
                </span>
            )}
        </div>
    );
};

