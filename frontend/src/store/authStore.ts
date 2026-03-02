import { create } from 'zustand';
import { authApi, LoginPayload, RegisterPayload, UserProfile } from '../api/authService';

export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    role: 'admin' | 'sales_manager' | 'sales_rep' | 'viewer';
    teamId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (payload: LoginPayload) => Promise<boolean>;
    register: (payload: RegisterPayload) => Promise<boolean>;
    fetchProfile: () => Promise<void>;
    logout: () => void;
    restoreSession: () => Promise<void>;
    clearError: () => void;
}

function profileToUser(p: UserProfile): User {
    return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        role: p.role as User['role'],
        teamId: p.team_id,
    };
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('crm_token'),
    refreshToken: localStorage.getItem('crm_refresh_token'),
    isAuthenticated: false,
    isLoading: false, // Changed from true to false
    error: null,

    login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const res = await authApi.login(payload);
            const { access_token, refresh_token, user } = res.data.data;

            localStorage.setItem('crm_token', access_token);
            localStorage.setItem('crm_refresh_token', refresh_token);

            set({
                user: profileToUser(user),
                token: access_token,
                refreshToken: refresh_token,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (err: any) {
            const message = err.response?.data?.error || err.response?.data?.detail || 'Login failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.register(payload);
            set({ isLoading: false });
            return true;
        } catch (err: any) {
            const message = err.response?.data?.error || err.response?.data?.detail || 'Registration failed';
            set({ error: message, isLoading: false });
            return false;
        }
    },

    fetchProfile: async () => {
        try {
            const res = await authApi.getProfile();
            set({ user: profileToUser(res.data.data), isAuthenticated: true });
        } catch {
            get().logout();
        }
    },

    logout: () => {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_refresh_token');
        set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    },

    restoreSession: async () => {
        const token = localStorage.getItem('crm_token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        set({ token, isLoading: true });
        try {
            const res = await authApi.getProfile();
            set({
                user: profileToUser(res.data.data),
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            // Token expired — try refresh
            const refreshToken = localStorage.getItem('crm_refresh_token');
            if (refreshToken) {
                try {
                    const refreshRes = await authApi.refreshToken(refreshToken);
                    const { access_token, refresh_token: newRefresh } = refreshRes.data.data;
                    localStorage.setItem('crm_token', access_token);
                    localStorage.setItem('crm_refresh_token', newRefresh);
                    set({ token: access_token, refreshToken: newRefresh });

                    const profileRes = await authApi.getProfile();
                    set({
                        user: profileToUser(profileRes.data.data),
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return;
                } catch {
                    // Refresh also failed
                }
            }
            get().logout();
        }
    },

    clearError: () => set({ error: null }),
}));
