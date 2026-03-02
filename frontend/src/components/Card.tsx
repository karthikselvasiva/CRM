import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    action?: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    action,
    className = '',
    noPadding = false,
}) => {
    return (
        <div className={`card ${noPadding ? '!p-0' : ''} ${className}`}>
            {(title || action) && (
                <div className={`flex items-center justify-between ${noPadding ? 'px-4 pt-4' : ''} ${title ? 'mb-4' : ''}`}>
                    {title && <h3 className="text-base font-semibold text-brand-text">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
};
