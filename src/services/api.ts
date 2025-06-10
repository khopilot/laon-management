import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service with common HTTP methods
export const apiService = {
  async get<T>(url: string): Promise<T> {
    const response = await api.get<T>(url);
    return response.data;
  },

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await api.post<T>(url, data);
    return response.data;
  },

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await api.put<T>(url, data);
    return response.data;
  },

  async delete(url: string): Promise<void> {
    await api.delete(url);
  }
};

export default api; 