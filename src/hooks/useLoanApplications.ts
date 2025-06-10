import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { LoanApplication, LoanProduct } from '../types/database';

// Extended loan application type with client and product info
export interface LoanApplicationWithDetails extends LoanApplication {
  first_name?: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  national_id?: string;
  primary_phone?: string;
  product_name?: string;
  currency?: string;
  interest_rate_pa?: number;
  min_term?: number;
  max_term?: number;
}

export interface CreateLoanApplicationRequest {
  branch_id: string;
  client_id: number;
  product_id: number;
  requested_amount: number;
  purpose_code?: string;
  requested_term_months: number;
  repayment_frequency?: 'daily' | 'weekly' | 'monthly';
  application_status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface UpdateLoanApplicationRequest {
  requested_amount?: number;
  purpose_code?: string;
  requested_term_months?: number;
  repayment_frequency?: 'daily' | 'weekly' | 'monthly';
  application_status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

// Fetch all loan applications
export const useLoanApplications = (filters?: { branchId?: string; status?: string }) => {
  return useQuery({
    queryKey: ['loan-applications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.branchId) params.append('branch_id', filters.branchId);
      if (filters?.status) params.append('status', filters.status);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      return await apiService.get<LoanApplicationWithDetails[]>(`/api/loan-applications${query}`);
    },
    staleTime: 30000, // 30 seconds
  });
};

// Fetch a specific loan application
export const useLoanApplication = (appId: string) => {
  return useQuery({
    queryKey: ['loan-application', appId],
    queryFn: async () => {
      return await apiService.get<LoanApplicationWithDetails>(`/api/loan-applications/${appId}`);
    },
    enabled: !!appId,
  });
};

// Fetch all loan products
export const useLoanProducts = () => {
  return useQuery({
    queryKey: ['loan-products'],
    queryFn: async () => {
      return await apiService.get<LoanProduct[]>('/api/loan-products');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - products don't change often
  });
};

// Create loan application mutation
export const useCreateLoanApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLoanApplicationRequest) => {
      return await apiService.post<LoanApplication>('/api/loan-applications', data);
    },
    onSuccess: () => {
      // Invalidate and refetch loan applications list
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
    },
    onError: (error) => {
      console.error('Failed to create loan application:', error);
    }
  });
};

// Update loan application mutation
export const useUpdateLoanApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      appId, 
      data 
    }: { 
      appId: string; 
      data: UpdateLoanApplicationRequest 
    }) => {
      return await apiService.put<LoanApplicationWithDetails>(
        `/api/loan-applications/${appId}`,
        data
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
      queryClient.invalidateQueries({ queryKey: ['loan-application', variables.appId] });
    },
    onError: (error) => {
      console.error('Failed to update loan application:', error);
    }
  });
};

// Delete loan application mutation
export const useDeleteLoanApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appId: string) => {
      await apiService.delete(`/api/loan-applications/${appId}`);
      return appId;
    },
    onSuccess: (appId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['loan-application', appId] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
    },
    onError: (error) => {
      console.error('Failed to delete loan application:', error);
    }
  });
}; 