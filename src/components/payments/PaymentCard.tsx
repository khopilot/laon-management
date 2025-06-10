import React from 'react';
import { 
  CalendarIcon, 
  UserIcon, 
  PhoneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
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
  const getStatusColor = () => {
    if (payment.payment_status === 'paid') return 'bg-green-50 border-green-200';
    if (payment.payment_status === 'late') return 'bg-red-50 border-red-200';
    if (payment.is_in_grace_period) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  const getStatusIcon = () => {
    if (payment.payment_status === 'paid') 
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    if (payment.payment_status === 'late') 
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    if (payment.is_in_grace_period) 
      return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    return <CalendarIcon className="h-5 w-5 text-blue-600" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`${getStatusColor()} border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {payment.client_name}
            </h3>
            <p className="text-xs text-gray-500">ID: {payment.national_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(payment.total_due)}
          </p>
          <p className="text-xs text-gray-500">
            Installment #{payment.installment_no}
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Principal:</span>
          <span className="font-medium">{formatCurrency(payment.principal_due)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Interest:</span>
          <span className="font-medium">{formatCurrency(payment.interest_due)}</span>
        </div>
        {payment.fee_due > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fee:</span>
            <span className="font-medium">{formatCurrency(payment.fee_due)}</span>
          </div>
        )}
      </div>

      {/* Due Date and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>Due: {formatDate(payment.due_date)}</span>
        </div>
        {payment.days_overdue > 0 && (
          <div className="text-sm font-medium text-red-600">
            {payment.days_overdue} days overdue
          </div>
        )}
      </div>

      {/* Contact Info */}
      {payment.primary_phone && (
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
          <PhoneIcon className="h-4 w-4" />
          <span>{payment.primary_phone}</span>
        </div>
      )}

      {/* Product Info */}
      <div className="text-xs text-gray-500 mb-3">
        {payment.product_name} • Loan #{payment.loan_id}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {payment.payment_status !== 'paid' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRecordPayment(payment);
            }}
            className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Record Payment
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(payment);
          }}
          className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}; 