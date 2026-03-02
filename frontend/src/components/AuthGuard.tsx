import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
    const location = useLocation();

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-surface">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-brand-text-secondary">Loading your session...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AuthGuard;
