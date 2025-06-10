# 🎯 Loan Management Frontend Implementation Guide
## React/Vite + Cloudflare Setup

> **Project Status**: Backend deployed with D1 database schema  
> **API URL**: https://loan-management-software.pienikdelrieu.workers.dev  
> **Database ID**: aeef85b0-64e6-45a2-a848-dfbabb123bed  

---

## 📋 Current Setup Analysis

### ✅ What's Already Done
- Cloudflare D1 database with complete loan management schema
- Worker API deployed and functional
- React/Vite frontend boilerplate from Cloudflare
- Basic project structure in place

### 🚧 What Needs Implementation
- API integration layer
- Core UI components
- Business logic implementation
- User authentication
- Role-based access control
- Data visualization

---

## 🏗️ Project Architecture

### Frontend Tech Stack
```json
{
  "framework": "React 18 + TypeScript",
  "bundler": "Vite",
  "deployment": "Cloudflare Pages",
  "styling": "Tailwind CSS (recommended)",
  "state": "React Query + Zustand",
  "routing": "React Router v6",
  "forms": "React Hook Form + Zod",
  "ui": "Headless UI + Heroicons",
  "charts": "Recharts"
}
```

### File Structure
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Navigation.tsx
│   │   └── Layout.tsx
│   ├── forms/              # Form components
│   │   ├── ClientForm.tsx
│   │   ├── LoanApplicationForm.tsx
│   │   └── PaymentForm.tsx
│   └── charts/             # Chart components
│       ├── LoanTrendChart.tsx
│       ├── PaymentChart.tsx
│       └── PortfolioChart.tsx
├── pages/                  # Page components
│   ├── Dashboard.tsx
│   ├── Clients.tsx
│   ├── Loans.tsx
│   ├── Payments.tsx
│   ├── Reports.tsx
│   └── Admin.tsx
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useLoans.ts
│   └── usePayments.ts
├── services/               # API service layer
│   ├── api.ts
│   ├── auth.ts
│   ├── clients.ts
│   └── loans.ts
├── types/                  # TypeScript definitions
│   ├── database.ts
│   ├── api.ts
│   └── auth.ts
├── utils/                  # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── store/                  # State management
│   ├── authStore.ts
│   └── appStore.ts
└── styles/                 # Global styles
    └── globals.css
```

---

## 🛠️ Step 1: Dependencies Installation

### Required Dependencies
```bash
# Core React ecosystem
npm install react-router-dom @types/react-router-dom

# Data fetching and state management
npm install @tanstack/react-query axios zustand

# Form handling
npm install react-hook-form @hookform/resolvers zod

# UI and styling
npm install @headlessui/react @heroicons/react
npm install tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# Charts and data visualization
npm install recharts

# Date and utility libraries
npm install date-fns uuid
npm install @types/uuid

# Development tools
npm install -D @types/node
```

### Tailwind CSS Setup
```bash
# Initialize Tailwind
npx tailwindcss init -p

# Update tailwind.config.js
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      }
    },
  },
  plugins: [],
}
```

---

## 🔌 Step 2: API Integration Setup

### Environment Configuration
```bash
# .env.local
VITE_API_BASE_URL=https://loan-management-software.pienikdelrieu.workers.dev
VITE_APP_NAME=Loan Management System
VITE_ENVIRONMENT=development
```

### API Service Layer
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### TypeScript Type Definitions
```typescript
// src/types/database.ts
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
```

---

## 🎨 Step 3: Core UI Components

### Reusable Button Component
```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
```

### Data Table Component
```typescript
// src/components/ui/Table.tsx
import React from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T>({ data, columns, loading, emptyMessage = 'No data available' }: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔐 Step 4: Authentication & State Management

### Auth Store with Zustand
```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  staff_id: string;
  branch_id: string;
  staff_role: 'officer' | 'admin';
  branch_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) => {
        localStorage.setItem('auth_token', token);
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### React Query Hooks
```typescript
// src/hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { ClientKYC } from '../types/database';

export const useClients = (branchId?: string) => {
  return useQuery({
    queryKey: ['clients', branchId],
    queryFn: async (): Promise<ClientKYC[]> => {
      const response = await api.get('/api/clients', {
        params: branchId ? { branch_id: branchId } : {}
      });
      return response.data;
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: Omit<ClientKYC, 'client_id' | 'created_at'>): Promise<ClientKYC> => {
      const response = await api.post('/api/clients', clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
```

---

## 📱 Step 5: Key Pages Implementation

### Dashboard Page
```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useBranches } from '../hooks/useBranches';
import { useClients } from '../hooks/useClients';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: branches } = useBranches();
  const { data: clients } = useClients(user?.branch_id);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.staff_role === 'admin' ? 'Admin' : 'Officer'}
        </h1>
        <p className="text-gray-600">
          {user?.branch_name || 'Branch'} - {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Clients</h3>
          <p className="text-3xl font-bold text-primary-600">{clients?.length || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Overdue Payments</h3>
          <p className="text-3xl font-bold text-red-600">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-600">
          No recent activity
        </div>
      </div>
    </div>
  );
};
```

### Clients Page
```typescript
// src/pages/Clients.tsx
import React, { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useClients } from '../hooks/useClients';
import { ClientKYC } from '../types/database';
import { useAuthStore } from '../store/authStore';

export const Clients: React.FC = () => {
  const { user } = useAuthStore();
  const { data: clients, isLoading } = useClients(user?.branch_id);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const columns = [
    {
      key: 'client_id' as keyof ClientKYC,
      header: 'ID',
    },
    {
      key: 'national_id' as keyof ClientKYC,
      header: 'National ID',
    },
    {
      key: 'first_name' as keyof ClientKYC,
      header: 'First Name',
    },
    {
      key: 'khmer_last_name' as keyof ClientKYC,
      header: 'Last Name (Khmer)',
    },
    {
      key: 'primary_phone' as keyof ClientKYC,
      header: 'Phone',
    },
    {
      key: 'created_at' as keyof ClientKYC,
      header: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Add New Client
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Table
          data={clients || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No clients found"
        />
      </div>

      {/* TODO: Add CreateClientModal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <p className="text-gray-600 mb-4">Client creation form will be implemented here.</p>
            <Button onClick={() => setShowCreateForm(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🚀 Step 6: Required API Endpoints

### Backend API Endpoints to Implement
```typescript
// The following endpoints need to be added to your Worker API:

// Authentication
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Clients
GET    /api/clients?branch_id=<id>
POST   /api/clients
PUT    /api/clients/:id
GET    /api/clients/:id
DELETE /api/clients/:id

// Loan Products
GET  /api/loan-products
POST /api/loan-products
PUT  /api/loan-products/:id

// Loan Applications
GET  /api/loan-applications?branch_id=<id>
POST /api/loan-applications
PUT  /api/loan-applications/:id
GET  /api/loan-applications/:id

// Loan Accounts
GET  /api/loans?branch_id=<id>
POST /api/loans
PUT  /api/loans/:id
GET  /api/loans/:id
GET  /api/loans/:id/schedule

// Payments
GET  /api/payments?loan_id=<id>
POST /api/payments
GET  /api/loans/:id/payments

// Reports
GET /api/reports/portfolio?branch_id=<id>
GET /api/reports/delinquency?branch_id=<id>
GET /api/reports/disbursements?branch_id=<id>

// Staff Management (Admin only)
GET  /api/staff?branch_id=<id>
POST /api/staff
PUT  /api/staff/:id
```

---

## 📊 Step 7: Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup project dependencies
- [ ] Create core UI components
- [ ] Implement authentication flow
- [ ] Setup routing and layout
- [ ] Add error handling

### Phase 2: Core Features (Week 3-4)
- [ ] Client management (CRUD)
- [ ] Branch and staff views
- [ ] Basic dashboard with KPIs
- [ ] Data tables with filtering

### Phase 3: Loan Management (Week 5-6)
- [ ] Loan products management
- [ ] Loan application workflow
- [ ] Loan account tracking
- [ ] Repayment schedules

### Phase 4: Payment Processing (Week 7-8)
- [ ] Payment recording interface
- [ ] Payment history views
- [ ] Late fee calculations
- [ ] Payment reports

### Phase 5: Reports & Analytics (Week 9-10)
- [ ] Portfolio analysis
- [ ] Delinquency reports
- [ ] Charts and visualizations
- [ ] Export functionality

### Phase 6: Polish & Deploy (Week 11-12)
- [ ] Responsive design optimization
- [ ] Performance improvements
- [ ] Testing and bug fixes
- [ ] Production deployment

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

---

## 🎯 Success Criteria

### Technical Requirements
- [ ] Responsive design (mobile-first approach)
- [ ] TypeScript type safety
- [ ] Loading states and error handling
- [ ] Accessibility compliance
- [ ] Performance optimization

### Business Requirements
- [ ] Role-based access control
- [ ] Branch-level data isolation
- [ ] Real-time data updates
- [ ] Comprehensive reporting
- [ ] User-friendly interface

---

## 📚 Resources

### Documentation Links
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Guide](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Cloudflare Pages Deployment](https://developers.cloudflare.com/pages/)

### Code Examples
- Component patterns in `/src/components/`
- API integration in `/src/hooks/`
- State management in `/src/store/`
- Type definitions in `/src/types/`

---

**🚀 Ready to start development!** Begin with Phase 1 and progressively implement features. Focus on creating a solid foundation before adding complex business logic.
