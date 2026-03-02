import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    id,
    className = '',
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-brand-text">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary w-4 h-4">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`input ${icon ? 'pl-10' : ''} ${error ? 'border-brand-danger focus:ring-brand-danger' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-brand-danger">{error}</p>}
        </div>
    );
};
