import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  console.log('Making request to:', fullUrl);
  console.log('Request data:', config.data);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface GroupMember {
  user_id: number;
  user_name: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  members?: GroupMember[];
  created_at?: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: User | number; // Can be User object or just user ID
  group: Group | number;  // Can be Group object or just Group ID
  split_between: User[] | number[]; // Can be User objects or just user IDs
  created_at: string;
}

export interface Invitation {
  id: number;
  group_id: number;
  invited_by: number;
  invited_email: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // Optional full objects (might be populated by backend in future)
  group?: Group;
  invited_by_user?: User;
}

export const authAPI = {
  login: (credentials: LoginCredentials) =>
    api.post<{ access_token: string; token_type: string }>('/auth/login', credentials),
  
  register: (data: RegisterData) =>
    api.post<{ access_token: string; token_type: string }>('/auth/register', data),
  
  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};

export const groupsAPI = {
  getGroups: () => api.get<Group[]>('/groups'),
  getGroup: (id: number) => api.get<Group>(`/groups/${id}`),
  createGroup: (data: { name: string; description?: string }) =>
    api.post<Group>('/groups', data),
  updateGroup: (id: number, data: Partial<Group>) =>
    api.put<Group>(`/groups/${id}`, data),
  deleteGroup: (id: number) => api.delete(`/groups/${id}`),
  sendInvitation: (groupId: number, email: string) =>
    api.post(`/groups/${groupId}/invite`, { email }),
  getInvitations: () => api.get('/invitations'),
  acceptInvitation: (invitationId: number) =>
    api.post(`/invitations/${invitationId}/accept`),
  rejectInvitation: (invitationId: number) =>
    api.post(`/invitations/${invitationId}/reject`),
  addMember: (groupId: number, email: string) =>
    api.post<Group>(`/groups/${groupId}/members`, { email }),
};

export const expensesAPI = {
  getExpenses: (groupId?: number) => {
    // Ensure we only send group_id if it's a valid truthy value
    if (groupId) {
      return api.get<Expense[]>(`/expenses?group_id=${groupId}`);
    }
    return api.get<Expense[]>('/expenses');
  },
  
  getExpense: (id: number) =>
    api.get<Expense>(`/expenses/${id}`),
  
  createExpense: (data: {
    description: string;
    amount: number;
    group_id: number;
    split_between: number[];
  }) =>
    api.post<Expense>('/expenses', data),
  
  updateExpense: (id: number, data: Partial<Expense>) =>
    api.put<Expense>(`/expenses/${id}`, data),
  
  deleteExpense: (id: number) =>
    api.delete(`/expenses/${id}`),
};
