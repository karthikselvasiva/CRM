import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    return (
        <svg
            className={`animate-spin text-brand-primary ${sizeMap[size]} ${className}`}
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
};

interface PageSpinnerProps {
    message?: string;
}

export const PageSpinner: React.FC<PageSpinnerProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-brand-text-secondary">{message}</p>
        </div>
    );
};
