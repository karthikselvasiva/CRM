import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const { user, token, isAuthenticated, isLoading, logout } = useAuthStore();

    const hasRole = (role: string) => user?.role === role;
    const isAdmin = () => user?.role === 'admin';
    const isManager = () => user?.role === 'admin' || user?.role === 'sales_manager';

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        logout,
        hasRole,
        isAdmin,
        isManager,
    };
}
