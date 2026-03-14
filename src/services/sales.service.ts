import type { SalePayload } from '@/types/sale/sale-payload.type';
import type { AxiosResponse } from 'axios';
import api from './api.service';

export async function createSale(payload: SalePayload): Promise<unknown> {
  const response: AxiosResponse<unknown> = await api.post('/sales', payload);
  return response.data;
}
