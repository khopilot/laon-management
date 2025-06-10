-- Create loan account for approved application ID 2
INSERT INTO loan_account (
  app_id,
  branch_id,
  amount_disbursed,
  disbursed_date,
  first_repayment_date,
  maturity_date,
  installment_amount,
  payment_frequency,
  annual_interest_rate_pct,
  principal_outstanding,
  interest_accrued,
  account_state
) VALUES (
  2,
  'BR001',
  3000.00,
  '2024-12-15',
  '2025-01-15',
  '2025-12-15',
  287.50,
  'monthly',
  15.00,
  2750.00,
  337.50,
  'active'
); 