import { api, apiMultipart } from '@/lib/axios';
import { setToken, setUser, removeToken } from '@/lib/auth';
import { LoginDto, RegisterDto, AuthResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('role', data.role);
    
    if (data.district) formData.append('district', data.district);
    if (data.address) formData.append('address', data.address);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.companyName) formData.append('companyName', data.companyName);
    if (data.farmerIdProof) formData.append('farmerIdProof', data.farmerIdProof);

    const response = await apiMultipart.post<AuthResponse>('/auth/register', formData);
    const { token, user } = response.data;
    
    setToken(token);
    setUser(user);
    
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    setUser(response.data);
    return response.data;
  },

  logout() {
    removeToken();
    window.location.href = '/login';
  },

  async verifyExporter(userId: number): Promise<void> {
    await api.put(`/auth/verify-exporter/${userId}`);
  },

  async getUnverifiedExporters(): Promise<User[]> {
    const response = await api.get<User[]>('/auth/unverified-exporters');
    return response.data;
  },
};
