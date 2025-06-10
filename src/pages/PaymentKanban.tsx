import React, { useState } from 'react';
import { 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { usePaymentSchedules } from '../hooks/usePayments';
import { PaymentCard } from '../components/payments/PaymentCard';
import { PaymentSchedule } from '../types/payments';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const PaymentKanban: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentSchedule | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch payment schedules
  const { data: allPayments = [], isLoading, error } = usePaymentSchedules({
    branch_id: selectedBranch || undefined,
  });

  // Organize payments by status
  const organizePayments = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const dueToday = allPayments.filter(p => 
      p.due_date.split('T')[0] === today && p.status === 'due'
    );
    
    const overdue = allPayments.filter(p => 
      p.due_date.split('T')[0] < today && p.status === 'due' && !p.is_in_grace_period
    );
    
    const gracePeriod = allPayments.filter(p => 
      p.is_in_grace_period && p.status === 'due'
    );
    
    const paid = allPayments.filter(p => p.status === 'paid');
    
    const upcoming = allPayments.filter(p => 
      p.due_date.split('T')[0] > today && p.status === 'due'
    ).slice(0, 20); // Limit upcoming to 20 items
    
    return { dueToday, overdue, gracePeriod, paid: paid.slice(0, 10), upcoming };
  };

  const { dueToday, overdue, gracePeriod, paid, upcoming } = organizePayments();

  // Calculate financial metrics
  const overdueAmount = overdue.reduce((sum, p) => sum + p.total_due, 0);
  const dueTodayAmount = dueToday.reduce((sum, p) => sum + p.total_due, 0);
  const paidTodayAmount = paid.filter(p => {
    const today = new Date().toISOString().split('T')[0];
    return p.payment_date && p.payment_date.split('T')[0] === today;
  }).reduce((sum, p) => sum + p.total_due, 0);
  
  const totalPortfolio = allPayments.reduce((sum, p) => sum + p.total_due, 0);
  const collectionRate = totalPortfolio > 0 ? (paid.length / allPayments.length) * 100 : 0;

  const handleRecordPayment = (payment: PaymentSchedule) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleViewDetails = (payment: PaymentSchedule) => {
    // Navigate to payment details or show modal
    console.log('View details for payment:', payment);
  };

  const KanbanColumn: React.FC<{
    title: string;
    icon: React.ReactNode;
    count: number;
    payments: PaymentSchedule[];
    color: string;
  }> = ({ title, icon, count, payments, color }) => (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Column Header */}
      <div className={`${color} px-4 py-3 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <span className="bg-white bg-opacity-20 text-gray-900 px-2 py-1 rounded-full text-sm font-medium">
            {count}
          </span>
        </div>
      </div>
      
      {/* Column Content */}
      <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No payments in this category</p>
          </div>
        ) : (
          payments.map((payment) => (
            <PaymentCard
              key={payment.schedule_id}
              payment={payment}
              onRecordPayment={handleRecordPayment}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading payments: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Payment Management</CardTitle>
              <CardDescription>Track and record loan payments across all branches</CardDescription>
            </div>
            
            {/* Branch Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                <option value="PP01">Phnom Penh Main</option>
                <option value="SR01">Siem Reap Branch</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
            <div className="text-sm text-red-700 font-medium">
              ${overdueAmount.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            </div>
            <Progress value={(overdue.length / Math.max(allPayments.length, 1)) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dueToday.length}</div>
            <div className="text-sm text-blue-700 font-medium">
              ${dueTodayAmount.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <UserGroupIcon className="h-3 w-3" />
              <span>Action needed today</span>
            </div>
            <Progress value={(dueToday.length / Math.max(allPayments.length, 1)) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{gracePeriod.length}</div>
            <div className="text-sm text-yellow-700 font-medium">
              ${gracePeriod.reduce((sum, p) => sum + p.total_due, 0).toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Badge variant="secondary" className="text-xs">
                Monitor Closely
              </Badge>
            </div>
            <Progress value={(gracePeriod.length / Math.max(allPayments.length, 1)) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{collectionRate.toFixed(1)}%</div>
            <div className="text-sm text-green-700 font-medium">
              ${paidTodayAmount.toLocaleString()} today
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <CurrencyDollarIcon className="h-3 w-3" />
              <span>{paid.length} payments collected</span>
            </div>
            <Progress value={collectionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <KanbanColumn
          title="Overdue"
          icon={<ExclamationTriangleIcon className="h-5 w-5 text-red-700" />}
          count={overdue.length}
          payments={overdue}
          color="bg-red-100"
        />
        
        <KanbanColumn
          title="Due Today"
          icon={<CalendarIcon className="h-5 w-5 text-blue-700" />}
          count={dueToday.length}
          payments={dueToday}
          color="bg-blue-100"
        />
        
        <KanbanColumn
          title="Grace Period"
          icon={<ClockIcon className="h-5 w-5 text-yellow-700" />}
          count={gracePeriod.length}
          payments={gracePeriod}
          color="bg-yellow-100"
        />
        
        <KanbanColumn
          title="Paid"
          icon={<CheckCircleIcon className="h-5 w-5 text-green-700" />}
          count={paid.length}
          payments={paid}
          color="bg-green-100"
        />
        
        <KanbanColumn
          title="Upcoming"
          icon={<ArrowRightIcon className="h-5 w-5 text-gray-700" />}
          count={upcoming.length}
          payments={upcoming}
          color="bg-gray-100"
        />
      </div>

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <p className="text-gray-600 mb-4">
              Payment recording for {selectedPayment.client_name} - ${selectedPayment.total_due}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement payment recording logic
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 