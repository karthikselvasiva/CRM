import axios from 'axios';

let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
if (API_BASE_URL && !API_BASE_URL.endsWith('/api/v1') && !API_BASE_URL.endsWith('8000')) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api/v1';
}

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
