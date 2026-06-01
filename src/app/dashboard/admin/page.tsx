'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { authService } from '@/services/authService';
import { dashboardService } from '@/services/dashboardService';
import { Product, User, Order, AdminDashboard as AdminDashboardType } from '@/types';
import { orderService } from '@/services/orderService';
import { getImageUrl, formatCurrency, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SendReportModal from '@/components/ui/SendReportModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [unverifiedExporters, setUnverifiedExporters] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dashboardData, setDashboardData] = useState<AdminDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'exporters' | 'orders' | 'users'>('products');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'success' | 'warning';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', variant: 'success', confirmLabel: 'Confirm', onConfirm: () => {} });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [all, pending, exporters, dashboard, users, orders] = await Promise.all([
        productService.getProducts({}),
        productService.getPendingProducts(),
        authService.getUnverifiedExporters(),
        dashboardService.getAdminDashboard().catch(() => null),
        authService.getAllUsers().catch(() => []),
        orderService.getOrders().catch(() => []),
      ]);
      setAllProducts(Array.isArray(all) ? all : (all.products || []));
      setPendingProducts(pending);
      setUnverifiedExporters(exporters);
      setAllOrders(orders);
      if (dashboard) setDashboardData(dashboard);
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

  const handleSendReport = async (dateFrom: string, dateTo: string) => {
    setReportModalOpen(false);
    setSendingReport(true);
    setReportStatus(null);
    try {
      const token = localStorage.getItem('token');
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      const filteredOrders = allOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= from && d <= to;
      });
      const filteredRevenue = filteredOrders
        .filter(o => o.status === 'Delivered')
        .reduce((s, o) => s + o.totalAmount, 0);
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role: 'Admin',
          dateFrom,
          dateTo,
          totalUsers: dashboardData?.totalUsers ?? 0,
          totalFarmers: dashboardData?.totalFarmers ?? 0,
          totalExporters: dashboardData?.totalExporters ?? 0,
          unverifiedExporters: dashboardData?.unverifiedExporters ?? 0,
          totalProducts: dashboardData?.totalProducts ?? 0,
          pendingProducts: dashboardData?.pendingProducts ?? 0,
          totalOrders: filteredOrders.length,
          totalRevenue: filteredRevenue,
          orders: filteredOrders.map((o) => ({
            orderNumber: o.orderNumber,
            exporterName: o.exporterName,
            exporterEmail: o.exporterEmail,
            totalAmount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
          })),
          generatedAt: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      setReportStatus(response.ok
        ? { type: 'success', message: 'Report sent to agrilinklanka@gmail.com' }
        : { type: 'error', message: data.error || 'Failed to send report.' });
    } catch {
      setReportStatus({ type: 'error', message: 'Network error. Could not send report.' });
    } finally {
      setSendingReport(false);
      setTimeout(() => setReportStatus(null), 5000);
    }
  };

  const handleApprove = (id: number) => {
    setConfirmModal({
      open: true,
      title: 'Approve Product',
      message: 'Are you sure you want to approve this product? It will become visible on the marketplace.',
      variant: 'success',
      confirmLabel: 'Approve',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setProcessingId(id);
          await productService.approveProduct(id);
          await fetchData();
          setSelectedProduct(null);
        } catch (error) {
          console.error('Failed to approve product:', error);
          alert('Failed to approve product. Please try again.');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleReject = (id: number) => {
    setConfirmModal({
      open: true,
      title: 'Reject Product',
      message: 'Are you sure you want to reject and delete this product? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Reject',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setProcessingId(id);
          await productService.rejectProduct(id);
          await fetchData();
          setSelectedProduct(null);
        } catch (error) {
          console.error('Failed to reject product:', error);
          alert('Failed to reject product. Please try again.');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleVerifyExporter = (userId: number) => {
    setConfirmModal({
      open: true,
      title: 'Verify Exporter',
      message: 'Are you sure you want to verify this exporter? They will gain access to purchase products on the platform.',
      variant: 'success',
      confirmLabel: 'Verify',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setVerifyingId(userId);
          await authService.verifyExporter(userId);
          await fetchData();
        } catch (error) {
          console.error('Failed to verify exporter:', error);
          alert('Failed to verify exporter. Please try again.');
        } finally {
          setVerifyingId(null);
        }
      },
    });
  };

  const handleToggleUserStatus = (userId: number, isActive: boolean, name: string) => {
    const action = isActive ? 'deactivate' : 'activate';
    const actionLabel = isActive ? 'Deactivate' : 'Activate';
    setConfirmModal({
      open: true,
      title: `${actionLabel} User`,
      message: `Are you sure you want to ${action} "${name}"? ${isActive ? 'They will no longer be able to log in.' : 'They will regain access to their account.'}`,
      variant: isActive ? 'danger' : 'success',
      confirmLabel: actionLabel,
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setTogglingUserId(userId);
          await authService.toggleUserStatus(userId);
          await fetchData();
        } catch (error) {
          console.error('Failed to toggle user status:', error);
          alert('Failed to update user status. Please try again.');
        } finally {
          setTogglingUserId(null);
        }
      },
    });
  };

  const availableProducts = allProducts?.filter(p => p.status === 'Available') || [];
  const filteredUsers = userRoleFilter
    ? allUsers.filter(u => u.role === userRoleFilter)
    : allUsers;

  return (
    <RoleProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back, {user?.fullName}!</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => setReportModalOpen(true)}
                disabled={sendingReport || loading}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingReport ? (
                  <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Sending...</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Send Report</>  
                )}
              </button>
              {reportStatus && (
                <p className={`text-sm font-medium ${reportStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {reportStatus.type === 'success' ? '✓' : '✗'} {reportStatus.message}
                </p>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-5">
              <div className="text-sm font-medium text-gray-500">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData?.totalUsers || 0}</div>
              <div className="text-xs text-gray-400 mt-1">{dashboardData?.totalFarmers || 0} farmers, {dashboardData?.totalExporters || 0} exporters</div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="text-sm font-medium text-gray-500">Pending Approval</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{pendingProducts?.length || 0}</div>
              <div className="text-xs text-gray-400 mt-1">products await review</div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="text-sm font-medium text-gray-500">Unverified Exporters</div>
              <div className="mt-2 text-3xl font-bold text-orange-600">{unverifiedExporters?.length || 0}</div>
              <div className="text-xs text-gray-400 mt-1">need verification</div>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="mt-2 text-2xl font-bold text-green-600">{formatCurrency(dashboardData?.totalRevenue || 0)}</div>
              <div className="text-xs text-gray-400 mt-1">{dashboardData?.totalOrders || 0} orders</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'products' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Management ({pendingProducts?.length || 0} pending)
            </button>
            <button
              onClick={() => setActiveTab('exporters')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'exporters' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Exporter Verification ({unverifiedExporters?.length || 0} pending)
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'orders' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Orders ({allOrders?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                activeTab === 'users' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Registered Users ({allUsers?.length || 0})
            </button>
          </div>

          {activeTab === 'products' && (
          <>
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Product Approvals ({pendingProducts?.length || 0})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading products...</p>
              </div>
            ) : pendingProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <p>No pending approvals</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.vegetableName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg';
                        }}
                      />
                      {product.isOrganic && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Organic
                        </span>
                      )}
                      {product.isExportReady && (
                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Export Ready
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900">{product.vegetableName}</h3>
                    {product.variety && (
                      <p className="text-sm text-gray-600">{product.variety}</p>
                    )}
                    
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Grade:</span>
                        <span className="font-semibold text-gray-900">{product.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Price:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(product.pricePerKg)}/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Quantity:</span>
                        <span className="font-semibold text-gray-900">{product.availableQuantityKg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">District:</span>
                        <span className="font-semibold text-gray-900">{product.district}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Farmer:</span>
                        <span className="font-semibold text-gray-900">{product.farmerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Harvest Date:</span>
                        <span className="font-semibold text-gray-900">{formatDate(product.harvestDate)}</span>
                      </div>
                    </div>

                    {product.description && (
                      <p className="mt-3 text-sm text-gray-700 line-clamp-2">{product.description}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleApprove(product.id)}
                        disabled={processingId === product.id}
                        className="flex-1 px-3 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        {processingId === product.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(product.id)}
                        disabled={processingId === product.id}
                        className="flex-1 px-3 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Products</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading products...</p>
              </div>
            ) : !allProducts || allProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-lg">No products yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={getImageUrl(product.imageUrl)}
                                alt={product.vegetableName}
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.svg';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.vegetableName}</div>
                              {product.variety && (
                                <div className="text-sm text-gray-500">{product.variety}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.farmerName}</div>
                          <div className="text-sm text-gray-500">{product.farmerEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.pricePerKg)}/kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.availableQuantityKg} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'Available' ? 'bg-green-100 text-green-800' :
                            product.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}

          {activeTab === 'exporters' && (
          <>
          {/* Unverified Exporters Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Unverified Exporters ({unverifiedExporters?.length || 0})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading exporters...</p>
              </div>
            ) : unverifiedExporters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <p>All exporters are verified!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unverifiedExporters.map((exporter) => (
                  <div key={exporter.id} className="border rounded-lg p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                        {exporter.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{exporter.fullName}</h3>
                        <p className="text-sm text-gray-500">{exporter.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      {exporter.companyName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Company:</span>
                          <span className="font-medium text-gray-900">{exporter.companyName}</span>
                        </div>
                      )}
                      {exporter.district && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">District:</span>
                          <span className="font-medium text-gray-900">{exporter.district}</span>
                        </div>
                      )}
                      {exporter.phoneNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-gray-900">{exporter.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registered:</span>
                        <span className="font-medium text-gray-900">{formatDate(exporter.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Unverified
                      </span>
                      <button
                        onClick={() => handleVerifyExporter(exporter.id)}
                        disabled={verifyingId === exporter.id}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                      >
                        {verifyingId === exporter.id ? 'Verifying...' : 'Verify Exporter'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
          )}

          {activeTab === 'orders' && (
          <>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Orders ({allOrders?.length || 0})</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading orders...</p>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-lg">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exporter</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>{order.exporterName}</div>
                          <div className="text-xs text-gray-400">{order.exporterEmail}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-800' :
                            order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          {!['Delivered', 'Cancelled'].includes(order.status) && (
                            <select
                              disabled={updatingOrderId === order.id}
                              defaultValue=""
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (!newStatus) return;
                                setConfirmModal({
                                  open: true,
                                  title: 'Update Order Status',
                                  message: `Change order ${order.orderNumber} status to "${newStatus}"?`,
                                  variant: 'warning',
                                  confirmLabel: 'Update',
                                  onConfirm: async () => {
                                    closeConfirmModal();
                                    try {
                                      setUpdatingOrderId(order.id);
                                      await orderService.updateOrderStatus(order.id, { status: newStatus });
                                      await fetchData();
                                    } catch {
                                      alert('Failed to update order status.');
                                    } finally {
                                      setUpdatingOrderId(null);
                                    }
                                  },
                                });
                                e.target.value = '';
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 disabled:opacity-50"
                            >
                              <option value="">Update status...</option>
                              {order.status === 'Pending' && <option value="Confirmed">Confirm</option>}
                              {order.status === 'Confirmed' && <option value="Processing">Processing</option>}
                              {order.status === 'Processing' && <option value="Shipped">Ship</option>}
                              {order.status === 'Shipped' && <option value="Delivered">Deliver</option>}
                              {!['Delivered', 'Cancelled'].includes(order.status) && <option value="Cancelled">Cancel</option>}
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}

          {activeTab === 'users' && (
          <>
          {/* All Registered Users Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                All Registered Users ({filteredUsers.length})
              </h2>
              <div className="flex gap-2">
                {['', 'Farmer', 'Exporter'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
                      userRoleFilter === role
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {role || 'All'}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {u.profileImageUrl ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={getImageUrl(u.profileImageUrl)} alt={u.fullName} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                  {u.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === 'Farmer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.district || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.phoneNumber || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.companyName || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.isVerified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {u.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.isActive, u.fullName)}
                            disabled={togglingUserId === u.id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition disabled:opacity-50 ${
                              u.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {togglingUserId === u.id ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          </>
          )}

        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.vegetableName}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(selectedProduct.imageUrl)}
                  alt={selectedProduct.vegetableName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.svg';
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-700">Grade:</span>
                  <p className="font-semibold text-gray-900">{selectedProduct.grade}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">Price:</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedProduct.pricePerKg)}/kg</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">Available Quantity:</span>
                  <p className="font-semibold text-gray-900">{selectedProduct.availableQuantityKg} kg</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">District:</span>
                  <p className="font-semibold text-gray-900">{selectedProduct.district}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">Harvest Date:</span>
                  <p className="font-semibold text-gray-900">{formatDate(selectedProduct.harvestDate)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-700">Status:</span>
                  <p className="font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedProduct.status === 'Available' ? 'bg-green-100 text-green-800' :
                      selectedProduct.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-700">Farmer Information:</span>
                <p className="font-semibold text-gray-900">{selectedProduct.farmerName}</p>
                <p className="text-sm text-gray-700">{selectedProduct.farmerEmail}</p>
                <p className="text-sm text-gray-700">{selectedProduct.farmerPhone}</p>
              </div>

              <div className="mb-4 flex gap-2">
                {selectedProduct.isOrganic && (
                  <span className="px-3 py-1 bg-green-100 text-green-900 text-sm font-medium rounded-full">
                    ✓ Organic
                  </span>
                )}
                {selectedProduct.isExportReady && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-900 text-sm font-medium rounded-full">
                    ✓ Export Ready
                  </span>
                )}
              </div>

              {selectedProduct.description && (
                <div className="mb-4">
                  <span className="text-sm text-gray-700">Description:</span>
                  <p className="text-gray-800 mt-1">{selectedProduct.description}</p>
                </div>
              )}

              {selectedProduct.certificationUrl && (
                <div className="mb-4">
                  <a
                    href={getImageUrl(selectedProduct.certificationUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Certification Document →
                  </a>
                </div>
              )}

              {selectedProduct.status === 'Pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedProduct.id)}
                    disabled={processingId === selectedProduct.id}
                    className="flex-1 px-4 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    {processingId === selectedProduct.id ? 'Processing...' : 'Approve Product'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedProduct.id)}
                    disabled={processingId === selectedProduct.id}
                    className="flex-1 px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
                  >
                    Reject Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />
      <SendReportModal
        open={reportModalOpen}
        title="Send Platform Report"
        description="Platform stats + orders in the selected date range will be emailed to agrilinklanka@gmail.com."
        sending={sendingReport}
        onClose={() => setReportModalOpen(false)}
        onSend={handleSendReport}
      />
    </RoleProtectedRoute>
  );
}
