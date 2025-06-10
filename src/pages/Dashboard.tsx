import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  DocumentCheckIcon, 
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useClients } from '../hooks/useClients';
import { useLoanApplications } from '../hooks/useLoanApplications';
import { useLoanProducts } from '../hooks/useLoanProducts';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const { data: loanApplications, isLoading: isLoadingApplications } = useLoanApplications();
  const { data: loanProducts, isLoading: isLoadingProducts } = useLoanProducts();

  const isLoading = isLoadingClients || isLoadingApplications || isLoadingProducts;

  // Calculate dashboard metrics
  const totalClients = clients?.length || 0;
  const totalApplications = loanApplications?.length || 0;
  const pendingApplications = loanApplications?.filter(app => app.application_status === 'pending').length || 0;
  const approvedApplications = loanApplications?.filter(app => app.application_status === 'approved').length || 0;
  const draftApplications = loanApplications?.filter(app => app.application_status === 'draft').length || 0;
  const rejectedApplications = loanApplications?.filter(app => app.application_status === 'rejected').length || 0;
  
  // Calculate portfolio value (for approved applications)
  const portfolioValue = loanApplications
    ?.filter(app => app.application_status === 'approved')
    .reduce((sum, app) => sum + (app.requested_amount || 0), 0) || 0;

  // Get recent applications (last 5)
  const recentApplications = loanApplications
    ?.sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
    .slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.staff_role === 'admin' ? 'Admin' : 'Officer'}
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              {user?.branch_id || 'BR001'} - {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <ChartBarIcon className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <UsersIcon className="h-12 w-12 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Clients</h3>
              <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
              <p className="text-sm text-gray-500 mt-1">Registered clients</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-12 w-12 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
              <p className="text-3xl font-bold text-green-600">{totalApplications}</p>
              <p className="text-sm text-gray-500 mt-1">Total submitted</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-12 w-12 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${portfolioValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Approved value</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center">
            <ClockIcon className="h-12 w-12 text-orange-500" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingApplications}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Application Status Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Approved</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{approvedApplications}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{pendingApplications}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Draft</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">{draftApplications}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className="font-medium text-gray-900">Rejected</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{rejectedApplications}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Applications</h2>
          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications yet</p>
                <p className="text-sm text-gray-500">Start by creating your first loan application</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.app_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">Application #{app.app_id}</p>
                    <p className="text-sm text-gray-600">
                      ${app.requested_amount?.toLocaleString()} • {new Date(app.application_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.application_status === 'approved' ? 'bg-green-100 text-green-800' :
                    app.application_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.application_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.application_status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/clients" 
            className="group flex items-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200"
          >
            <UsersIcon className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Add Client</h3>
              <p className="text-sm text-gray-600">Register new client</p>
            </div>
          </Link>
          
          <Link 
            to="/applications" 
            className="group flex items-center p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200"
          >
            <DocumentCheckIcon className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">New Application</h3>
              <p className="text-sm text-gray-600">Create loan application</p>
            </div>
          </Link>
          
          <Link 
            to="/payments" 
            className="group flex items-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 border border-purple-200"
          >
            <BanknotesIcon className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-600">Process loan payment</p>
            </div>
          </Link>
          
          <Link 
            to="/reports" 
            className="group flex items-center p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 border border-orange-200"
          >
            <ChartBarIcon className="h-10 w-10 text-orange-600 group-hover:scale-110 transition-transform" />
            <div className="ml-4">
              <h3 className="font-semibold text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Loan Products Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Available Loan Products</h2>
          <span className="text-sm text-gray-500">{loanProducts?.length || 0} products</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loanProducts?.slice(0, 3).map((product: any) => (
            <div key={product.product_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{product.product_name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Rate: {product.interest_rate_pa}% {product.interest_method}</p>
                <p>Term: {product.min_term}-{product.max_term} months</p>
                <p>Fee: ${product.fee_flat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 