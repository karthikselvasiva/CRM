import { apiClient, APIResponse } from './client';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    email: string;
    password: string;
    full_name: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    team_id: string;
}

export interface LoginResponse extends AuthTokens {
    user: UserProfile;
}

export const authApi = {
    login: (data: LoginPayload) =>
        apiClient.post<APIResponse<LoginResponse>>('/auth/login', data),

    register: (data: RegisterPayload) =>
        apiClient.post<APIResponse<{ message: string; user: UserProfile }>>('/auth/register', data),

    refreshToken: (refresh_token: string) =>
        apiClient.post<APIResponse<AuthTokens>>('/auth/refresh', { refresh_token }),

    logout: () =>
        apiClient.post<APIResponse<{ message: string }>>('/auth/logout'),

    getProfile: () =>
        apiClient.get<APIResponse<UserProfile>>('/auth/me'),

    updateProfile: (data: { full_name?: string; avatar_url?: string }) =>
        apiClient.patch<APIResponse<UserProfile>>('/auth/me', data),
};
