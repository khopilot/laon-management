export interface User {
  staff_id: string;
  branch_id: string;
  staff_role: 'officer' | 'admin';
  branch_name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  staff_id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
} 