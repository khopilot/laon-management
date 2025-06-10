import api from './api';
import { ClientKYC, ClientSocioEco } from '../types/database';

export const clientService = {
  async getClients(branchId?: string): Promise<ClientKYC[]> {
    const response = await api.get<ClientKYC[]>('/api/clients', {
      params: branchId ? { branch_id: branchId } : {}
    });
    return response.data;
  },

  async getClient(clientId: number): Promise<ClientKYC> {
    const response = await api.get<ClientKYC>(`/api/clients/${clientId}`);
    return response.data;
  },

  async createClient(clientData: Omit<ClientKYC, 'client_id' | 'created_at'>): Promise<ClientKYC> {
    const response = await api.post<ClientKYC>('/api/clients', clientData);
    return response.data;
  },

  async updateClient(clientId: number, clientData: Partial<ClientKYC>): Promise<ClientKYC> {
    const response = await api.put<ClientKYC>(`/api/clients/${clientId}`, clientData);
    return response.data;
  },

  async deleteClient(clientId: number): Promise<void> {
    await api.delete(`/api/clients/${clientId}`);
  },

  async getClientSocioEco(clientId: number): Promise<ClientSocioEco> {
    const response = await api.get<ClientSocioEco>(`/api/clients/${clientId}/socio-eco`);
    return response.data;
  },

  async updateClientSocioEco(clientId: number, socioEcoData: Partial<ClientSocioEco>): Promise<ClientSocioEco> {
    const response = await api.put<ClientSocioEco>(`/api/clients/${clientId}/socio-eco`, socioEcoData);
    return response.data;
  }
}; 