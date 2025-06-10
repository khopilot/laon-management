import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { ClientKYC, ClientSocioEco } from '../types/database';

// Types for client creation/update - simplified to match form structure
export interface CreateClientRequest {
  // Flatten the KYC data to match API expectations
  branch_id: string;
  national_id: string;
  first_name: string;
  khmer_last_name?: string;
  latin_last_name?: string;
  sex?: string;
  date_of_birth?: string;
  primary_phone?: string;
  alt_phone?: string;
  email?: string;
  village_commune_district_province?: string;
  // Separate socio-economic data
  socioEconomic?: {
    occupation?: string;
    employer_name?: string;
    monthly_income_usd?: number;
    household_size?: number;
    education_level?: string;
    cbc_score?: number;
  };
}

export interface UpdateClientRequest {
  kyc?: Partial<Omit<ClientKYC, 'client_id' | 'created_at' | 'updated_at' | 'branch_id' | 'national_id'>>;
  socioEconomic?: Partial<Omit<ClientSocioEco, 'client_id'>>;
}

// Create client mutation
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      // Extract socio-economic data
      const { socioEconomic, ...kycData } = data;
      
      // Create the client KYC record with flat structure
      const client = await apiService.post<ClientKYC>('/api/clients', kycData);
      
      // Then create socio-economic data if provided
      if (socioEconomic && client.client_id && Object.keys(socioEconomic).length > 0) {
        try {
          await apiService.put<ClientSocioEco>(
            `/api/clients/${client.client_id}/socio-eco`,
            socioEconomic
          );
        } catch (error) {
          console.warn('Failed to create socio-economic data:', error);
          // Don't fail the entire creation if socio-eco fails
        }
      }
      
      return client;
    },
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('Failed to create client:', error);
    }
  });
};

// Update client mutation
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      clientId, 
      data 
    }: { 
      clientId: string; 
      data: UpdateClientRequest 
    }) => {
      let updatedClient = null;
      
      // Update KYC data if provided
      if (data.kyc) {
        updatedClient = await apiService.put<ClientKYC>(
          `/api/clients/${clientId}`,
          data.kyc
        );
      }
      
      // Update socio-economic data if provided
      if (data.socioEconomic && Object.keys(data.socioEconomic).length > 0) {
        try {
          await apiService.put<ClientSocioEco>(
            `/api/clients/${clientId}/socio-eco`,
            data.socioEconomic
          );
        } catch (error) {
          console.warn('Failed to update socio-economic data:', error);
        }
      }
      
      return updatedClient;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-socio-eco', variables.clientId] });
    },
    onError: (error) => {
      console.error('Failed to update client:', error);
    }
  });
};

// Delete client mutation
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      await apiService.delete(`/api/clients/${clientId}`);
      return clientId;
    },
    onSuccess: (clientId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: ['client', clientId] });
      queryClient.removeQueries({ queryKey: ['client-socio-eco', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('Failed to delete client:', error);
    }
  });
};

// Get client socio-economic data
export const useClientSocioEco = (clientId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiService.get<ClientSocioEco>(`/api/clients/${clientId}/socio-eco`);
    },
    onSuccess: (data) => {
      // Cache the socio-economic data
      queryClient.setQueryData(['client-socio-eco', clientId], data);
    }
  });
}; 