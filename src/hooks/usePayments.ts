import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentSchedule, PaymentTransaction, CreatePaymentRequest, LoanAccount } from '../types/payments';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Fetch payment schedules for Kanban board
export const usePaymentSchedules = (filters?: {
  branch_id?: string;
  status?: string;
  date_filter?: 'today' | 'overdue' | 'upcoming';
}) => {
  return useQuery({
    queryKey: ['payment-schedules', filters],
    queryFn: async (): Promise<PaymentSchedule[]> => {
      const params = new URLSearchParams();
      if (filters?.branch_id) params.append('branch_id', filters.branch_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_filter) params.append('date_filter', filters.date_filter);
      
      // Temporarily use demo data endpoint for production testing
      const response = await fetch(`${API_BASE_URL}/api/demo-payment-schedules?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment schedules');
      }
      return response.json();
    },
  });
};

// Fetch loan accounts
export const useLoanAccounts = (branchId?: string) => {
  return useQuery({
    queryKey: ['loan-accounts', branchId],
    queryFn: async (): Promise<LoanAccount[]> => {
      const params = new URLSearchParams();
      if (branchId) params.append('branch_id', branchId);
      
      const response = await fetch(`${API_BASE_URL}/api/loan-accounts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loan accounts');
      }
      return response.json();
    },
  });
};

// Fetch payment history for a loan
export const usePaymentHistory = (loanId: number) => {
  return useQuery({
    queryKey: ['payment-history', loanId],
    queryFn: async (): Promise<PaymentTransaction[]> => {
      const response = await fetch(`${API_BASE_URL}/api/payments/${loanId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      return response.json();
    },
    enabled: !!loanId,
  });
};

// Record payment mutation
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: CreatePaymentRequest): Promise<PaymentTransaction> => {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to record payment');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch payment-related queries
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['loan-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
  });
}; 