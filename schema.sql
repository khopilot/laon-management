-- Loan Management System Database Schema
-- D1 Database Schema for Cloudflare Workers

-- Branch Table
CREATE TABLE IF NOT EXISTS branch (
    branch_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    province TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Client KYC Table
CREATE TABLE IF NOT EXISTS client_kyc (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id TEXT NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    first_name TEXT,
    khmer_last_name TEXT,
    latin_last_name TEXT,
    sex TEXT CHECK (sex IN ('M', 'F')),
    date_of_birth TEXT,
    primary_phone TEXT,
    alt_phone TEXT,
    email TEXT,
    village_commune_district_province TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);

-- Client Socio-Economic Data Table
CREATE TABLE IF NOT EXISTS client_socio_eco (
    client_id INTEGER PRIMARY KEY,
    occupation TEXT,
    employer_name TEXT,
    monthly_income_usd REAL,
    household_size INTEGER,
    education_level TEXT CHECK (education_level IN ('No formal education', 'Primary education', 'Secondary education', 'Higher education', 'Vocational training')),
    cbc_score INTEGER CHECK (cbc_score >= 0 AND cbc_score <= 1000),
    FOREIGN KEY (client_id) REFERENCES client_kyc (client_id) ON DELETE CASCADE
);

-- Loan Products Table
CREATE TABLE IF NOT EXISTS loan_products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    interest_method TEXT NOT NULL CHECK (interest_method IN ('FLAT', 'DECLINING')),
    interest_rate_pa REAL NOT NULL,
    fee_flat REAL DEFAULT 0,
    min_term INTEGER NOT NULL,
    max_term INTEGER NOT NULL,
    grace_period_days INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);

-- Loan Application Table
CREATE TABLE IF NOT EXISTS loan_application (
    app_id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id TEXT NOT NULL,
    client_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    application_date TEXT NOT NULL DEFAULT (datetime('now')),
    requested_amount REAL NOT NULL,
    purpose_code TEXT,
    requested_term_months INTEGER,
    repayment_frequency TEXT CHECK (repayment_frequency IN ('daily', 'weekly', 'monthly')),
    application_status TEXT NOT NULL DEFAULT 'draft' CHECK (application_status IN ('draft', 'pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (client_id) REFERENCES client_kyc (client_id),
    FOREIGN KEY (product_id) REFERENCES loan_products (product_id)
);

-- Loan Account Table
CREATE TABLE IF NOT EXISTS loan_account (
    loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch_id TEXT NOT NULL,
    app_id INTEGER NOT NULL UNIQUE,
    amount_disbursed REAL,
    disbursed_date TEXT,
    first_repayment_date TEXT,
    maturity_date TEXT,
    installment_amount REAL,
    payment_frequency TEXT,
    annual_interest_rate_pct REAL,
    principal_outstanding REAL NOT NULL DEFAULT 0,
    interest_accrued REAL NOT NULL DEFAULT 0,
    account_state TEXT NOT NULL DEFAULT 'active' CHECK (account_state IN ('active', 'closed', 'written_off')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT,
    FOREIGN KEY (app_id) REFERENCES loan_application (app_id)
);

-- Repayment Schedule Table
CREATE TABLE IF NOT EXISTS repayment_schedule (
    schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    installment_no INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    principal_due REAL NOT NULL,
    interest_due REAL NOT NULL,
    fee_due REAL DEFAULT 0,
    total_due REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'paid', 'late')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (loan_id) REFERENCES loan_account (loan_id),
    UNIQUE(loan_id, installment_no)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    payment_date TEXT NOT NULL DEFAULT (datetime('now')),
    amount_paid REAL NOT NULL,
    principal_paid REAL NOT NULL,
    interest_paid REAL NOT NULL,
    fee_paid REAL DEFAULT 0,
    payment_method TEXT,
    reference_no TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (loan_id) REFERENCES loan_account (loan_id)
);

-- User Accounts Table
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'officer', 'teller')),
    branch_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_kyc_national_id ON client_kyc (national_id);
CREATE INDEX IF NOT EXISTS idx_client_kyc_branch_id ON client_kyc (branch_id);
CREATE INDEX IF NOT EXISTS idx_loan_application_client_id ON loan_application (client_id);
CREATE INDEX IF NOT EXISTS idx_loan_application_status ON loan_application (application_status);
CREATE INDEX IF NOT EXISTS idx_loan_account_branch_id ON loan_account (branch_id);
CREATE INDEX IF NOT EXISTS idx_loan_account_state ON loan_account (account_state);
CREATE INDEX IF NOT EXISTS idx_repayment_schedule_loan_id ON repayment_schedule (loan_id);
CREATE INDEX IF NOT EXISTS idx_repayment_schedule_due_date ON repayment_schedule (due_date);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_loan_id ON payment_transactions (loan_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON user_accounts (username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_branch_id ON user_accounts (branch_id);

-- Insert some sample data for testing
INSERT OR IGNORE INTO branch (branch_id, name, province, phone) VALUES
('PP01', 'Phnom Penh Main', 'Phnom Penh', '+855-12-345-678'),
('SR01', 'Siem Reap Branch', 'Siem Reap', '+855-12-345-679'),
('BB01', 'Battambang Branch', 'Battambang', '+855-12-345-680');

INSERT OR IGNORE INTO loan_products (product_name, currency, interest_method, interest_rate_pa, fee_flat, min_term, max_term, grace_period_days) VALUES
('Standard Loan', 'USD', 'DECLINING', 18.0, 50.0, 6, 36, 7),
('Micro Loan', 'USD', 'FLAT', 15.0, 25.0, 3, 12, 0),
('Agriculture Loan', 'USD', 'DECLINING', 12.0, 75.0, 12, 60, 14);

-- Insert a test user
INSERT OR IGNORE INTO user_accounts (username, password_hash, full_name, email, role, branch_id) VALUES
('staff_001', '$2a$10$hash_placeholder', 'Test Staff', 'staff@example.com', 'officer', 'PP01'); 