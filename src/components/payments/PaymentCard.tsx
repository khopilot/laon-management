import React from 'react';
import { 
  CalendarIcon, 
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { PaymentSchedule } from '../../types/payments';

interface PaymentCardProps {
  payment: PaymentSchedule;
  onRecordPayment: (payment: PaymentSchedule) => void;
  onViewDetails: (payment: PaymentSchedule) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onRecordPayment,
  onViewDetails
}) => {
  const getStatusConfig = () => {
    if (payment.payment_status === 'paid') {
      return {
        variant: 'default' as const,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <CheckCircleIcon className="h-4 w-4 text-green-600" />,
        label: 'Paid',
        textColor: 'text-green-700'
      };
    }
    if (payment.payment_status === 'late') {
      return {
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />,
        label: 'Overdue',
        textColor: 'text-red-700'
      };
    }
    if (payment.is_in_grace_period) {
      return {
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: <ClockIcon className="h-4 w-4 text-yellow-600" />,
        label: 'Grace Period',
        textColor: 'text-yellow-700'
      };
    }
    return {
      variant: 'outline' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: <CalendarIcon className="h-4 w-4 text-blue-600" />,
      label: 'Due',
      textColor: 'text-blue-700'
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2 hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden`}>
      {/* Priority indicator for overdue payments */}
      {payment.days_overdue > 0 && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500">
          <ExclamationTriangleIcon className="h-3 w-3 text-white absolute -top-4 -right-1" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              {statusConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {payment.client_name}
              </h3>
              <p className="text-xs text-gray-500">ID: {payment.national_id}</p>
              <Badge variant={statusConfig.variant} className="mt-1 text-xs">
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(payment.total_due)}
            </p>
            <p className="text-xs text-gray-500">
              Installment #{payment.installment_no}
            </p>
            {payment.payment_status === 'paid' && (
              <Badge variant="default" className="text-xs mt-1">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <CreditCardIcon className="h-3 w-3 mr-1" />
              Principal:
            </span>
            <span className="font-medium">{formatCurrency(payment.principal_due)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              Interest:
            </span>
            <span className="font-medium">{formatCurrency(payment.interest_due)}</span>
          </div>
          {payment.fee_due > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fee:</span>
              <span className="font-medium">{formatCurrency(payment.fee_due)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar for paid status */}
        {payment.payment_status === 'paid' ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-green-600">Payment Complete</span>
              <span className="text-green-600">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Payment Status</span>
              <span className="text-gray-600">Pending</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        )}

        {/* Due Date and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Due: {formatDate(payment.due_date)}</span>
          </div>
          {payment.days_overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              {payment.days_overdue} days overdue
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        {payment.primary_phone && (
          <div className="flex items-center space-x-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            <PhoneIcon className="h-4 w-4" />
            <span>{payment.primary_phone}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${payment.primary_phone}`);
              }}
            >
              Call
            </Button>
          </div>
        )}

        {/* Product Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          <div className="flex justify-between">
            <span>{payment.product_name}</span>
            <span>Loan #{payment.loan_id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {payment.payment_status !== 'paid' && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onRecordPayment(payment);
              }}
              className="flex-1"
              size="sm"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(payment);
            }}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 