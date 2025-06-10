// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Login } from './pages/Login';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Placeholder components for pages not yet implemented
const LoanApplications = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Loan applications management will be implemented in Phase 3.</p>
    </div>
  </div>
);

const Loans = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Active Loans</h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Loan portfolio management will be implemented in Phase 3.</p>
    </div>
  </div>
);

const Payments = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Payment recording will be implemented in Phase 4.</p>
    </div>
  </div>
);

const Reports = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Reports and analytics will be implemented in Phase 5.</p>
    </div>
  </div>
);

const Admin = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
    <div className="bg-white shadow rounded-lg p-6">
      <p className="text-gray-600">Admin features for staff and branch management will be implemented in Phase 6.</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="loan-applications" element={<LoanApplications />} />
            <Route path="loans" element={<Loans />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
