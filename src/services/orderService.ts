import { api } from '@/lib/axios';
import { Order, CreateOrderDto } from '@/types';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrder(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  async updateOrderStatus(id: number, data: { status: string; trackingNumber?: string; notes?: string }): Promise<void> {
    await api.put(`/orders/${id}/status`, data);
  },

  async confirmPayment(id: number): Promise<void> {
    await api.put(`/orders/${id}/confirm-payment`);
  },

  async cancelOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
