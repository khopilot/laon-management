import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useLoans } from '../hooks/useLoans';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: clients, isLoading: isLoadingClients } = useClients(user?.branch_id);
  const { data: loans, isLoading: isLoadingLoans } = useLoans(user?.branch_id);

  const activeLoans = loans?.filter(loan => loan.account_state === 'active') || [];
  const overdueLoans = loans?.filter(loan => loan.account_state === 'active' && loan.principal_outstanding > 0) || [];

  if (isLoadingClients || isLoadingLoans) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.staff_role === 'admin' ? 'Admin' : 'Officer'}
        </h1>
        <p className="text-gray-600">
          {user?.branch_name || 'Branch'} - {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Clients</h3>
          <p className="text-3xl font-bold text-primary-600">{clients?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Registered clients</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
          <p className="text-3xl font-bold text-green-600">{activeLoans.length}</p>
          <p className="text-sm text-gray-500 mt-1">Currently active</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Portfolio</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${activeLoans.reduce((sum, loan) => sum + loan.principal_outstanding, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Outstanding principal</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">At Risk Loans</h3>
          <p className="text-3xl font-bold text-red-600">{overdueLoans.length}</p>
          <p className="text-sm text-gray-500 mt-1">Requiring attention</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="text-gray-600 text-center py-4">
              No recent loan activity. Start by adding clients and creating loan applications.
            </div>
          ) : (
            <div className="text-gray-600">
              {activeLoans.length} active loans currently being managed.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/clients" 
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Add New Client</h3>
            <p className="text-sm text-gray-600 mt-1">Register a new client for loan services</p>
          </a>
          
          <a 
            href="/loan-applications" 
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">New Loan Application</h3>
            <p className="text-sm text-gray-600 mt-1">Create a new loan application</p>
          </a>
          
          <a 
            href="/payments" 
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Record Payment</h3>
            <p className="text-sm text-gray-600 mt-1">Record a loan payment</p>
          </a>
        </div>
      </div>
    </div>
  );
}; 