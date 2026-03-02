import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    icon,
    isLoading,
    children,
    disabled,
    className = '',
    ...props
}) => {
    return (
        <button
            className={`${variantClasses[variant]} gap-2 ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : icon ? (
                <span className="w-4 h-4">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};
