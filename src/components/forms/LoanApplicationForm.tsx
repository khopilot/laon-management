import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useClients } from '../../hooks/useClients';
import { useLoanProducts } from '../../hooks/useLoanApplications';
import type { LoanApplicationWithDetails, CreateLoanApplicationRequest } from '../../hooks/useLoanApplications';

const loanApplicationSchema = z.object({
  branch_id: z.string().min(1, 'Branch ID is required'),
  client_id: z.number().min(1, 'Client selection is required'),
  product_id: z.number().min(1, 'Loan product selection is required'),
  requested_amount: z.number().min(1, 'Loan amount must be greater than 0'),
  purpose_code: z.string().optional(),
  requested_term_months: z.number().min(1, 'Loan term must be at least 1 month'),
  repayment_frequency: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  application_status: z.enum(['draft', 'pending', 'approved', 'rejected']).default('draft'),
});

type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;

interface LoanApplicationFormProps {
  onSubmit: (data: CreateLoanApplicationRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<LoanApplicationWithDetails>;
  mode: 'create' | 'edit';
}

const LOAN_PURPOSES = [
  { code: 'BUSINESS', label: 'Business Investment' },
  { code: 'AGRICULTURE', label: 'Agriculture' },
  { code: 'TRADE', label: 'Trade/Commerce' },
  { code: 'LIVESTOCK', label: 'Livestock' },
  { code: 'EDUCATION', label: 'Education' },
  { code: 'HEALTH', label: 'Health/Medical' },
  { code: 'HOUSING', label: 'Housing Improvement' },
  { code: 'EMERGENCY', label: 'Emergency' },
  { code: 'OTHER', label: 'Other' },
];

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  mode
}) => {
  const [selectedClient, setSelectedClient] = useState<number | null>(
    initialData?.client_id || null
  );
  const [selectedProduct, setSelectedProduct] = useState<number | null>(
    initialData?.product_id || null
  );

  // Fetch data
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: products, isLoading: productsLoading } = useLoanProducts();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      branch_id: 'BR001', // Default branch
      repayment_frequency: 'monthly',
      application_status: 'draft',
      ...initialData
    }
  });

  const watchedProductId = watch('product_id');
  const watchedAmount = watch('requested_amount');
  const watchedTerm = watch('requested_term_months');

  // Update product selection when form value changes
  useEffect(() => {
    if (watchedProductId && watchedProductId !== selectedProduct) {
      setSelectedProduct(watchedProductId);
    }
  }, [watchedProductId, selectedProduct]);

  // Find selected product for validation and calculations
  const selectedProductData = products?.find(p => p.product_id === selectedProduct);

  // Calculate estimated monthly payment
  const calculateMonthlyPayment = () => {
    if (!watchedAmount || !watchedTerm || !selectedProductData) return null;

    const principal = watchedAmount;
    const termMonths = watchedTerm;
    const annualRate = selectedProductData.interest_rate_pa / 100;

    if (selectedProductData.interest_method === 'FLAT') {
      // Flat interest: Total Interest = Principal × Rate × Term
      const totalInterest = principal * annualRate * (termMonths / 12);
      const totalAmount = principal + totalInterest;
      return totalAmount / termMonths;
    } else {
      // Declining balance
      const monthlyRate = annualRate / 12;
      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                            (Math.pow(1 + monthlyRate, termMonths) - 1);
      return monthlyPayment;
    }
  };

  const estimatedPayment = calculateMonthlyPayment();

  const handleFormSubmit = (data: LoanApplicationFormData) => {
    console.log('Submitting loan application:', data);
    onSubmit(data);
  };

  if (clientsLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'New Loan Application' : 'Edit Loan Application'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' 
            ? 'Create a new loan application for an existing client' 
            : 'Update loan application details'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Application Details Section */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Application Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Branch ID*"
              {...register('branch_id')}
              error={errors.branch_id?.message}
              placeholder="e.g., BR001"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Status*
              </label>
              <select
                {...register('application_status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              {errors.application_status && (
                <p className="mt-1 text-sm text-red-600">{errors.application_status.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client Selection Section */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Client Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Client*
            </label>
            <select
              {...register('client_id', { 
                valueAsNumber: true,
                onChange: (e) => setSelectedClient(Number(e.target.value))
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a client...</option>
              {clients?.map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.first_name} {client.khmer_last_name} {client.latin_last_name} 
                  ({client.national_id})
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
            )}
            
            {selectedClient && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <strong>Selected Client Details:</strong>
                {(() => {
                  const client = clients?.find(c => c.client_id === selectedClient);
                  return client ? (
                    <div>
                      <p>Name: {client.first_name} {client.khmer_last_name} {client.latin_last_name}</p>
                      <p>National ID: {client.national_id}</p>
                      <p>Phone: {client.primary_phone || 'N/A'}</p>
                      <p>Branch: {client.branch_id}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Loan Product Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Loan Product
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Loan Product*
            </label>
            <select
              {...register('product_id', { 
                valueAsNumber: true,
                onChange: (e) => setSelectedProduct(Number(e.target.value))
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a loan product...</option>
              {products?.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name} ({product.interest_rate_pa}% {product.interest_method})
                </option>
              ))}
            </select>
            {errors.product_id && (
              <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
            )}
            
            {selectedProductData && (
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <strong>Product Details:</strong>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p>Interest Rate: {selectedProductData.interest_rate_pa}% p.a.</p>
                  <p>Method: {selectedProductData.interest_method}</p>
                  <p>Term Range: {selectedProductData.min_term} - {selectedProductData.max_term} months</p>
                  <p>Setup Fee: ${selectedProductData.fee_flat}</p>
                  <p>Grace Period: {selectedProductData.grace_period_days} days</p>
                  <p>Currency: {selectedProductData.currency}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loan Terms Section */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Loan Terms
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Requested Amount (USD)*"
              type="number"
              step="0.01"
              min="1"
              {...register('requested_amount', { valueAsNumber: true })}
              error={errors.requested_amount?.message}
              placeholder="Enter loan amount"
            />

            <div>
              <Input
                label="Term (Months)*"
                type="number"
                min="1"
                {...register('requested_term_months', { valueAsNumber: true })}
                error={errors.requested_term_months?.message}
                placeholder="Enter loan term in months"
                helpText={selectedProductData ? 
                  `Range: ${selectedProductData.min_term} - ${selectedProductData.max_term} months` : 
                  undefined
                }
              />
              {/* Term validation based on selected product */}
              {selectedProductData && watchedTerm && (
                watchedTerm < selectedProductData.min_term || watchedTerm > selectedProductData.max_term
              ) && (
                <p className="mt-1 text-sm text-red-600">
                  Term must be between {selectedProductData.min_term} and {selectedProductData.max_term} months
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repayment Frequency*
              </label>
              <select
                {...register('repayment_frequency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
              {errors.repayment_frequency && (
                <p className="mt-1 text-sm text-red-600">{errors.repayment_frequency.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Loan
              </label>
              <select
                {...register('purpose_code')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select purpose...</option>
                {LOAN_PURPOSES.map((purpose) => (
                  <option key={purpose.code} value={purpose.code}>
                    {purpose.label}
                  </option>
                ))}
              </select>
              {errors.purpose_code && (
                <p className="mt-1 text-sm text-red-600">{errors.purpose_code.message}</p>
              )}
            </div>
          </div>

          {/* Payment Calculation */}
          {estimatedPayment && (
            <div className="mt-4 p-4 bg-green-100 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Estimated Payment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">
                    <span className="font-medium">Monthly Payment:</span> 
                    ${estimatedPayment.toFixed(2)}
                  </p>
                  <p className="text-green-700">
                    <span className="font-medium">Setup Fee:</span> 
                    ${selectedProductData?.fee_flat || 0}
                  </p>
                </div>
                <div>
                  <p className="text-green-700">
                    <span className="font-medium">Total Amount:</span> 
                    ${((estimatedPayment * (watchedTerm || 0)) + (selectedProductData?.fee_flat || 0)).toFixed(2)}
                  </p>
                  <p className="text-green-700">
                    <span className="font-medium">Interest Method:</span> 
                    {selectedProductData?.interest_method}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-4 h-4" />
                <span className="ml-2">
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </span>
              </>
            ) : (
              mode === 'create' ? 'Create Application' : 'Update Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}; 