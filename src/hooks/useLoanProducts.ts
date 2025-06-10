import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoanProduct } from '../types/database';

// Mock loan products for development
const mockLoanProducts: LoanProduct[] = [
  {
    product_id: 1,
    product_name: 'Micro Business Loan',
    currency: 'USD',
    interest_method: 'DECLINING',
    interest_rate_pa: 18.0,
    fee_flat: 50,
    min_term: 6,
    max_term: 24,
    grace_period_days: 7
  },
  {
    product_id: 2,
    product_name: 'Personal Loan',
    currency: 'USD',
    interest_method: 'FLAT',
    interest_rate_pa: 15.0,
    fee_flat: 25,
    min_term: 3,
    max_term: 12,
    grace_period_days: 5
  },
  {
    product_id: 3,
    product_name: 'Agricultural Loan',
    currency: 'USD',
    interest_method: 'DECLINING',
    interest_rate_pa: 16.0,
    fee_flat: 75,
    min_term: 12,
    max_term: 36,
    grace_period_days: 14
  }
];

export const useLoanProducts = () => {
  return useQuery({
    queryKey: ['loan-products'],
    queryFn: async (): Promise<LoanProduct[]> => {
      try {
        const response = await fetch('/api/loan-products');
        if (!response.ok) {
          throw new Error('Failed to fetch loan products');
        }
        return await response.json();
      } catch (error) {
        console.log('API not available, using mock loan products');
        return mockLoanProducts;
      }
    },
  });
};

export const useCreateLoanProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: Omit<LoanProduct, 'product_id'>): Promise<LoanProduct> => {
      try {
        const response = await fetch('/api/loan-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create loan product');
        }
        
        return await response.json();
      } catch (error) {
        // Mock response for development
        return {
          ...productData,
          product_id: Date.now()
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-products'] });
    },
  });
}; 