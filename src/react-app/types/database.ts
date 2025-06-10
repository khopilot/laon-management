export interface Branch {
  branch_id: string;
  name: string;
  province: string;
  phone?: string;
  created_at: string;
}

export interface Staff {
  staff_id: string;
  branch_id: string;
  staff_role: 'officer' | 'admin';
  hire_date?: string;
  supervisor_id?: string;
}

export interface ClientKYC {
  client_id: number;
  branch_id: string;
  national_id: string;
  first_name?: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  sex?: 'M' | 'F';
  date_of_birth?: string;
  primary_phone?: string;
  alt_phone?: string;
  email?: string;
  village_commune_district_province?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClientSocioEco {
  client_id: number;
  occupation?: string;
  employer_name?: string;
  monthly_income_usd?: number;
  household_size?: number;
  education_level?: string;
  cbc_score?: number;
}

export interface LoanProduct {
  product_id: number;
  product_name: string;
  currency: string;
  interest_method: 'FLAT' | 'DECLINING';
  interest_rate_pa: number;
  fee_flat: number;
  min_term: number;
  max_term: number;
  grace_period_days: number;
}

export interface LoanApplication {
  app_id: number;
  branch_id: string;
  client_id: number;
  product_id: number;
  application_date: string;
  requested_amount: number;
  purpose_code?: string;
  requested_term_months?: number;
  repayment_frequency?: 'daily' | 'weekly' | 'monthly';
  application_status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface LoanAccount {
  loan_id: number;
  branch_id: string;
  app_id: number;
  amount_disbursed?: number;
  disbursed_date?: string;
  first_repayment_date?: string;
  maturity_date?: string;
  installment_amount?: number;
  payment_frequency?: string;
  annual_interest_rate_pct?: number;
  principal_outstanding: number;
  interest_accrued: number;
  account_state: 'active' | 'closed' | 'written_off';
}

export interface RepaymentSchedule {
  loan_id: number;
  installment_no: number;
  due_date: string;
  principal_due: number;
  interest_due: number;
  fee_due: number;
  total_due: number;
  status: 'due' | 'paid' | 'late';
}

export interface PaymentRecord {
  txn_id: number;
  loan_id: number;
  installment_no?: number;
  branch_id: string;
  payment_date: string;
  amount_principal: number;
  amount_interest: number;
  amount_fee: number;
  channel?: string;
  collector_staff_id?: string;
} 