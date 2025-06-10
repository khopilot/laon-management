-- Create loan account for approved application ID 2
-- Principal: $3000, Term: 12 months, Rate: 15% flat, Fee: $25

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

-- Generate repayment schedule
-- For flat rate: Total interest = Principal * Rate = 3000 * 15% = 450
-- Monthly payment = (Principal + Interest) / Term = (3000 + 450) / 12 = 287.50

-- Monthly installments - mix of overdue, due today, and upcoming for demonstration
INSERT INTO repayment_schedule (
  loan_id,
  installment_no,
  due_date,
  principal_due,
  interest_due,
  total_due,
  status,
  created_at
) VALUES
  (1, 1, '2025-01-15', 250.00, 37.50, 287.50, 'paid', datetime('now')),   -- Already paid
  (1, 2, '2025-01-10', 250.00, 37.50, 287.50, 'due', datetime('now')),   -- Overdue 
  (1, 3, '2025-01-12', 250.00, 37.50, 287.50, 'due', datetime('now')),   -- Overdue
  (1, 4, date('now'), 250.00, 37.50, 287.50, 'due', datetime('now')),    -- Due today
  (1, 5, date('now', '+1 day'), 250.00, 37.50, 287.50, 'due', datetime('now')),  -- Due tomorrow
  (1, 6, '2025-02-15', 250.00, 37.50, 287.50, 'due', datetime('now')),   -- Future
  (1, 7, '2025-03-15', 250.00, 37.50, 287.50, 'due', datetime('now')),
  (1, 8, '2025-04-15', 250.00, 37.50, 287.50, 'due', datetime('now')),
  (1, 9, '2025-05-15', 250.00, 37.50, 287.50, 'due', datetime('now')),
  (1, 10, '2025-06-15', 250.00, 37.50, 287.50, 'due', datetime('now')),
  (1, 11, '2025-07-15', 250.00, 37.50, 287.50, 'due', datetime('now')),
  (1, 12, '2025-08-15', 250.00, 37.50, 287.50, 'due', datetime('now')); 