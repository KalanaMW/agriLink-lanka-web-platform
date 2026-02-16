import { api } from '@/lib/axios';
import { FarmerDashboard, ExporterDashboard, AdminDashboard } from '@/types';

export const dashboardService = {
  async getFarmerDashboard(): Promise<FarmerDashboard> {
    const response = await api.get<FarmerDashboard>('/dashboard/farmer');
    return response.data;
  },

  async getExporterDashboard(): Promise<ExporterDashboard> {
    const response = await api.get<ExporterDashboard>('/dashboard/exporter');
    return response.data;
  },

  async getAdminDashboard(): Promise<AdminDashboard> {
    const response = await api.get<AdminDashboard>('/dashboard/admin');
    return response.data;
  },
};
