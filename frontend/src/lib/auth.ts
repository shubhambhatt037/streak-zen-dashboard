import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_picture?: string;
  timezone: string;
  email_notifications: boolean;
  reminder_time: string;
  date_joined: string;
  last_login?: string;
}

// Authentication functions
export const authAPI = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/users/login/', credentials);
    return response.data;
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/users/register/', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post('/users/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile/update/', data);
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> => {
    await api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/users/stats/');
    return response.data;
  },
};

// Token management
export const tokenManager = {
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),

  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
}; 