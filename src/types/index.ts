// User types
export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'Farmer' | 'Exporter';
  district?: string;
  address?: string;
  phoneNumber?: string;
  companyName?: string;
  isVerified: boolean;
  isActive: boolean;
  profileImageUrl?: string;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'Farmer' | 'Exporter';
  district?: string;
  address?: string;
  phoneNumber?: string;
  companyName?: string;
  farmerIdProof?: File;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Product types
export interface Product {
  id: number;
  vegetableName: string;
  variety?: string;
  grade: string;
  pricePerKg: number;
  availableQuantityKg: number;
  harvestDate: string;
  district: string;
  description?: string;
  isExportReady: boolean;
  isOrganic: boolean;
  status: 'Pending' | 'Available' | 'Sold' | 'OutOfStock';
  imageUrl?: string;
  certificationUrl?: string;
  farmerId: number;
  farmerName: string;
  farmerEmail: string;
  farmerPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilter {
  vegetableName?: string;
  district?: string;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
  isExportReady?: boolean;
  isOrganic?: boolean;
  status?: string;
  harvestDateFrom?: string;
  harvestDateTo?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface CreateProductDto {
  vegetableName: string;
  variety?: string;
  grade: string;
  pricePerKg: number;
  availableQuantityKg: number;
  harvestDate: string;
  district: string;
  description?: string;
  isExportReady: boolean;
  isOrganic: boolean;
  productImage?: File;
  certificationDocument?: File;
}

// Dashboard types
export interface FarmerDashboard {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentProducts: Product[];
}

export interface ExporterDashboard {
  availableProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  recommendedProducts: Product[];
}

export interface AdminDashboard {
  totalUsers: number;
  totalFarmers: number;
  totalExporters: number;
  unverifiedExporters: number;
  pendingProducts: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentPendingProducts: Product[];
  recentUnverifiedExporters: User[];
}
