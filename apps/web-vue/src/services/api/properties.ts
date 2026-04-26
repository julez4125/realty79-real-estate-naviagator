import type { PropertyDto } from '@org/shared';
import apiClient from './client';

export async function listProperties(): Promise<PropertyDto[]> {
  const response = await apiClient.get<PropertyDto[]>('/properties');
  return response.data;
}

export async function getProperty(id: string): Promise<PropertyDto> {
  const response = await apiClient.get<PropertyDto>(`/properties/${id}`);
  return response.data;
}
