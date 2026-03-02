import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge bg-brand-surface text-brand-text-secondary',
};

export const Badge: React.FC<BadgeProps> = ({
    variant = 'primary',
    children,
    className = '',
}) => {
    return (
        <span className={`${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};
