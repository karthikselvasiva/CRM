import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center text-brand-text-secondary">
                {icon || <Inbox className="w-8 h-8" />}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
                {description && (
                    <p className="mt-1 text-sm text-brand-text-secondary max-w-sm">{description}</p>
                )}
            </div>
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
};
