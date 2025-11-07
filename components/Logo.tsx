import React from 'react';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = false }) => {
    return (
        <div className="flex items-center gap-3">
            {/* Minimal brush-stroke house icon */}
            <svg
                className={className}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="CheckInly Logo"
            >
                {/* Brush-stroke style house - organic, hand-drawn feel */}
                <path
                    d="M 48 18 Q 50 15 52 18 L 82 48 Q 83 49 81 50 L 78 50 L 78 82 Q 78 84 76 84 L 24 84 Q 22 84 22 82 L 22 50 L 19 50 Q 17 49 18 48 Z"
                    fill="#FF385C"
                    stroke="none"
                />

                {/* Door - subtle brush style */}
                <path
                    d="M 43 62 Q 42 62 42 63 L 42 84 L 58 84 L 58 63 Q 58 62 57 62 Z"
                    fill="white"
                    opacity="0.95"
                />

                {/* Window accent - minimal */}
                <circle
                    cx="32"
                    cy="58"
                    r="4"
                    fill="white"
                    opacity="0.9"
                />

                {/* Window accent - minimal */}
                <circle
                    cx="68"
                    cy="58"
                    r="4"
                    fill="white"
                    opacity="0.9"
                />
            </svg>

            {/* Text "CheckInly" with red dot on 'e' */}
            {showText && (
                <div className="relative text-2xl font-bold text-dark tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Ch
                    <span className="relative inline-block">
                        e
                        <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                    </span>
                    ckInly
                </div>
            )}
        </div>
    );
};

