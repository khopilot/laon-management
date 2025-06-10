// src/App.tsx

import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Login } from './pages/Login';
import { Button } from './components/ui/Button';
import { Table } from './components/ui/Table';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { LoanApplicationForm } from './components/forms/LoanApplicationForm';
import { useLoanApplications, useCreateLoanApplication, useUpdateLoanApplication, useDeleteLoanApplication } from './hooks/useLoanApplications';
import type { LoanApplicationWithDetails, CreateLoanApplicationRequest } from './hooks/useLoanApplications';
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

// Loan Applications component with full functionality
const LoanApplications = () => {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedApplication, setSelectedApplication] = useState<LoanApplicationWithDetails | null>(null);

  // Queries and mutations
  const { data: applications, isLoading, error } = useLoanApplications();
  const createApplicationMutation = useCreateLoanApplication();
  const updateApplicationMutation = useUpdateLoanApplication();
  const deleteApplicationMutation = useDeleteLoanApplication();

  // Handle form submission
  const handleFormSubmit = async (data: CreateLoanApplicationRequest) => {
    console.log('Submitting loan application data:', data);
    
    try {
      if (viewMode === 'create') {
        await createApplicationMutation.mutateAsync(data);
      } else if (viewMode === 'edit' && selectedApplication) {
        await updateApplicationMutation.mutateAsync({
          appId: selectedApplication.app_id.toString(),
          data: data
        });
      }
      setViewMode('list');
      setSelectedApplication(null);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to save loan application. Please check the form and try again.');
    }
  };

  // Handle edit application
  const handleEditApplication = (application: LoanApplicationWithDetails) => {
    setSelectedApplication(application);
    setViewMode('edit');
  };

  // Handle delete application
  const handleDeleteApplication = async (appId: string) => {
    if (confirm('Are you sure you want to delete this loan application? This action cannot be undone.')) {
      try {
        await deleteApplicationMutation.mutateAsync(appId);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete loan application.');
      }
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedApplication(null);
  };

  // Table columns for loan applications
  const columns = [
    {
      key: 'app_id' as keyof LoanApplicationWithDetails,
      header: 'App ID',
      render: (value: any) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'first_name' as keyof LoanApplicationWithDetails,
      header: 'Client',
      render: (value: any, item: LoanApplicationWithDetails) => (
        <div>
          <div className="font-medium">{value} {item.khmer_last_name} {item.latin_last_name}</div>
          <div className="text-sm text-gray-500">{item.national_id}</div>
        </div>
      )
    },
    {
      key: 'product_name' as keyof LoanApplicationWithDetails,
      header: 'Product',
      render: (value: any) => (
        <span className="text-sm">{value}</span>
      )
    },
    {
      key: 'requested_amount' as keyof LoanApplicationWithDetails,
      header: 'Amount',
      render: (value: any, item: LoanApplicationWithDetails) => (
        <span className="font-mono text-sm">
          {item.currency} {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'requested_term_months' as keyof LoanApplicationWithDetails,
      header: 'Term',
      render: (value: any) => (
        <span className="text-sm">{value} months</span>
      )
    },
    {
      key: 'application_status' as keyof LoanApplicationWithDetails,
      header: 'Status',
      render: (value: any) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'application_date' as keyof LoanApplicationWithDetails,
      header: 'Date',
      render: (value: any) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions' as keyof LoanApplicationWithDetails,
      header: 'Actions',
      render: (_: any, item: LoanApplicationWithDetails) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditApplication(item)}
            className="p-1 h-8 w-8"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => handleDeleteApplication(item.app_id.toString())}
            className="p-1 h-8 w-8"
            disabled={deleteApplicationMutation.isPending}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Show form view
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="p-6">
        <LoanApplicationForm
          mode={viewMode}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          isLoading={createApplicationMutation.isPending || updateApplicationMutation.isPending}
          initialData={selectedApplication || undefined}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Loan Applications</h1>
        <Button
          variant="primary"
          onClick={() => setViewMode('create')}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Application</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <LoadingSpinner />
          <span className="ml-2">Loading loan applications...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading loan applications. Please try again.</p>
        </div>
      ) : !applications || applications.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Loan Applications</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first loan application.</p>
          <Button
            variant="primary"
            onClick={() => setViewMode('create')}
            className="flex items-center space-x-2 mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create First Application</span>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <Table 
            data={applications} 
            columns={columns}
          />
        </div>
      )}
    </div>
  );
};

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
