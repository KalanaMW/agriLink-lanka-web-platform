'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/animations/PageTransition';
import { dashboardService } from '@/services/dashboardService';
import { productService } from '@/services/productService';
import { orderService } from '@/services/orderService';
import { Product, Order, FarmerDashboard, ExporterDashboard, AdminDashboard } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import SendReportModal from '@/components/ui/SendReportModal';
import {
  LineChart, Leaf, ClipboardList, Wallet, BarChart3, Package, Plane,
  Hourglass, Medal, MapPin, Receipt, CreditCard, Clock, Settings,
  Users, Wheat, Ship, Unlock
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Available: 'bg-green-500', Pending: 'bg-yellow-500', Sold: 'bg-blue-500', OutOfStock: 'bg-red-500',
};
const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-500', Confirmed: 'bg-blue-500', Processing: 'bg-purple-500',
  Shipped: 'bg-indigo-500', Delivered: 'bg-green-500', Cancelled: 'bg-red-500',
};
const GRADE_COLORS: Record<string, string> = { A: 'bg-green-500', B: 'bg-blue-500', C: 'bg-yellow-500' };

function BarChart({ data, colors }: { data: Record<string, number>; colors: Record<string, string> }) {
  return (
    <div className="space-y-4 pt-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${colors[key] || 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">{key}</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, color = 'text-gray-900', icon, bgIconColor = 'bg-gray-50', iconColor = 'text-gray-500' }: { label: string; value: string | number; sub?: string; color?: string; icon?: React.ReactNode; bgIconColor?: string; iconColor?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${bgIconColor} ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Farmer state
  const [farmerDash, setFarmerDash] = useState<FarmerDashboard | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [farmerOrders, setFarmerOrders] = useState<Order[]>([]);

  // Exporter state
  const [exporterDash, setExporterDash] = useState<ExporterDashboard | null>(null);
  const [exporterOrders, setExporterOrders] = useState<Order[]>([]);

  // Admin state
  const [adminDash, setAdminDash] = useState<AdminDashboard | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (user?.role === 'Farmer') {
          const [dash, prods, ords] = await Promise.all([
            dashboardService.getFarmerDashboard(),
            productService.getMyProducts(),
            orderService.getOrders(),
          ]);
          setFarmerDash(dash);
          setFarmerProducts(prods);
          setFarmerOrders(ords);
        } else if (user?.role === 'Exporter') {
          const [dash, ords] = await Promise.all([
            dashboardService.getExporterDashboard(),
            orderService.getOrders(),
          ]);
          setExporterDash(dash);
          setExporterOrders(ords);
        } else if (user?.role === 'Admin') {
          const [dash, prods] = await Promise.all([
            dashboardService.getAdminDashboard(),
            productService.getProducts({}),
          ]);
          setAdminDash(dash);
          setAllProducts(Array.isArray(prods) ? prods : (prods.products || []));
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetch();
  }, [user]);

  const handleSendReport = async (dateFrom: string, dateTo: string) => {
    setReportModalOpen(false);
    setSendingReport(true);
    setReportStatus(null);
    try {
      const token = localStorage.getItem('token');
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      const filterByDate = (list: Order[]) =>
        list.filter(o => { const d = new Date(o.createdAt); return d >= from && d <= to; });

      let body: Record<string, unknown> = {
        role: user?.role,
        dateFrom,
        dateTo,
        generatedAt: new Date().toISOString(),
      };

      if (user?.role === 'Admin') {
        // Analytics page for admin: platform stats + all products (no orders — analytics screen doesn't show orders)
        body = { ...body,
          totalUsers: adminDash?.totalUsers ?? 0,
          totalFarmers: adminDash?.totalFarmers ?? 0,
          totalExporters: adminDash?.totalExporters ?? 0,
          unverifiedUsers: adminDash?.unverifiedUsers ?? 0,
          totalProducts: adminDash?.totalProducts ?? 0,
          pendingProducts: adminDash?.pendingProducts ?? 0,
          totalOrders: adminDash?.totalOrders ?? 0,
          totalRevenue: adminDash?.totalRevenue ?? 0,
          orders: [],
          products: allProducts.map(p => ({
            name: p.vegetableName,
            grade: p.grade,
            status: p.status,
            pricePerKg: p.pricePerKg,
            availableQty: p.availableQuantityKg,
          })),
        };
      } else if (user?.role === 'Farmer') {
        const products = farmerProducts;
        const filteredOrders = filterByDate(farmerOrders);
        const totalRevenue = filteredOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
        const totalStock = products.reduce((s, p) => s + p.availableQuantityKg, 0);
        body = { ...body,
          farmerName: user.fullName,
          productCount: products.length,
          organicCount: products.filter(p => p.isOrganic).length,
          exportReadyCount: products.filter(p => p.isExportReady).length,
          totalStock,
          avgPricePerKg: products.length > 0 ? products.reduce((s, p) => s + p.pricePerKg, 0) / products.length : 0,
          farmerRevenue: totalRevenue,
          products: products.map(p => ({
            name: p.vegetableName,
            grade: p.grade,
            status: p.status,
            pricePerKg: p.pricePerKg,
            availableQty: p.availableQuantityKg,
          })),
          orders: filteredOrders.map(o => ({
            orderNumber: o.orderNumber,
            exporterName: o.exporterName,
            exporterEmail: o.exporterEmail,
            totalAmount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
          })),
        };
      } else if (user?.role === 'Exporter') {
        const filteredOrders = filterByDate(exporterOrders);
        body = { ...body,
          exporterName: user.fullName,
          exporterCompany: user.companyName,
          totalSpent: filteredOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0),
          completedOrders: filteredOrders.filter(o => o.status === 'Delivered').length,
          pendingOrders: filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
          orders: filteredOrders.map(o => ({
            orderNumber: o.orderNumber,
            farmerName: '',
            totalAmount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
          })),
        };
      }

      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setReportStatus(res.ok
        ? { type: 'success', message: 'Report sent to agrilinklanka@gmail.com' }
        : { type: 'error', message: data.error || 'Failed to send report.' });
    } catch {
      setReportStatus({ type: 'error', message: 'Network error. Could not send report.' });
    } finally {
      setSendingReport(false);
      setTimeout(() => setReportStatus(null), 5000);
    }
  };

  const renderFarmerAnalytics = () => {
    const products = farmerProducts;
    const orders = farmerOrders;
    const gradeDistribution = products.reduce((acc, p) => { acc[p.grade] = (acc[p.grade] || 0) + 1; return acc; }, {} as Record<string, number>);
    const districtDistribution = products.reduce((acc, p) => { acc[p.district] = (acc[p.district] || 0) + 1; return acc; }, {} as Record<string, number>);
    const statusDistribution = products.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const orderStatusDist = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
    const avgPrice = products.length > 0 ? products.reduce((s, p) => s + p.pricePerKg, 0) / products.length : 0;
    const totalStock = products.reduce((s, p) => s + p.availableQuantityKg, 0);
    const organicCount = products.filter(p => p.isOrganic).length;
    const exportReadyCount = products.filter(p => p.isExportReady).length;

    return (
      <>
        <p className="mt-2 text-gray-600 flex items-center gap-2"><LineChart className="w-5 h-5 text-gray-400"/> Insights into your farming business performance</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <StatCard label="Total Products" value={products.length} icon={<Leaf className="w-6 h-6" />} bgIconColor="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Total Orders" value={orders.length} color="text-blue-600" icon={<ClipboardList className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} color="text-green-600" icon={<Wallet className="w-6 h-6" />} bgIconColor="bg-emerald-50" iconColor="text-emerald-600" />
          <StatCard label="Avg Price/kg" value={formatCurrency(avgPrice)} color="text-purple-600" icon={<BarChart3 className="w-6 h-6" />} bgIconColor="bg-purple-50" iconColor="text-purple-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Stock" value={`${totalStock.toFixed(1)} kg`} icon={<Package className="w-6 h-6" />} bgIconColor="bg-orange-50" iconColor="text-orange-600" />
          <StatCard label="Organic Products" value={organicCount} color="text-green-600" sub={`${products.length > 0 ? ((organicCount / products.length) * 100).toFixed(0) : 0}% of total`} icon={<Leaf className="w-6 h-6" />} bgIconColor="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Export Ready" value={exportReadyCount} color="text-blue-600" sub={`${products.length > 0 ? ((exportReadyCount / products.length) * 100).toFixed(0) : 0}% of total`} icon={<Plane className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Pending Approval" value={statusDistribution['Pending'] || 0} color="text-yellow-600" icon={<Hourglass className="w-6 h-6" />} bgIconColor="bg-yellow-50" iconColor="text-yellow-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gray-400" /> Product Status</h3>
            {Object.keys(statusDistribution).length > 0 ? <BarChart data={statusDistribution} colors={STATUS_COLORS} /> : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-gray-400" /> Grade Distribution</h3>
            {Object.keys(gradeDistribution).length > 0 ? <BarChart data={gradeDistribution} colors={GRADE_COLORS} /> : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-gray-400" /> Order Status</h3>
            {Object.keys(orderStatusDist).length > 0 ? <BarChart data={orderStatusDist} colors={ORDER_STATUS_COLORS} /> : <p className="text-gray-400 text-center py-4">No orders yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-gray-400" /> Products by District</h3>
            {Object.keys(districtDistribution).length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pt-2">
                {Object.entries(districtDistribution).sort((a, b) => b[1] - a[1]).map(([district, count]) => {
                  return (
                    <div key={district} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700">{district}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
        </div>
        {orders.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-gray-400" /> Recent Orders (containing your products)</h3>
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
                      <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length ?? 0} items</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderExporterAnalytics = () => {
    const orders = exporterOrders;
    const orderStatusDist = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const totalSpent = orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0);
    const avgOrderValue = orders.length > 0 ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0;
    const pendingPayment = orders.filter(o => o.paymentStatus === 'Pending').length;

    return (
      <>
        <p className="mt-2 text-gray-600 flex items-center gap-2"><Ship className="w-5 h-5 text-gray-400" /> Track your procurement and spending analytics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <StatCard label="Total Orders" value={orders.length} icon={<ClipboardList className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Total Spent" value={formatCurrency(totalSpent)} color="text-green-600" icon={<CreditCard className="w-6 h-6" />} bgIconColor="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} color="text-blue-600" icon={<BarChart3 className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Pending Payment" value={pendingPayment} color="text-yellow-600" icon={<Clock className="w-6 h-6" />} bgIconColor="bg-yellow-50" iconColor="text-yellow-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gray-400" /> Order Status Breakdown</h3>
            {Object.keys(orderStatusDist).length > 0 ? <BarChart data={orderStatusDist} colors={ORDER_STATUS_COLORS} /> : <p className="text-gray-400 text-center py-4">No orders yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-gray-400" /> Spending Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Spent (Delivered)</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Pending Orders</span>
                <span className="font-semibold text-yellow-600">{exporterDash?.pendingOrders ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Completed Orders</span>
                <span className="font-semibold text-green-600">{exporterDash?.completedOrders ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Available Products on Platform</span>
                <span className="font-semibold text-blue-600">{exporterDash?.availableProducts ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
        {orders.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-gray-400" /> Order History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.items?.length ?? 0} items</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderAdminAnalytics = () => {
    const dash = adminDash;
    const products = allProducts;
    const gradeDistribution = products.reduce((acc, p) => { acc[p.grade] = (acc[p.grade] || 0) + 1; return acc; }, {} as Record<string, number>);
    const statusDistribution = products.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const districtDistribution = products.reduce((acc, p) => { acc[p.district] = (acc[p.district] || 0) + 1; return acc; }, {} as Record<string, number>);

    return (
      <>
        <p className="mt-2 text-gray-600 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-400" /> Platform-wide analytics and insights</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          <StatCard label="Total Users" value={dash?.totalUsers ?? 0} icon={<Users className="w-6 h-6" />} bgIconColor="bg-indigo-50" iconColor="text-indigo-600" />
          <StatCard label="Total Products" value={dash?.totalProducts ?? 0} color="text-blue-600" icon={<Leaf className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Total Orders" value={dash?.totalOrders ?? 0} color="text-purple-600" icon={<ClipboardList className="w-6 h-6" />} bgIconColor="bg-purple-50" iconColor="text-purple-600" />
          <StatCard label="Total Revenue" value={formatCurrency(dash?.totalRevenue ?? 0)} color="text-green-600" icon={<Wallet className="w-6 h-6" />} bgIconColor="bg-green-50" iconColor="text-green-600" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Farmers" value={dash?.totalFarmers ?? 0} color="text-green-600" icon={<Wheat className="w-6 h-6" />} bgIconColor="bg-green-50" iconColor="text-green-600" />
          <StatCard label="Exporters" value={dash?.totalExporters ?? 0} color="text-blue-600" icon={<Ship className="w-6 h-6" />} bgIconColor="bg-blue-50" iconColor="text-blue-600" />
          <StatCard label="Pending Products" value={dash?.pendingProducts ?? 0} color="text-yellow-600" icon={<Hourglass className="w-6 h-6" />} bgIconColor="bg-yellow-50" iconColor="text-yellow-600" />
          <StatCard label="Unverified Users" value={dash?.unverifiedUsers ?? 0} color="text-orange-600" icon={<Unlock className="w-6 h-6" />} bgIconColor="bg-orange-50" iconColor="text-orange-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-gray-400" /> Product Status Distribution</h3>
            {Object.keys(statusDistribution).length > 0 ? <BarChart data={statusDistribution} colors={STATUS_COLORS} /> : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Medal className="w-5 h-5 text-gray-400" /> Grade Distribution</h3>
            {Object.keys(gradeDistribution).length > 0 ? <BarChart data={gradeDistribution} colors={GRADE_COLORS} /> : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-gray-400" /> User Breakdown</h3>
            <BarChart
              data={{ Farmers: dash?.totalFarmers ?? 0, Exporters: dash?.totalExporters ?? 0, 'Unverified Users': dash?.unverifiedUsers ?? 0 }}
              colors={{ Farmers: 'bg-green-500', Exporters: 'bg-blue-500', 'Unverified Exporters': 'bg-orange-500' }}
            />
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by District</h3>
            {Object.keys(districtDistribution).length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto pt-2">
                {Object.entries(districtDistribution).sort((a, b) => b[1] - a[1]).map(([district, count]) => {
                  return (
                    <div key={district} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-700">{district}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-gray-400 text-center py-4">No products yet</p>}
          </div>
        </div>
        {(dash?.recentPendingProducts?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Hourglass className="w-5 h-5 text-gray-400" /> Recent Pending Products</h3>
            <div className="divide-y divide-gray-100">
              {dash!.recentPendingProducts.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.vegetableName} {p.variety ? `(${p.variety})` : ''}</p>
                    <p className="text-xs text-gray-500">{p.farmerName} · {p.district} · Grade {p.grade}</p>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">{formatCurrency(p.pricePerKg)}/kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div 
          className="min-h-screen py-8 relative"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/ANALYTICS_BG_jmohmc.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
              <h1 className="text-3xl font-extrabold text-gray-900">Analytics</h1>
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => setReportModalOpen(true)}
                  disabled={sendingReport || loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-700 transition disabled:opacity-50"
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
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading analytics...</p>
              </div>
            ) : (
              <>
                {user?.role === 'Farmer' && renderFarmerAnalytics()}
                {user?.role === 'Exporter' && renderExporterAnalytics()}
                {user?.role === 'Admin' && renderAdminAnalytics()}
              </>
            )}
          </div>
        </div>
        <SendReportModal
          open={reportModalOpen}
          title="Send Analytics Report"
          description="Analytics data relevant to this screen will be emailed to agrilinklanka@gmail.com."
          sending={sendingReport}
          onClose={() => setReportModalOpen(false)}
          onSend={handleSendReport}
        />
      </PageTransition>
    </ProtectedRoute>
  );
}
