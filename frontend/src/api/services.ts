import { apiClient, APIResponse } from './client';

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        apiClient.post<APIResponse<{ token: string; user: unknown }>>('/auth/login', { email, password }),
    refresh: () =>
        apiClient.post<APIResponse<{ token: string }>>('/auth/refresh'),
    logout: () =>
        apiClient.post('/auth/logout'),
};

// Contacts API
export const contactsAPI = {
    list: (params?: Record<string, string | number>) =>
        apiClient.get<APIResponse<unknown[]>>('/contacts', { params }),
    get: (id: string) =>
        apiClient.get<APIResponse<unknown>>(`/contacts/${id}`),
    create: (data: Record<string, unknown>) =>
        apiClient.post<APIResponse<unknown>>('/contacts', data),
    update: (id: string, data: Record<string, unknown>) =>
        apiClient.patch<APIResponse<unknown>>(`/contacts/${id}`, data),
    delete: (id: string) =>
        apiClient.delete(`/contacts/${id}`),
    import: (file: FormData) =>
        apiClient.post('/contacts/import', file, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Leads API
export const leadsAPI = {
    list: (params?: Record<string, string | number>) =>
        apiClient.get<APIResponse<unknown[]>>('/leads', { params }),
    get: (id: string) =>
        apiClient.get<APIResponse<unknown>>(`/leads/${id}`),
    create: (data: Record<string, unknown>) =>
        apiClient.post<APIResponse<unknown>>('/leads', data),
    update: (id: string, data: Record<string, unknown>) =>
        apiClient.patch<APIResponse<unknown>>(`/leads/${id}`, data),
    convert: (id: string) =>
        apiClient.post<APIResponse<unknown>>(`/leads/${id}/convert`),
};

// Deals API
export const dealsAPI = {
    list: (params?: Record<string, string | number>) =>
        apiClient.get<APIResponse<unknown[]>>('/deals', { params }),
    get: (id: string) =>
        apiClient.get<APIResponse<unknown>>(`/deals/${id}`),
    create: (data: Record<string, unknown>) =>
        apiClient.post<APIResponse<unknown>>('/deals', data),
    updateStage: (id: string, stageId: string) =>
        apiClient.patch<APIResponse<unknown>>(`/deals/${id}/stage`, { stage_id: stageId }),
    close: (id: string, data: Record<string, unknown>) =>
        apiClient.patch<APIResponse<unknown>>(`/deals/${id}/close`, data),
};

// Tasks API
export const tasksAPI = {
    list: (params?: Record<string, string | number>) =>
        apiClient.get<APIResponse<unknown[]>>('/tasks', { params }),
    get: (id: string) =>
        apiClient.get<APIResponse<unknown>>(`/tasks/${id}`),
    create: (data: Record<string, unknown>) =>
        apiClient.post<APIResponse<unknown>>('/tasks', data),
    update: (id: string, data: Record<string, unknown>) =>
        apiClient.patch<APIResponse<unknown>>(`/tasks/${id}`, data),
    delete: (id: string) =>
        apiClient.delete(`/tasks/${id}`),
};

// Reports API
export const reportsAPI = {
    dashboard: (params?: Record<string, string>) =>
        apiClient.get<APIResponse<unknown>>('/reports/dashboard', { params }),
};

// Automations API
export const automationsAPI = {
    listRules: () =>
        apiClient.get<APIResponse<unknown[]>>('/automations/rules'),
    getRule: (id: string) =>
        apiClient.get<APIResponse<unknown>>(`/automations/rules/${id}`),
    createRule: (data: Record<string, unknown>) =>
        apiClient.post<APIResponse<unknown>>('/automations/rules', data),
    updateRule: (id: string, data: Record<string, unknown>) =>
        apiClient.put<APIResponse<unknown>>(`/automations/rules/${id}`, data),
    deleteRule: (id: string) =>
        apiClient.delete(`/automations/rules/${id}`),
    listLogs: () =>
        apiClient.get<APIResponse<unknown[]>>('/automations/logs'),
};

// Settings API
export const settingsAPI = {
    getProfile: () =>
        apiClient.get<APIResponse<unknown>>('/settings/profile'),
    updateProfile: (data: Record<string, unknown>) =>
        apiClient.patch<APIResponse<unknown>>('/settings/profile', data),
    listPipelineStages: () =>
        apiClient.get<APIResponse<unknown[]>>('/settings/pipeline-stages'),
    listCustomFields: () =>
        apiClient.get<APIResponse<unknown[]>>('/settings/custom-fields'),
    listIntegrations: () =>
        apiClient.get<APIResponse<unknown[]>>('/settings/integrations'),
    toggleIntegration: (id: string) =>
        apiClient.post<APIResponse<unknown>>(`/settings/integrations/${id}/toggle`),
    listApiKeys: () =>
        apiClient.get<APIResponse<unknown[]>>('/settings/api-keys'),
    createApiKey: (name: string) =>
        apiClient.post<APIResponse<unknown>>('/settings/api-keys', { name }),
    revokeApiKey: (id: string) =>
        apiClient.delete(`/settings/api-keys/${id}`),
};
