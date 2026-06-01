import { api, apiMultipart } from '@/lib/axios';
import { User } from '@/types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/user/profile');
    return response.data;
  },

  async updateProfile(data: {
    fullName?: string;
    district?: string;
    address?: string;
    phoneNumber?: string;
    companyName?: string;
    profileImage?: File;
  }): Promise<void> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    await apiMultipart.put('/user/profile', formData);
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await api.post('/user/change-password', data);
  },

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('profileImage', file);
    const response = await apiMultipart.post<{ imageUrl: string }>('/user/upload-profile-image', formData);
    return response.data;
  },
};
