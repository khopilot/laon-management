import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ClientForm } from '../components/forms/ClientForm';
import { useClients } from '../hooks/useClients';
import { useCreateClient, useUpdateClient, useDeleteClient } from '../hooks/useClientMutations';
import type { ClientKYC } from '../types/database';
import type { CreateClientRequest } from '../hooks/useClientMutations';

type ViewMode = 'list' | 'create' | 'edit';

// Updated to match the simplified form structure
interface ClientFormData {
  branch_id: string;
  national_id: string;
  first_name: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  sex?: string;
  date_of_birth?: string;
  primary_phone?: string;
  alt_phone?: string;
  email?: string;
  village_commune_district_province?: string;
  socioEconomic?: {
    occupation?: string;
    employer_name?: string;
    monthly_income_usd?: number;
    household_size?: number;
    education_level?: string;
    cbc_score?: number;
  };
}

export const Clients: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<ClientKYC | null>(null);

  // Queries and mutations
  const { data: clients, isLoading, error } = useClients();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Handle form submission
  const handleFormSubmit = async (data: ClientFormData) => {
    console.log('Submitting form data:', data); // Debug log
    
    try {
      if (viewMode === 'create') {
        // Data is already in the right format for CreateClientRequest
        await createClientMutation.mutateAsync(data as CreateClientRequest);
      } else if (viewMode === 'edit' && selectedClient) {
        // For editing, separate KYC and socio-economic data
        const { socioEconomic, ...kycData } = data;
        
        await updateClientMutation.mutateAsync({
          clientId: selectedClient.client_id.toString(),
          data: {
            kyc: kycData,
            socioEconomic: socioEconomic
          }
        });
      }
      setViewMode('list');
      setSelectedClient(null);
    } catch (error) {
      console.error('Form submission error:', error);
      // Show user-friendly error message
      alert('Failed to save client. Please check the form and try again.');
    }
  };

  // Handle edit client
  const handleEditClient = (client: ClientKYC) => {
    setSelectedClient(client);
    setViewMode('edit');
  };

  // Handle delete client
  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteClientMutation.mutateAsync(clientId);
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete client. They may have active loans.');
      }
    }
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  // Table columns
  const columns = [
    {
      key: 'client_id' as keyof ClientKYC,
      header: 'Client ID',
      render: (value: any) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'national_id' as keyof ClientKYC,
      header: 'National ID',
      render: (value: any) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'first_name' as keyof ClientKYC,
      header: 'Name',
      render: (value: any, item: ClientKYC) => (
        <div>
          <div className="font-medium">{value}</div>
          {(item.khmer_last_name || item.latin_last_name) && (
            <div className="text-sm text-gray-500">
              {item.khmer_last_name} {item.latin_last_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'primary_phone' as keyof ClientKYC,
      header: 'Phone',
      render: (value: any) => (
        <span className="text-sm">{value || '-'}</span>
      )
    },
    {
      key: 'branch_id' as keyof ClientKYC,
      header: 'Branch',
      render: (value: any) => (
        <span className="text-sm font-mono">{value}</span>
      )
    },
    {
      key: 'created_at' as keyof ClientKYC,
      header: 'Created',
      render: (value: any) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions' as keyof ClientKYC,
      header: 'Actions',
      render: (_: any, item: ClientKYC) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditClient(item)}
            className="p-1 h-8 w-8"
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="error"
            size="sm"
            onClick={() => handleDeleteClient(item.client_id.toString())}
            className="p-1 h-8 w-8"
            disabled={deleteClientMutation.isPending}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Show form view
  if (viewMode === 'create' || viewMode === 'edit') {
    const initialData = selectedClient ? {
      branch_id: selectedClient.branch_id,
      national_id: selectedClient.national_id,
      first_name: selectedClient.first_name || '',
      khmer_last_name: selectedClient.khmer_last_name || '',
      latin_last_name: selectedClient.latin_last_name || '',
      sex: (selectedClient.sex as 'Male' | 'Female' | 'Other') || undefined,
      date_of_birth: selectedClient.date_of_birth || '',
      primary_phone: selectedClient.primary_phone || '',
      alt_phone: selectedClient.alt_phone || '',
      email: selectedClient.email || '',
      village_commune_district_province: selectedClient.village_commune_district_province || '',
      socioEconomic: {}
    } : undefined;

    return (
      <div className="p-6">
        <ClientForm
          mode={viewMode}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          isLoading={createClientMutation.isPending || updateClientMutation.isPending}
          initialData={initialData}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage client information and KYC data
          </p>
        </div>
        <Button
          onClick={() => setViewMode('create')}
          className="flex items-center"
          disabled={createClientMutation.isPending}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">
            <h3 className="font-medium">Error loading clients</h3>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      )}

      {/* Success States and Table */}
      {!isLoading && !error && (
        <>
          {clients && clients.length > 0 ? (
            <div className="bg-white rounded-lg shadow">
              <Table 
                data={clients} 
                columns={columns}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg 
                  className="mx-auto h-12 w-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No clients found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first client.
              </p>
              <Button 
                onClick={() => setViewMode('create')}
                className="inline-flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Loading Indicator */}
      {deleteClientMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <span>Deleting client...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 