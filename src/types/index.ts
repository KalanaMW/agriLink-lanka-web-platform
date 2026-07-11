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
  farmerIdProofUrl?: string;
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
  soldQuantityKg: number;
  totalQuantityKg: number;
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

// Order types
export interface Order {
  id: number;
  orderNumber: string;
  exporterId: number;
  exporterName: string;
  exporterEmail: string;
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  trackingNumber?: string;
  shippedDate?: string;
  deliveredDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  transaction?: Transaction;
}

export interface OrderItem {
  id: number;
  productId: number;
  vegetableName: string;
  grade: string;
  district: string;
  imageUrl?: string;
  farmerName: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateOrderDto {
  items: { productId: number; quantity: number }[];
  shippingAddress?: string;
  shippingMethod?: string;
  notes?: string;
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
  unverifiedUsers: number;
  pendingProducts: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentPendingProducts: Product[];
  recentUnverifiedUsers: User[];
}
