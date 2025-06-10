import api from './api';
import { LoginCredentials, LoginResponse, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<string> {
    const response = await api.post<{ token: string }>('/api/auth/refresh');
    return response.data.token;
  }
}; 