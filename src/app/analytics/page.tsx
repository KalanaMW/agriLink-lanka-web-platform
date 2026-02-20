'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/animations/PageTransition';
import { dashboardService } from '@/services/dashboardService';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { Product, Order, FarmerDashboard } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FarmerDashboard | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashData, prods, ords] = await Promise.all([
          dashboardService.getFarmerDashboard(),
          productService.getMyProducts(),
          orderService.getOrders(),
        ]);
        setDashboard(dashData);
        setProducts(prods);
        setOrders(ords);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute analytics from data
  const gradeDistribution = products.reduce((acc, p) => {
    acc[p.grade] = (acc[p.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const districtDistribution = products.reduce((acc, p) => {
    acc[p.district] = (acc[p.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusDistribution = products.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const orderStatusDist = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const avgPrice = products.length > 0
    ? products.reduce((sum, p) => sum + p.pricePerKg, 0) / products.length
    : 0;

  const totalStock = products.reduce((sum, p) => sum + p.availableQuantityKg, 0);
  const organicCount = products.filter(p => p.isOrganic).length;
  const exportReadyCount = products.filter(p => p.isExportReady).length;

  const STATUS_COLORS: Record<string, string> = {
    Available: 'bg-green-500',
    Pending: 'bg-yellow-500',
    Sold: 'bg-blue-500',
    OutOfStock: 'bg-red-500',
  };

  const ORDER_STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-500',
    Confirmed: 'bg-blue-500',
    Processing: 'bg-purple-500',
    Shipped: 'bg-indigo-500',
    Delivered: 'bg-green-500',
    Cancelled: 'bg-red-500',
  };

  const GRADE_COLORS: Record<string, string> = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-yellow-500',
  };

  const BarChart = ({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 w-24 text-right">{key}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full rounded-full ${colors[key] || 'bg-gray-400'} flex items-center justify-end pr-2 transition-all duration-500`}
                style={{ width: `${Math.max((value / max) * 100, 8)}%` }}
              >
                <span className="text-xs font-bold text-white">{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <RoleProtectedRoute allowedRoles={['Farmer']}>
      <PageTransition>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="mt-2 text-gray-600">Insights into your farming business performance</p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading analytics...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{orders.length}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Avg Price/kg</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(avgPrice)}</p>
                  </div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Total Stock</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalStock.toFixed(1)} kg</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Organic Products</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{organicCount}</p>
                    <p className="text-xs text-gray-400">{products.length > 0 ? ((organicCount / products.length) * 100).toFixed(0) : 0}% of total</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Export Ready</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{exportReadyCount}</p>
                    <p className="text-xs text-gray-400">{products.length > 0 ? ((exportReadyCount / products.length) * 100).toFixed(0) : 0}% of total</p>
                  </div>
                  <div className="bg-white rounded-xl shadow p-5">
                    <p className="text-sm text-gray-500">Pending Approval</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">{statusDistribution['Pending'] || 0}</p>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Product Status Distribution */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
                    {Object.keys(statusDistribution).length > 0 ? (
                      <BarChart data={statusDistribution} colors={STATUS_COLORS} />
                    ) : (
                      <p className="text-gray-400 text-center py-4">No products yet</p>
                    )}
                  </div>

                  {/* Grade Distribution */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                    {Object.keys(gradeDistribution).length > 0 ? (
                      <BarChart data={gradeDistribution} colors={GRADE_COLORS} />
                    ) : (
                      <p className="text-gray-400 text-center py-4">No products yet</p>
                    )}
                  </div>

                  {/* Order Status */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                    {Object.keys(orderStatusDist).length > 0 ? (
                      <BarChart data={orderStatusDist} colors={ORDER_STATUS_COLORS} />
                    ) : (
                      <p className="text-gray-400 text-center py-4">No orders yet</p>
                    )}
                  </div>

                  {/* District Distribution */}
                  <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by District</h3>
                    {Object.keys(districtDistribution).length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {Object.entries(districtDistribution)
                          .sort((a, b) => b[1] - a[1])
                          .map(([district, count]) => {
                            const max = Math.max(...Object.values(districtDistribution), 1);
                            return (
                              <div key={district} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-32 text-right truncate">{district}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-green-500 flex items-center justify-end pr-2 transition-all duration-500"
                                    style={{ width: `${Math.max((count / max) * 100, 10)}%` }}
                                  >
                                    <span className="text-xs font-bold text-white">{count}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">No products yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exporter</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orders.slice(0, 10).map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{order.exporterName}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</td>
                              <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No orders received yet</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </RoleProtectedRoute>
  );
}
