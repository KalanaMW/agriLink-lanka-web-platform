import { api, apiMultipart } from '@/lib/axios';
import { Product, ProductFilter, PaginatedResponse, CreateProductDto } from '@/types';

export const productService = {
  async getProducts(filters?: ProductFilter): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
    return response.data;
  },

  async getProduct(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getMyProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products/my-products');
    return response.data;
  },

  async getPendingProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products/pending');
    return response.data;
  },

  async createProduct(formData: FormData): Promise<Product> {
    const response = await apiMultipart.post<Product>('/products', formData);
    return response.data;
  },

  async updateProduct(id: number, formData: FormData): Promise<void> {
    await apiMultipart.put(`/products/${id}`, formData);
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async approveProduct(id: number): Promise<void> {
    await api.put(`/products/${id}/approve`);
  },

  async rejectProduct(id: number): Promise<void> {
    await api.put(`/products/${id}/reject`);
  },
};
