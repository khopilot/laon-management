export interface PaymentSchedule {
  schedule_id: number;
  loan_id: number;
  installment_no: number;
  due_date: string;
  principal_due: number;
  interest_due: number;
  fee_due: number;
  total_due: number;
  status: 'due' | 'paid' | 'late';
  
  // Client info (from joins)
  client_id: number;
  client_name: string;
  first_name: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  national_id: string;
  primary_phone?: string;
  
  // Loan info (from joins)
  branch_id: string;
  principal_outstanding: number;
  interest_accrued: number;
  account_state: string;
  installment_amount: number;
  
  // Product info (from joins)
  product_name: string;
  grace_period_days: number;
  
  // Calculated fields
  days_overdue: number;
  grace_period_remaining: number;
  is_in_grace_period: boolean;
  payment_status: 'due' | 'paid' | 'late';
}

export interface PaymentTransaction {
  transaction_id: number;
  loan_id: number;
  payment_date: string;
  amount_paid: number;
  principal_paid: number;
  interest_paid: number;
  fee_paid: number;
  payment_method?: string;
  reference_no?: string;
  created_at: string;
}

export interface CreatePaymentRequest {
  loan_id: number;
  amount_paid: number;
  principal_paid: number;
  interest_paid: number;
  fee_paid?: number;
  payment_method?: string;
  reference_no?: string;
  payment_date?: string;
}

export interface LoanAccount {
  loan_id: number;
  branch_id: string;
  app_id: number;
  amount_disbursed: number;
  disbursed_date: string;
  first_repayment_date: string;
  maturity_date: string;
  installment_amount: number;
  payment_frequency: string;
  annual_interest_rate_pct: number;
  principal_outstanding: number;
  interest_accrued: number;
  account_state: 'active' | 'closed' | 'written_off';
  created_at: string;
  updated_at?: string;
  
  // Client info (from joins)
  client_id: number;
  first_name: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  national_id: string;
  
  // Product info (from joins)  
  product_id: number;
  product_name: string;
  currency: string;
} 