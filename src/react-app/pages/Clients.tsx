import { useState } from 'react';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useClients } from '../hooks/useClients';
import { ClientKYC } from '../types/database';
import { useAuth } from '../hooks/useAuth';

export const Clients: React.FC = () => {
  const { user } = useAuth();
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
      key: 'latin_last_name' as keyof ClientKYC,
      header: 'Last Name (Latin)',
    },
    {
      key: 'sex' as keyof ClientKYC,
      header: 'Gender',
    },
    {
      key: 'primary_phone' as keyof ClientKYC,
      header: 'Phone',
    },
    {
      key: 'created_at' as keyof ClientKYC,
      header: 'Created',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">Manage client information and KYC data</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          Add New Client
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
          <p className="text-2xl font-bold text-gray-900">{clients?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active This Month</h3>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending KYC</h3>
          <p className="text-2xl font-bold text-gray-900">0</p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Client Directory</h2>
        </div>
        <Table
          data={clients || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No clients found. Click 'Add New Client' to get started."
        />
      </div>

      {/* Create Client Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                Client creation form will be implemented in the next phase. 
                This will include:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Personal information (Name, ID, Phone)</li>
                <li>Address and contact details</li>
                <li>KYC documentation</li>
                <li>Socio-economic information</li>
              </ul>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                  Close
                </Button>
                <Button disabled>
                  Create Client (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 