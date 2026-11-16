import { apiRequest } from './api';

export interface DashboardSummary {
  kiosAktif?: number;
  katalogTotal?: number;
  verifikasiPending?: number;
  lorongAktif?: number;
  [key: string]: any;
}

export const dashboardService = {
  /**
   * Ambil ringkasan statistik dashboard
   */
  async getSummary(): Promise<DashboardSummary> {
    return apiRequest<DashboardSummary>('/api/dashboard');
  }
};

