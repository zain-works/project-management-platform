const BASE_URL = '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  details?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('pmp_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // sends HTTP-only session cookie automatically
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.error || 'An unexpected error occurred', response.status, data.details);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    signup: (data: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    forgotPassword: (data: { email: string }) =>
      request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (data: any) =>
      request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
    verifyEmail: (token: string) =>
      request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) }),
    resendVerification: () => request('/auth/resend-verification', { method: 'POST' }),
    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
      request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Users (convenience alias for profile / settings)
  users: {
    updateProfile: (data: { name?: string; avatarUrl?: string }) =>
      request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Workspaces
  workspaces: {
    list: () => request('/workspaces'),
    get: (id: string) => request(`/workspaces/${id}`),
    create: (data: any) => request('/workspaces', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/workspaces/${id}`, { method: 'DELETE' }),
    listMembers: (id: string) => request(`/workspaces/${id}/members`),
    inviteMember: (id: string, data: any) =>
      request(`/workspaces/${id}/invitations`, { method: 'POST', body: JSON.stringify(data) }),
    acceptInvitation: (token: string) =>
      request('/workspaces/invitations/accept', { method: 'POST', body: JSON.stringify({ token }) }),
    updateMemberRole: (workspaceId: string, userId: string, role: string) =>
      request(`/workspaces/${workspaceId}/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    removeMember: (workspaceId: string, userId: string) =>
      request(`/workspaces/${workspaceId}/members/${userId}`, { method: 'DELETE' }),
  },

  // Projects
  projects: {
    list: (workspaceId: string, params?: { status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request(`/workspaces/${workspaceId}/projects${qs}`);
    },
    get: (id: string) => request(`/projects/${id}`),
    create: (workspaceId: string, data: any) =>
      request(`/workspaces/${workspaceId}/projects`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    archive: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
    getActivity: (id: string, page = 1) => request(`/projects/${id}/activity?page=${page}`),
  },

  // Tasks
  tasks: {
    list: (projectId: string, params?: any) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
        });
      }
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request(`/projects/${projectId}/tasks${qs}`);
    },
    get: (id: string) => request(`/tasks/${id}`),
    create: (projectId: string, data: any) =>
      request(`/projects/${projectId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string, position?: number) =>
      request(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, position }),
      }),
    updateAssignee: (id: string, assigneeId: string | null) =>
      request(`/tasks/${id}/assignee`, {
        method: 'PATCH',
        body: JSON.stringify({ assigneeId }),
      }),
    delete: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),
    myTasks: (workspaceId?: string) => {
      const qs = workspaceId ? `?workspaceId=${workspaceId}` : '';
      return request(`/tasks/my-tasks${qs}`);
    },
  },

  // Comments
  comments: {
    list: (taskId: string) => request(`/tasks/${taskId}/comments`),
    create: (taskId: string, content: string) =>
      request(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    update: (id: string, content: string) =>
      request(`/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
    delete: (id: string) => request(`/comments/${id}`, { method: 'DELETE' }),
  },

  // Notifications
  notifications: {
    list: (params?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.unreadOnly) query.append('unreadOnly', 'true');
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request(`/notifications${qs}`);
    },
    unreadCount: () => request('/notifications/unread-count'),
    markRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  },

  // Dashboard & Search
  dashboard: {
    get: (workspaceId: string) => request(`/dashboard?workspaceId=${workspaceId}`),
    search: (workspaceId: string, q: string) =>
      request(`/search?workspaceId=${workspaceId}&q=${encodeURIComponent(q)}`),
  },

  // Health & Dev Mailbox
  system: {
    health: () => request('/health'),
    getDevEmails: () => request('/dev/emails'),
    clearDevEmails: () => request('/dev/emails', { method: 'DELETE' }),
  },
};
