import api from './api';
import { LoanProduct, LoanApplication, LoanAccount, RepaymentSchedule, PaymentRecord } from '../types/database';

export const loanService = {
  // Loan Products
  async getLoanProducts(): Promise<LoanProduct[]> {
    const response = await api.get<LoanProduct[]>('/api/loan-products');
    return response.data;
  },

  async createLoanProduct(productData: Omit<LoanProduct, 'product_id'>): Promise<LoanProduct> {
    const response = await api.post<LoanProduct>('/api/loan-products', productData);
    return response.data;
  },

  // Loan Applications
  async getLoanApplications(branchId?: string): Promise<LoanApplication[]> {
    const response = await api.get<LoanApplication[]>('/api/loan-applications', {
      params: branchId ? { branch_id: branchId } : {}
    });
    return response.data;
  },

  async getLoanApplication(appId: number): Promise<LoanApplication> {
    const response = await api.get<LoanApplication>(`/api/loan-applications/${appId}`);
    return response.data;
  },

  async createLoanApplication(applicationData: Omit<LoanApplication, 'app_id'>): Promise<LoanApplication> {
    const response = await api.post<LoanApplication>('/api/loan-applications', applicationData);
    return response.data;
  },

  async updateLoanApplication(appId: number, applicationData: Partial<LoanApplication>): Promise<LoanApplication> {
    const response = await api.put<LoanApplication>(`/api/loan-applications/${appId}`, applicationData);
    return response.data;
  },

  // Loan Accounts
  async getLoans(branchId?: string): Promise<LoanAccount[]> {
    const response = await api.get<LoanAccount[]>('/api/loans', {
      params: branchId ? { branch_id: branchId } : {}
    });
    return response.data;
  },

  async getLoan(loanId: number): Promise<LoanAccount> {
    const response = await api.get<LoanAccount>(`/api/loans/${loanId}`);
    return response.data;
  },

  async createLoan(loanData: Omit<LoanAccount, 'loan_id'>): Promise<LoanAccount> {
    const response = await api.post<LoanAccount>('/api/loans', loanData);
    return response.data;
  },

  async updateLoan(loanId: number, loanData: Partial<LoanAccount>): Promise<LoanAccount> {
    const response = await api.put<LoanAccount>(`/api/loans/${loanId}`, loanData);
    return response.data;
  },

  // Repayment Schedule
  async getRepaymentSchedule(loanId: number): Promise<RepaymentSchedule[]> {
    const response = await api.get<RepaymentSchedule[]>(`/api/loans/${loanId}/schedule`);
    return response.data;
  },

  // Payments
  async getPayments(loanId?: number): Promise<PaymentRecord[]> {
    const response = await api.get<PaymentRecord[]>('/api/payments', {
      params: loanId ? { loan_id: loanId } : {}
    });
    return response.data;
  },

  async createPayment(paymentData: Omit<PaymentRecord, 'txn_id'>): Promise<PaymentRecord> {
    const response = await api.post<PaymentRecord>('/api/payments', paymentData);
    return response.data;
  },

  async getLoanPayments(loanId: number): Promise<PaymentRecord[]> {
    const response = await api.get<PaymentRecord[]>(`/api/loans/${loanId}/payments`);
    return response.data;
  }
}; 