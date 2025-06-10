import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '../services/clients';
import { ClientKYC, ClientSocioEco } from '../types/database';

// Mock data for development
const mockClients: ClientKYC[] = [
  {
    client_id: 1,
    branch_id: 'BR001',
    national_id: '123456789',
    first_name: 'Sophea',
    khmer_last_name: 'ចាន់',
    latin_last_name: 'Chan',
    sex: 'F',
    date_of_birth: '1985-03-15',
    primary_phone: '+855 12 345 678',
    email: 'sophea.chan@email.com',
    village_commune_district_province: 'Village 1, Commune A, District B, Phnom Penh',
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    client_id: 2,
    branch_id: 'BR001',
    national_id: '987654321',
    first_name: 'Dara',
    khmer_last_name: 'លី',
    latin_last_name: 'Lee',
    sex: 'M',
    date_of_birth: '1980-07-22',
    primary_phone: '+855 17 123 456',
    email: 'dara.lee@email.com',
    village_commune_district_province: 'Village 2, Commune C, District D, Siem Reap',
    created_at: '2024-02-01T10:15:00Z',
  },
  {
    client_id: 3,
    branch_id: 'BR001',
    national_id: '456789123',
    first_name: 'Sreymom',
    khmer_last_name: 'ពេជ្រ',
    latin_last_name: 'Pich',
    sex: 'F',
    date_of_birth: '1992-11-08',
    primary_phone: '+855 96 789 012',
    village_commune_district_province: 'Village 3, Commune E, District F, Battambang',
    created_at: '2024-02-10T14:45:00Z',
  }
];

export const useClients = (branchId?: string) => {
  return useQuery({
    queryKey: ['clients', branchId],
    queryFn: async (): Promise<ClientKYC[]> => {
      try {
        return await clientService.getClients(branchId);
      } catch (error) {
        console.log('API not available, using mock data');
        return mockClients.filter(client => !branchId || client.branch_id === branchId);
      }
    },
  });
};

export const useClient = (clientId: number) => {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async (): Promise<ClientKYC> => {
      try {
        return await clientService.getClient(clientId);
      } catch (error) {
        const client = mockClients.find(c => c.client_id === clientId);
        if (!client) throw new Error('Client not found');
        return client;
      }
    },
    enabled: !!clientId,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: Omit<ClientKYC, 'client_id' | 'created_at'>): Promise<ClientKYC> => {
      try {
        return await clientService.createClient(clientData);
      } catch (error) {
        // Mock creation for development
        const newClient: ClientKYC = {
          ...clientData,
          client_id: Date.now(),
          created_at: new Date().toISOString(),
        };
        return newClient;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, clientData }: { clientId: number; clientData: Partial<ClientKYC> }): Promise<ClientKYC> => {
      try {
        return await clientService.updateClient(clientId, clientData);
      } catch (error) {
        const existingClient = mockClients.find(c => c.client_id === clientId);
        if (!existingClient) throw new Error('Client not found');
        return { ...existingClient, ...clientData };
      }
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: number): Promise<void> => {
      try {
        await clientService.deleteClient(clientId);
      } catch (error) {
        // Mock deletion for development
        console.log('Mock: Deleted client', clientId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useClientSocioEco = (clientId: number) => {
  return useQuery({
    queryKey: ['clients', clientId, 'socio-eco'],
    queryFn: async (): Promise<ClientSocioEco> => {
      try {
        return await clientService.getClientSocioEco(clientId);
      } catch (error) {
        // Mock socio-economic data
        return {
          client_id: clientId,
          occupation: 'Small Business Owner',
          monthly_income_usd: 500,
          household_size: 4,
          education_level: 'High School',
          cbc_score: 650
        };
      }
    },
    enabled: !!clientId,
  });
};

export const useUpdateClientSocioEco = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, socioEcoData }: { clientId: number; socioEcoData: Partial<ClientSocioEco> }): Promise<ClientSocioEco> => {
      try {
        return await clientService.updateClientSocioEco(clientId, socioEcoData);
      } catch (error) {
        return {
          client_id: clientId,
          ...socioEcoData
        } as ClientSocioEco;
      }
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'socio-eco'] });
    },
  });
}; 