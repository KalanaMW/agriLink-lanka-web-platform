'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/animations/PageTransition';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { Order, Product } from '@/types';
import { formatCurrency, formatDate, getImageUrl } from '@/lib/utils';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SendReportModal from '@/components/ui/SendReportModal';
import StripeCheckoutModal from '@/components/ui/StripeCheckoutModal';
import { 
  Clock, CheckCircle2, Settings, Truck, PackageCheck, XCircle,
  Banknote, Ban, Undo2, Package, Calendar, User as UserIcon, Leaf,
  ClipboardList, ShoppingBag
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Processing: 'bg-purple-100 text-purple-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5" />, 
  Confirmed: <CheckCircle2 className="w-3.5 h-3.5" />, 
  Processing: <Settings className="w-3.5 h-3.5" />, 
  Shipped: <Truck className="w-3.5 h-3.5" />, 
  Delivered: <PackageCheck className="w-3.5 h-3.5" />, 
  Cancelled: <XCircle className="w-3.5 h-3.5" />,
};

const PAYMENT_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800',
  Refunded: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5" />, 
  Completed: <Banknote className="w-3.5 h-3.5" />, 
  Failed: <Ban className="w-3.5 h-3.5" />, 
  Refunded: <Undo2 className="w-3.5 h-3.5" />,
  Cancelled: <Ban className="w-3.5 h-3.5" />,
};

function OrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [reportStatus, setReportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [stripeOrder, setStripeOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'success' | 'warning';
    confirmLabel: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', variant: 'success', confirmLabel: 'Confirm', onConfirm: () => {} });
  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

  // New order form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState('Standard');
  const [orderNotes, setOrderNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchOrders();
    // Check if we arrived from product detail page with product info
    const productId = searchParams.get('productId');
    if (productId && user?.role === 'Exporter') {
      loadProductForOrder(Number(productId));
    }
  }, [searchParams, user]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductForOrder = async (productId: number) => {
    try {
      const product = await productService.getProduct(productId);
      setOrderProduct(product);
      setShowCreateForm(true);
      const qty = searchParams.get('maxQty');
      if (qty) setOrderQuantity(Math.min(100, Number(qty)).toString());
    } catch {
      console.error('Failed to load product for order');
    }
  };

  const handleSendReport = async (dateFrom: string, dateTo: string) => {
    setReportModalOpen(false);
    setSendingReport(true);
    setReportStatus(null);
    try {
      const token = localStorage.getItem('token');
      const role = user?.role;
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      const filteredOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= from && d <= to;
      });
      const deliveredRevenue = filteredOrders
        .filter(o => o.status === 'Delivered')
        .reduce((s, o) => s + o.totalAmount, 0);
      const body: Record<string, unknown> = {
        role,
        dateFrom,
        dateTo,
        generatedAt: new Date().toISOString(),
        orders: filteredOrders.map(o => ({
          orderNumber: o.orderNumber,
          exporterName: o.exporterName ?? '',
          exporterEmail: o.exporterEmail ?? '',
          farmerName: (o as unknown as { farmerName?: string }).farmerName ?? '',
          totalAmount: o.totalAmount,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        })),
        ...(role === 'Farmer' ? {
          farmerName: user?.fullName,
          farmerRevenue: deliveredRevenue,
          productCount: 0, totalStock: 0, avgPricePerKg: 0,
          organicCount: 0, exportReadyCount: 0, products: [],
        } : {}),
        ...(role === 'Exporter' ? {
          exporterName: user?.fullName,
          exporterCompany: user?.companyName,
          totalSpent: deliveredRevenue,
          completedOrders: filteredOrders.filter(o => o.status === 'Delivered').length,
          pendingOrders: filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
        } : {}),
        ...(role === 'Admin' ? {
          totalOrders: filteredOrders.length,
          totalRevenue: deliveredRevenue,
          totalUsers: 0, totalFarmers: 0, totalExporters: 0, unverifiedExporters: 0,
          totalProducts: 0, pendingProducts: 0,
        } : {}),
      };
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setReportStatus(res.ok
        ? { type: 'success', message: 'Report sent to agrilinklanka@gmail.com' }
        : { type: 'error', message: data.error || 'Failed to send.' });
    } catch {
      setReportStatus({ type: 'error', message: 'Network error.' });
    } finally {
      setSendingReport(false);
      setTimeout(() => setReportStatus(null), 5000);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderProduct) return;
    setCreateError('');

    const qty = Number(orderQuantity);
    if (isNaN(qty) || qty <= 0 || qty > orderProduct.availableQuantityKg) {
      setCreateError(`Quantity must be between 0.01 and ${orderProduct.availableQuantityKg} kg`);
      return;
    }

    if (shippingMethod !== 'Self-Pickup' && !shippingAddress?.trim()) {
      setCreateError('Shipping address is required for delivery/courier orders');
      return;
    }

    setCreating(true);
    try {
      await orderService.createOrder({
        items: [{ productId: orderProduct.id, quantity: qty }],
        shippingAddress: shippingAddress?.trim() || undefined,
        shippingMethod: shippingMethod || undefined,
        notes: orderNotes?.trim() || undefined,
      });
      setShowCreateForm(false);
      setOrderProduct(null);
      setOrderQuantity('');
      setShippingAddress('');
      setOrderNotes('');
      await fetchOrders();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelOrder = (orderId: number) => {
    setConfirmModal({
      open: true,
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      variant: 'danger',
      confirmLabel: 'Cancel Order',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setProcessingId(orderId);
          await orderService.cancelOrder(orderId);
          setSelectedOrder(null);
          await fetchOrders();
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to cancel order.');
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleConfirmPayment = (order: Order) => {
    setStripeOrder(order);
  };

  const handleStripeSuccess = async (orderId: number, paymentIntentId: string) => {
    try {
      setProcessingId(orderId);
      await orderService.confirmPayment(orderId, paymentIntentId);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recorded but DB update failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setProcessingId(orderId);
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setProcessingId(null);
    }
  };

  const getNextStatuses = (status: string): string[] => {
    const transitions: Record<string, string[]> = {
      Pending: ['Confirmed', 'Cancelled'],
      Confirmed: ['Processing', 'Cancelled'],
      Processing: ['Shipped', 'Cancelled'],
      Shipped: ['Delivered'],
    };
    return transitions[status] || [];
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                <p className="mt-1 text-gray-600">
                  {user?.role === 'Exporter' ? 'Manage your orders and track deliveries' :
                   user?.role === 'Farmer' ? 'View orders containing your products' :
                   'Manage all platform orders'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex gap-2 flex-wrap justify-end">
                  {user?.role === 'Exporter' && (
                    <button onClick={() => router.push('/products')} className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition">
                      Browse Products
                    </button>
                  )}
                  <button
                    onClick={() => setReportModalOpen(true)}
                    disabled={sendingReport}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {sendingReport ? (
                      <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Sending...</>
                    ) : (
                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>Send Report</>
                    )}
                  </button>
                </div>
                {reportStatus && (
                  <p className={`text-sm font-medium ${reportStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {reportStatus.type === 'success' ? '✓' : '✗'} {reportStatus.message}
                  </p>
                )}
              </div>
            </div>

            {/* Order Lifecycle Flowchart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900">Order Lifecycle</h2>
                <span className="text-xs text-gray-400 ml-1">— How an order flows from placement to delivery</span>
              </div>
              <div className="flex items-stretch gap-0 min-w-[900px]">
                {/* Step 1: Order Placed */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-2 shadow-sm border-2 border-yellow-300">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Order Placed</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">Status: Pending</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    🛒 Exporter
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center px-1 pt-0 -mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-yellow-300 to-blue-300"></div>
                    <svg className="w-4 h-4 text-blue-400 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                {/* Step 2: Farmer Confirms */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2 shadow-sm border-2 border-blue-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Confirmed</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">Farmer accepts order</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
                    🌾 Farmer
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center px-1 pt-0 -mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                    <svg className="w-4 h-4 text-indigo-400 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                {/* Step 3: Payment */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2 shadow-sm border-2 border-indigo-300">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Payment</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">Stripe checkout</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                    💳 Exporter
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center px-1 pt-0 -mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                    <svg className="w-4 h-4 text-purple-400 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                {/* Step 4: Processing */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2 shadow-sm border-2 border-purple-300">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Processing</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">Preparing goods</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
                    📦 Farmer
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center px-1 pt-0 -mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-purple-300 to-sky-300"></div>
                    <svg className="w-4 h-4 text-sky-400 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                {/* Step 5: Shipped */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mb-2 shadow-sm border-2 border-sky-300">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Shipped</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">In transit</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
                    🚚 Farmer
                  </span>
                </div>
                {/* Arrow */}
                <div className="flex items-center justify-center px-1 pt-0 -mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-sky-300 to-emerald-300"></div>
                    <svg className="w-4 h-4 text-emerald-400 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                {/* Step 6: Delivered */}
                <div className="flex flex-col items-center flex-1 min-w-[140px]">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2 shadow-sm border-2 border-emerald-300">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-bold text-gray-800 text-center">Delivered</span>
                  <span className="text-[11px] text-gray-500 text-center mt-0.5">Order complete ✅</span>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    ✅ Complete
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Exporter action</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Farmer action</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span> Can be cancelled at Pending, Confirmed, or Processing</span>
              </div>
            </div>

            {/* Create Order Form */}
            {showCreateForm && orderProduct && user?.role === 'Exporter' && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-2 border-green-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">New Order</h2>
                
                {/* Product summary */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <img
                    src={getImageUrl(orderProduct.imageUrl)}
                    alt={orderProduct.vegetableName}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{orderProduct.vegetableName} - Grade {orderProduct.grade}</h3>
                    <p className="text-sm text-gray-500">{orderProduct.district} &middot; {orderProduct.farmerName}</p>
                    <p className="text-green-600 font-bold">{formatCurrency(orderProduct.pricePerKg)}/kg &middot; {orderProduct.availableQuantityKg} kg available</p>
                  </div>
                  <button onClick={() => { setShowCreateForm(false); setOrderProduct(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{createError}</div>
                )}

                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg) *</label>
                      <input
                        type="number" step="0.01" min="0.01" max={orderProduct.availableQuantityKg}
                        value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                        required
                      />
                      {orderQuantity && (
                        <p className="mt-1 text-sm text-gray-500">
                          Subtotal: {formatCurrency(Number(orderQuantity) * orderProduct.pricePerKg)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Method</label>
                      <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Express">Express</option>
                        <option value="Self-Pickup">Self-Pickup</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                    <textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={2}
                      placeholder="Enter delivery address..."
                      maxLength={500}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={2}
                      placeholder="Special instructions..."
                      maxLength={1000}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={creating}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {creating ? 'Placing Order...' : 'Place Order'}
                    </button>
                    <button type="button" onClick={() => { setShowCreateForm(false); setOrderProduct(null); }}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Orders List */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow">
                <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
                <p className="text-gray-500 mb-4">
                  {user?.role === 'Exporter' ? 'Browse products and place your first order!' : 'Orders will appear here when exporters purchase products.'}
                </p>
                {user?.role === 'Exporter' && (
                  <button onClick={() => router.push('/products')} className="flex items-center justify-center gap-2 mx-auto bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition">
                    <ShoppingBag className="w-5 h-5" /> Browse Products
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                            {STATUS_ICONS[order.status]} {order.status}
                          </span>
                          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${PAYMENT_COLORS[order.paymentStatus]}`}>
                            {PAYMENT_ICONS[order.paymentStatus]} Payment: {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(order.createdAt)}</span>
                          {user?.role !== 'Exporter' && <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4" /> By: {order.exporterName}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {order.items.slice(0, 3).map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                          <Leaf className="w-3.5 h-3.5 text-green-600" /> {item.vegetableName} ({item.quantity} kg)
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.orderNumber}</h2>
                    <p className="text-sm text-gray-500">Placed on {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Status badges */}
                <div className="flex gap-3 mb-6">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${STATUS_COLORS[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${PAYMENT_COLORS[selectedOrder.paymentStatus]}`}>
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-gray-700">Items</h3>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.vegetableName}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.vegetableName} (Grade {item.grade})</p>
                        <p className="text-xs text-gray-500">{item.district} &middot; {item.farmerName}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{item.quantity} kg x {formatCurrency(item.pricePerUnit)}</p>
                        <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order details grid */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-bold text-lg text-green-700">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Shipping Address</p>
                      <p className="font-medium">{selectedOrder.shippingAddress}</p>
                    </div>
                  )}
                  {selectedOrder.shippingMethod && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Shipping Method</p>
                      <p className="font-medium">{selectedOrder.shippingMethod}</p>
                    </div>
                  )}
                  {selectedOrder.trackingNumber && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Tracking Number</p>
                      <p className="font-medium">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                      <p className="text-gray-500">Notes</p>
                      <p className="font-medium">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>

                {/* Transaction info */}
                {selectedOrder.transaction && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Transaction Details</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-blue-600">ID:</span> {selectedOrder.transaction.transactionId}</p>
                      <p><span className="text-blue-600">Amount:</span> {formatCurrency(selectedOrder.transaction.amount)} {selectedOrder.transaction.currency}</p>
                      <p><span className="text-blue-600">Method:</span> {selectedOrder.transaction.paymentMethod}</p>
                      <p><span className="text-blue-600">Status:</span> {selectedOrder.transaction.status}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {/* Exporter can confirm payment only after farmer accepts */}
                  {user?.role === 'Exporter' && selectedOrder.paymentStatus === 'Pending' && ['Confirmed', 'Processing', 'Shipped'].includes(selectedOrder.status) && (
                    <button
                      onClick={() => handleConfirmPayment(selectedOrder)}
                      disabled={processingId === selectedOrder.id}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      {processingId === selectedOrder.id ? 'Processing...' : 'Pay with Stripe'}
                    </button>
                  )}

                  {/* Exporter can cancel pending or confirmed orders */}
                  {user?.role === 'Exporter' && (selectedOrder.status === 'Pending' || selectedOrder.status === 'Confirmed') && (
                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={processingId === selectedOrder.id}
                      className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Cancel Order
                    </button>
                  )}

                  {/* Exporter can confirm delivery when order is Shipped */}
                  {user?.role === 'Exporter' && selectedOrder.status === 'Shipped' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'Delivered')}
                      disabled={processingId === selectedOrder.id}
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {processingId === selectedOrder.id ? 'Processing...' : 'Confirm Delivery'}
                    </button>
                  )}

                  {/* Admin/Farmer can update status */}
                  {(user?.role === 'Admin' || user?.role === 'Farmer') && getNextStatuses(selectedOrder.status).length > 0 && (
                    <>
                      {getNextStatuses(selectedOrder.status).map((status) => {
                        if (status === 'Processing' && selectedOrder.paymentStatus !== 'Completed') {
                          return null;
                        }
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                            disabled={processingId === selectedOrder.id}
                            className={`px-5 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 ${
                              status === 'Cancelled' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {processingId === selectedOrder.id ? 'Processing...' : `Mark as ${status}`}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
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
          title="Send Orders Report"
          description="Orders in the selected date range will be emailed to agrilinklanka@gmail.com."
          sending={sendingReport}
          onClose={() => setReportModalOpen(false)}
          onSend={handleSendReport}
        />
        <StripeCheckoutModal
          order={stripeOrder}
          onSuccess={(paymentIntentId) => stripeOrder && handleStripeSuccess(stripeOrder.id, paymentIntentId)}
          onClose={() => setStripeOrder(null)}
        />
      </PageTransition>
    </ProtectedRoute>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
