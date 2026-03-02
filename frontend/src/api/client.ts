import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor — attach JWT from localStorage (avoids circular import with authStore)
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('crm_token');
            localStorage.removeItem('crm_refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Standard API response envelope
export interface APIResponse<T> {
    data: T;
    error: string | null;
    meta?: {
        page: number;
        limit: number;
        total: number;
    };
}
