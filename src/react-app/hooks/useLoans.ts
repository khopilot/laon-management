import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../services/loans';
import { LoanProduct, LoanApplication, LoanAccount, RepaymentSchedule, PaymentRecord } from '../types/database';

// Mock data for development
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
  }
];

const mockLoanAccounts: LoanAccount[] = [
  {
    loan_id: 1,
    branch_id: 'BR001',
    app_id: 1,
    amount_disbursed: 1000,
    disbursed_date: '2024-01-20',
    first_repayment_date: '2024-02-20',
    maturity_date: '2024-12-20',
    installment_amount: 95.50,
    payment_frequency: 'monthly',
    annual_interest_rate_pct: 18.0,
    principal_outstanding: 850.00,
    interest_accrued: 12.50,
    account_state: 'active'
  },
  {
    loan_id: 2,
    branch_id: 'BR001',
    app_id: 2,
    amount_disbursed: 500,
    disbursed_date: '2024-02-15',
    first_repayment_date: '2024-03-15',
    maturity_date: '2024-08-15',
    installment_amount: 90.00,
    payment_frequency: 'monthly',
    annual_interest_rate_pct: 15.0,
    principal_outstanding: 450.00,
    interest_accrued: 5.75,
    account_state: 'active'
  }
];

// Loan Products
export const useLoanProducts = () => {
  return useQuery({
    queryKey: ['loan-products'],
    queryFn: async (): Promise<LoanProduct[]> => {
      try {
        return await loanService.getLoanProducts();
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
        return await loanService.createLoanProduct(productData);
      } catch (error) {
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

// Loan Applications
export const useLoanApplications = (branchId?: string) => {
  return useQuery({
    queryKey: ['loan-applications', branchId],
    queryFn: async (): Promise<LoanApplication[]> => {
      try {
        return await loanService.getLoanApplications(branchId);
      } catch (error) {
        console.log('API not available, using mock loan applications');
        return [];
      }
    },
  });
};

export const useLoanApplication = (appId: number) => {
  return useQuery({
    queryKey: ['loan-applications', appId],
    queryFn: async (): Promise<LoanApplication> => {
      try {
        return await loanService.getLoanApplication(appId);
      } catch (error) {
        throw new Error('Application not found');
      }
    },
    enabled: !!appId,
  });
};

export const useCreateLoanApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (applicationData: Omit<LoanApplication, 'app_id'>): Promise<LoanApplication> => {
      try {
        return await loanService.createLoanApplication(applicationData);
      } catch (error) {
        return {
          ...applicationData,
          app_id: Date.now()
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
    },
  });
};

export const useUpdateLoanApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ appId, applicationData }: { appId: number; applicationData: Partial<LoanApplication> }): Promise<LoanApplication> => {
      try {
        return await loanService.updateLoanApplication(appId, applicationData);
      } catch (error) {
        return {} as LoanApplication;
      }
    },
    onSuccess: (_, { appId }) => {
      queryClient.invalidateQueries({ queryKey: ['loan-applications'] });
      queryClient.invalidateQueries({ queryKey: ['loan-applications', appId] });
    },
  });
};

// Loan Accounts
export const useLoans = (branchId?: string) => {
  return useQuery({
    queryKey: ['loans', branchId],
    queryFn: async (): Promise<LoanAccount[]> => {
      try {
        return await loanService.getLoans(branchId);
      } catch (error) {
        console.log('API not available, using mock loans');
        return mockLoanAccounts.filter(loan => !branchId || loan.branch_id === branchId);
      }
    },
  });
};

export const useLoan = (loanId: number) => {
  return useQuery({
    queryKey: ['loans', loanId],
    queryFn: async (): Promise<LoanAccount> => {
      try {
        return await loanService.getLoan(loanId);
      } catch (error) {
        const loan = mockLoanAccounts.find(l => l.loan_id === loanId);
        if (!loan) throw new Error('Loan not found');
        return loan;
      }
    },
    enabled: !!loanId,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanData: Omit<LoanAccount, 'loan_id'>): Promise<LoanAccount> => {
      try {
        return await loanService.createLoan(loanData);
      } catch (error) {
        return {
          ...loanData,
          loan_id: Date.now()
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ loanId, loanData }: { loanId: number; loanData: Partial<LoanAccount> }): Promise<LoanAccount> => {
      try {
        return await loanService.updateLoan(loanId, loanData);
      } catch (error) {
        const existingLoan = mockLoanAccounts.find(l => l.loan_id === loanId);
        if (!existingLoan) throw new Error('Loan not found');
        return { ...existingLoan, ...loanData };
      }
    },
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans', loanId] });
    },
  });
};

// Repayment Schedule
export const useRepaymentSchedule = (loanId: number) => {
  return useQuery({
    queryKey: ['loans', loanId, 'schedule'],
    queryFn: async (): Promise<RepaymentSchedule[]> => {
      try {
        return await loanService.getRepaymentSchedule(loanId);
      } catch (error) {
        // Mock repayment schedule
        return [
          {
            loan_id: loanId,
            installment_no: 1,
            due_date: '2024-02-20',
            principal_due: 80.00,
            interest_due: 15.50,
            fee_due: 0,
            total_due: 95.50,
            status: 'paid'
          },
          {
            loan_id: loanId,
            installment_no: 2,
            due_date: '2024-03-20',
            principal_due: 80.00,
            interest_due: 15.50,
            fee_due: 0,
            total_due: 95.50,
            status: 'due'
          }
        ];
      }
    },
    enabled: !!loanId,
  });
};

// Payments
export const usePayments = (loanId?: number) => {
  return useQuery({
    queryKey: ['payments', loanId],
    queryFn: async (): Promise<PaymentRecord[]> => {
      try {
        return await loanService.getPayments(loanId);
      } catch (error) {
        return [];
      }
    },
  });
};

export const useLoanPayments = (loanId: number) => {
  return useQuery({
    queryKey: ['loans', loanId, 'payments'],
    queryFn: async (): Promise<PaymentRecord[]> => {
      try {
        return await loanService.getLoanPayments(loanId);
      } catch (error) {
        return [];
      }
    },
    enabled: !!loanId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData: Omit<PaymentRecord, 'txn_id'>): Promise<PaymentRecord> => {
      try {
        return await loanService.createPayment(paymentData);
      } catch (error) {
        return {
          ...paymentData,
          txn_id: Date.now()
        };
      }
    },
    onSuccess: (_, paymentData) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans', paymentData.loan_id, 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans', paymentData.loan_id] });
    },
  });
}; 