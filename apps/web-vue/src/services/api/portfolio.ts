import type { PortfolioOverviewDto } from '@org/shared';
import apiClient from './client';

export async function getOverview(): Promise<PortfolioOverviewDto> {
  const response = await apiClient.get<PortfolioOverviewDto>('/portfolio');
  return response.data;
}
