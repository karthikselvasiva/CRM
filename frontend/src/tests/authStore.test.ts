import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/authService';

// Mock the authApi
vi.mock('../api/authService', () => ({
    authApi: {
        login: vi.fn(),
        register: vi.fn(),
        getProfile: vi.fn(),
        refreshToken: vi.fn(),
    }
}));

describe('authStore', () => {
    beforeEach(() => {
        // Reset Zustand store state before each test
        const { logout } = useAuthStore.getState();
        logout();
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('should handle successful login', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            full_name: 'Test User',
            avatar_url: null,
            role: 'admin',
            team_id: 'team-1',
        };

        const mockResponse = {
            data: {
                data: {
                    access_token: 'valid-token',
                    refresh_token: 'refresh-token',
                    user: mockUser,
                }
            }
        };

        // Correctly mock the resolved value
        (authApi.login as any).mockResolvedValue(mockResponse);

        const result = await useAuthStore.getState().login({ email: 'test@example.com', password: 'password' });

        expect(result).toBe(true);
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(true);
        expect(state.user?.email).toBe('test@example.com');
        expect(state.token).toBe('valid-token');
        expect(localStorage.getItem('crm_token')).toBe('valid-token');
    });

    it('should handle login failure', async () => {
        const mockError = {
            response: {
                data: {
                    detail: 'Invalid credentials'
                }
            }
        };

        (authApi.login as any).mockRejectedValue(mockError);

        const result = await useAuthStore.getState().login({ email: 'test@example.com', password: 'wrong' });

        expect(result).toBe(false);
        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBe('Invalid credentials');
    });

    it('should handle logout', () => {
        // Set some state as if logged in
        useAuthStore.setState({
            isAuthenticated: true,
            user: { id: '1', email: 't@t.com', fullName: 'T', avatarUrl: null, role: 'admin', teamId: '1' },
            token: 'tok'
        });
        localStorage.setItem('crm_token', 'tok');

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(localStorage.getItem('crm_token')).toBeNull();
    });
});
