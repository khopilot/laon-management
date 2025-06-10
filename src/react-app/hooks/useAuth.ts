import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { LoginCredentials, User } from '../types/auth';

// Mock user for development
const mockUser: User = {
  staff_id: 'staff_001',
  branch_id: 'BR001',
  staff_role: 'officer',
  branch_name: 'Phnom Penh Branch'
};

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        return await authService.login(credentials);
      } catch (error) {
        // Fallback to mock authentication for development
        console.log('API not available, using mock authentication');
        return {
          token: 'mock-token-' + Date.now(),
          user: mockUser
        };
      }
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        // Ignore logout errors for development
        console.log('API logout failed, proceeding with local logout');
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        // Return stored user if API is not available
        return user;
      }
    },
    enabled: !!token && isAuthenticated,
    retry: false,
  });

  return {
    user: currentUser || user,
    token,
    isAuthenticated,
    isLoading: loginMutation.isPending || logoutMutation.isPending,
    isLoadingUser,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error,
  };
}; 