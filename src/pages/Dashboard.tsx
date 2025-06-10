import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  DocumentCheckIcon, 
  ChartBarIcon,
  ClockIcon,
  BanknotesIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { MetricCard } from '../components/ui/MetricCard';
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
  const [isSettingUpDemo, setIsSettingUpDemo] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');

  const isLoading = isLoadingClients || isLoadingApplications || isLoadingProducts;

  // Setup demo loans function
  const setupDemoLoans = async () => {
    setIsSettingUpDemo(true);
    setDemoMessage('');
    
    try {
      const response = await fetch('http://localhost:8787/api/setup-demo-loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setDemoMessage(`✅ ${result.message}`);
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setDemoMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error setting up demo loans:', error);
      setDemoMessage('❌ Failed to setup demo loans');
    } finally {
      setIsSettingUpDemo(false);
    }
  };

  // Enhanced metrics calculations
  const totalClients = clients?.length || 0;
  const totalApplications = loanApplications?.length || 0;
  const pendingApplications = loanApplications?.filter(app => app.application_status === 'pending').length || 0;
  const approvedApplications = loanApplications?.filter(app => app.application_status === 'approved').length || 0;
  const draftApplications = loanApplications?.filter(app => app.application_status === 'draft').length || 0;
  const rejectedApplications = loanApplications?.filter(app => app.application_status === 'rejected').length || 0;
  
  // Calculate portfolio and performance metrics
  const portfolioValue = loanApplications
    ?.filter(app => app.application_status === 'approved')
    .reduce((sum, app) => sum + (app.requested_amount || 0), 0) || 0;

  const averageLoanSize = approvedApplications > 0 ? portfolioValue / approvedApplications : 0;
  const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
  const pendingRate = totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0;

  // Time-based analytics (mock data for demonstration)
  const thisMonthApplications = loanApplications?.filter(app => {
    const appDate = new Date(app.application_date);
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const lastMonthApplications = 8; // Mock data
  const growthRate = lastMonthApplications > 0 ? ((thisMonthApplications - lastMonthApplications) / lastMonthApplications) * 100 : 0;

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
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white">
        <CardContent className="p-8">
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
        </CardContent>
      </Card>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Clients"
          value={totalClients}
          icon={<UsersIcon className="h-4 w-4" />}
          trend={{
            value: 12,
            label: "from last month",
            direction: "up"
          }}
          progress={{
            value: 75
          }}
          borderColor="border-l-blue-500"
        />
        
        <MetricCard
          title="Applications"
          value={totalApplications}
          subtitle={`Approved: ${approvalRate.toFixed(1)}% • Pending: ${pendingRate.toFixed(1)}%`}
          icon={<DocumentCheckIcon className="h-4 w-4" />}
          trend={{
            value: growthRate,
            label: "this month",
            direction: growthRate >= 0 ? "up" : "down"
          }}
          borderColor="border-l-green-500"
        />
        
        <MetricCard
          title="Portfolio Value"
          value={`$${portfolioValue.toLocaleString()}`}
          subtitle={`Avg. loan: $${averageLoanSize.toLocaleString()}`}
          icon={<CurrencyDollarIcon className="h-4 w-4" />}
          trend={{
            value: 8.2,
            label: "portfolio growth",
            direction: "up"
          }}
          borderColor="border-l-purple-500"
        />
        
        <MetricCard
          title="Pending Reviews"
          value={pendingApplications}
          subtitle="Action required"
          icon={<ClockIcon className="h-4 w-4" />}
          badge={{
            text: pendingApplications > 5 ? 'High' : 'Normal',
            variant: pendingApplications > 5 ? "destructive" : "secondary"
          }}
          progress={pendingApplications > 0 ? {
            value: (pendingApplications / Math.max(totalApplications, 1)) * 100
          } : undefined}
          borderColor="border-l-orange-500"
        />
      </div>

      {/* Application Status Overview with Enhanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Application Status Overview
              <Badge variant="outline">{totalApplications} Total</Badge>
            </CardTitle>
            <CardDescription>
              Current pipeline status and processing metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <div>
                  <span className="font-medium text-gray-900">Approved</span>
                  <div className="text-xs text-green-600 font-medium">
                    {approvalRate.toFixed(1)}% approval rate
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">{approvedApplications}</span>
                <Progress value={approvalRate} className="w-16 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
                <div>
                  <span className="font-medium text-gray-900">Pending</span>
                  <div className="text-xs text-yellow-600 font-medium">
                    Avg. 3.2 days processing
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-yellow-600">{pendingApplications}</span>
                <Progress value={pendingRate} className="w-16 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <DocumentCheckIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <span className="font-medium text-gray-900">Draft</span>
                  <div className="text-xs text-gray-600 font-medium">
                    Incomplete applications
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-600">{draftApplications}</span>
                <Progress value={(draftApplications / Math.max(totalApplications, 1)) * 100} className="w-16 h-2 mt-1" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                <div>
                  <span className="font-medium text-gray-900">Rejected</span>
                  <div className="text-xs text-red-600 font-medium">
                    {((rejectedApplications / Math.max(totalApplications, 1)) * 100).toFixed(1)}% rejection rate
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-red-600">{rejectedApplications}</span>
                <Progress value={(rejectedApplications / Math.max(totalApplications, 1)) * 100} className="w-16 h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Applications
              <Link to="/applications">
                <Button variant="ghost" size="sm" className="h-8">
                  View All <ArrowRightIcon className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
            <CardDescription>
              Latest loan application submissions and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No applications yet</p>
                  <p className="text-sm text-gray-500 mb-4">Start by creating your first loan application</p>
                  <Link to="/applications">
                    <Button size="sm">Create Application</Button>
                  </Link>
                </div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.app_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        app.application_status === 'approved' ? 'bg-green-500' :
                        app.application_status === 'pending' ? 'bg-yellow-500' :
                        app.application_status === 'rejected' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">Application #{app.app_id}</p>
                        <p className="text-sm text-gray-600">
                          {app.first_name} {app.latin_last_name} • ${app.requested_amount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(app.application_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        app.application_status === 'approved' ? 'default' :
                        app.application_status === 'pending' ? 'secondary' :
                        app.application_status === 'rejected' ? 'destructive' :
                        'outline'
                      }
                      className="capitalize"
                    >
                      {app.application_status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and workflow shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo setup message */}
          {demoMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              demoMessage.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {demoMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            
            <Button 
              onClick={setupDemoLoans}
              disabled={isSettingUpDemo}
              variant="outline"
              className="group flex items-center p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed h-auto"
            >
              <CogIcon className={`h-10 w-10 text-indigo-600 group-hover:scale-110 transition-transform ${isSettingUpDemo ? 'animate-spin' : ''}`} />
              <div className="ml-4 text-left">
                <h3 className="font-semibold text-gray-900">
                  {isSettingUpDemo ? 'Setting up...' : 'Setup Demo Data'}
                </h3>
                <p className="text-sm text-gray-600">Create test loans & payments</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Loan Products Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Available Loan Products
            <Badge variant="secondary">{loanProducts?.length || 0} products</Badge>
          </CardTitle>
          <CardDescription>
            Current loan product offerings and their terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loanProducts?.slice(0, 3).map((product: any) => (
              <Card key={product.product_id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{product.product_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate:</span>
                    <span className="font-semibold">{product.interest_rate_pa}% {product.interest_method}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Term Range:</span>
                    <span className="font-semibold">{product.min_term}-{product.max_term} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Setup Fee:</span>
                    <span className="font-semibold">${product.fee_flat}</span>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    Active Product
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 