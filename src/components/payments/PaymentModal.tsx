import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PaymentSchedule } from '../../types/payments';
import { useRecordPayment } from '../../hooks/usePayments';

interface PaymentModalProps {
  payment: PaymentSchedule;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ payment, onClose }) => {
  const [amountPaid, setAmountPaid] = useState(payment.total_due);
  const [principalPaid, setPrincipalPaid] = useState(payment.principal_due);
  const [interestPaid, setInterestPaid] = useState(payment.interest_due);
  const [feePaid, setFeePaid] = useState(payment.fee_due);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');

  const recordPaymentMutation = useRecordPayment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    recordPaymentMutation.mutate({
      loan_id: payment.loan_id,
      amount_paid: amountPaid,
      principal_paid: principalPaid,
      interest_paid: interestPaid,
      fee_paid: feePaid,
      payment_method: paymentMethod,
      reference_no: referenceNo || undefined,
    }, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">{payment.client_name}</h3>
            <p className="text-sm text-gray-600">
              {payment.product_name} • Installment #{payment.installment_no}
            </p>
            <p className="text-sm text-gray-600">Loan ID: {payment.loan_id}</p>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Due: {formatCurrency(payment.total_due)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={principalPaid}
                  onChange={(e) => setPrincipalPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={interestPaid}
                  onChange={(e) => setInterestPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {payment.fee_due > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={feePaid}
                  onChange={(e) => setFeePaid(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="check">Check</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Transaction reference"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={recordPaymentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={recordPaymentMutation.isPending}
            >
              {recordPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
            </button>
          </div>

          {recordPaymentMutation.error && (
            <div className="text-red-600 text-sm mt-2">
              Error: {recordPaymentMutation.error.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}; 