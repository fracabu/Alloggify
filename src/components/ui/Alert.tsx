import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'warning' | 'error' | 'info';
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
    variant = 'info',
    title,
    dismissible = false,
    onDismiss,
    children,
    className = '',
    ...props
}) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const variants = {
        success: {
            container: 'bg-green-50 border-green-200 text-green-800',
            icon: CheckCircle,
            iconColor: 'text-green-600'
        },
        warning: {
            container: 'bg-amber-50 border-amber-200 text-amber-800',
            icon: AlertCircle,
            iconColor: 'text-amber-600'
        },
        error: {
            container: 'bg-red-50 border-red-200 text-red-800',
            icon: XCircle,
            iconColor: 'text-red-600'
        },
        info: {
            container: 'bg-sky-50 border-sky-200 text-sky-800',
            icon: Info,
            iconColor: 'text-sky-600'
        }
    };

    const config = variants[variant];
    const Icon = config.icon;

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${config.container} ${className}`}
            role="alert"
            {...props}
        >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1">
                {title && <h4 className="font-semibold mb-1">{title}</h4>}
                <div className="text-sm">{children}</div>
            </div>
            {dismissible && (
                <button
                    onClick={handleDismiss}
                    className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
                    aria-label="Dismiss"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
