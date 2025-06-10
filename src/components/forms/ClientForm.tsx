import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Simplified form schema that matches API structure
const clientFormSchema = z.object({
  // KYC fields (flattened)
  branch_id: z.string().min(1, 'Branch ID is required'),
  national_id: z.string().min(1, 'National ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  khmer_last_name: z.string().optional(),
  latin_last_name: z.string().optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  date_of_birth: z.string().optional(),
  primary_phone: z.string().optional(),
  alt_phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  village_commune_district_province: z.string().optional(),
  
  // Socio-economic fields (nested under socioEconomic)
  socioEconomic: z.object({
    occupation: z.string().optional(),
    employer_name: z.string().optional(),
    monthly_income_usd: z.number().min(0).optional(),
    household_size: z.number().min(1).optional(),
    education_level: z.enum([
      'No formal education',
      'Primary education',
      'Secondary education',
      'Higher education',
      'Vocational training'
    ]).optional(),
    cbc_score: z.number().min(0).max(1000).optional(),
  }).optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ClientFormData>;
  mode: 'create' | 'edit';
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
  mode
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData || {
      branch_id: 'BR001', // Default branch
      sex: undefined,
      email: '',
      socioEconomic: {}
    }
  });

  const watchedIncome = watch('socioEconomic.monthly_income_usd');

  const handleFormSubmit = (data: ClientFormData) => {
    console.log('Form data:', data); // Debug log
    onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Create New Client' : 'Edit Client'}
        </h2>
        <p className="text-gray-600 mt-1">
          {mode === 'create' 
            ? 'Enter client information to create a new account' 
            : 'Update client information'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* KYC Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Know Your Customer (KYC) Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Branch ID*"
              {...register('branch_id')}
              error={errors.branch_id?.message}
              placeholder="e.g., BR001"
              helpText="Branch where the client will be registered"
            />

            <Input
              label="National ID*"
              {...register('national_id')}
              error={errors.national_id?.message}
              placeholder="e.g., 123456789"
              helpText="Government-issued identification number"
            />

            <Input
              label="First Name*"
              {...register('first_name')}
              error={errors.first_name?.message}
              placeholder="Enter first name"
            />

            <Input
              label="Khmer Last Name"
              {...register('khmer_last_name')}
              error={errors.khmer_last_name?.message}
              placeholder="ខ្មែរ នាម"
              helpText="Last name in Khmer script"
            />

            <Input
              label="Latin Last Name"
              {...register('latin_last_name')}
              error={errors.latin_last_name?.message}
              placeholder="Family name in Latin script"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sex
              </label>
              <select
                {...register('sex')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.sex && (
                <p className="mt-1 text-sm text-red-600">{errors.sex.message}</p>
              )}
            </div>

            <Input
              label="Date of Birth"
              type="date"
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
            />

            <Input
              label="Primary Phone"
              type="tel"
              {...register('primary_phone')}
              error={errors.primary_phone?.message}
              placeholder="+855 XX XXX XXX"
            />

            <Input
              label="Alternative Phone"
              type="tel"
              {...register('alt_phone')}
              error={errors.alt_phone?.message}
              placeholder="+855 XX XXX XXX"
            />

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="client@example.com"
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                {...register('village_commune_district_province')}
                error={errors.village_commune_district_province?.message}
                placeholder="Village, Commune, District, Province"
                helpText="Full address including village, commune, district, and province"
              />
            </div>
          </div>
        </div>

        {/* Socio-Economic Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Socio-Economic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Occupation"
              {...register('socioEconomic.occupation')}
              error={errors.socioEconomic?.occupation?.message}
              placeholder="e.g., Farmer, Teacher, Trader"
            />

            <Input
              label="Employer Name"
              {...register('socioEconomic.employer_name')}
              error={errors.socioEconomic?.employer_name?.message}
              placeholder="Name of employer or business"
            />

            <Input
              label="Monthly Income (USD)"
              type="number"
              min="0"
              step="0.01"
              {...register('socioEconomic.monthly_income_usd', {
                valueAsNumber: true
              })}
              error={errors.socioEconomic?.monthly_income_usd?.message}
              placeholder="0.00"
              helpText="Monthly income in US Dollars"
            />

            <Input
              label="Household Size"
              type="number"
              min="1"
              {...register('socioEconomic.household_size', {
                valueAsNumber: true
              })}
              error={errors.socioEconomic?.household_size?.message}
              placeholder="1"
              helpText="Total number of people in household"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Level
              </label>
              <select
                {...register('socioEconomic.education_level')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select education level</option>
                <option value="No formal education">No formal education</option>
                <option value="Primary education">Primary education</option>
                <option value="Secondary education">Secondary education</option>
                <option value="Higher education">Higher education</option>
                <option value="Vocational training">Vocational training</option>
              </select>
              {errors.socioEconomic?.education_level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.socioEconomic.education_level.message}
                </p>
              )}
            </div>

            <Input
              label="CBC Score"
              type="number"
              min="0"
              max="1000"
              {...register('socioEconomic.cbc_score', {
                valueAsNumber: true
              })}
              error={errors.socioEconomic?.cbc_score?.message}
              placeholder="0"
              helpText="Credit Bureau Cambodia score (0-1000)"
            />
          </div>

          {/* Income Assessment */}
          {watchedIncome && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Income Assessment</h4>
              <div className="text-sm text-blue-800">
                <p>Monthly Income: ${watchedIncome.toFixed(2)}</p>
                <p>Annual Income: ${(watchedIncome * 12).toFixed(2)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  This information helps determine loan eligibility and terms
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </span>
              </>
            ) : (
              mode === 'create' ? 'Create Client' : 'Update Client'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}; 