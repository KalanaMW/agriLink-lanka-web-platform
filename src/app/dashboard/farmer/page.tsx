'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { dashboardService } from '@/services/dashboardService';
import { Product, FarmerDashboard as FarmerDashboardType } from '@/types';
import { getImageUrl, formatCurrency, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/animations/PageTransition';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { 
  Wheat, Leaf, Hourglass, ClipboardList, Wallet, Package, MapPin, Search 
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardData, setDashboardData] = useState<FarmerDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

  const fetchData = async () => {
    try {
      const [productsData, dashboard] = await Promise.all([
        productService.getMyProducts(),
        dashboardService.getFarmerDashboard().catch(() => null),
      ]);
      setProducts(productsData);
      if (dashboard) setDashboardData(dashboard);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: number, name: string) => {
    setConfirmModal({
      open: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        closeConfirmModal();
        try {
          setDeletingId(id);
          await productService.deleteProduct(id);
          await fetchData();
        } catch (error) {
          console.error('Failed to delete product:', error);
          alert('Failed to delete product. Please try again.');
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <RoleProtectedRoute allowedRoles={['Farmer']}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative py-8"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/DASHBOARD_BG_bcuuez.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50"
          >
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><Wheat className="w-8 h-8 text-green-600" /> Farmer Dashboard</h1>
            <p className="mt-2 text-gray-800 font-medium">Welcome back, {user?.fullName}!</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Products</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData?.totalProducts ?? products.length}</div>
                  <div className="text-xs text-gray-400 mt-2">{dashboardData?.approvedProducts ?? products.filter(p => p.status === 'Available').length} available</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Pending Approval</div>
                  <div className="mt-2 text-3xl font-bold text-yellow-600">
                    {dashboardData?.pendingProducts ?? products.filter(p => p.status === 'Pending').length}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">awaiting admin review</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                  <Hourglass className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Orders</div>
                  <div className="mt-2 text-3xl font-bold text-blue-600">
                    {dashboardData?.totalOrders ?? 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">orders containing your products</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Revenue</div>
                  <div className="mt-2 text-2xl font-bold text-green-600">
                    {formatCurrency(dashboardData?.totalRevenue ?? 0)}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">from delivered orders</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stock Summary - Per Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-gray-400" /> Current Stock Summary</h3>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">No products listed yet.</p>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const total = product.totalQuantityKg || product.availableQuantityKg;
                  const sold = product.soldQuantityKg || 0;
                  const available = product.availableQuantityKg;
                  const soldPercent = total > 0 ? Math.min(100, (sold / total) * 100) : 0;

                  return (
                    <div key={product.id} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.vegetableName}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => { e.currentTarget.src = '/placeholder-product.svg'; }}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.vegetableName}</p>
                            {product.variety && <p className="text-xs text-gray-500">{product.variety}</p>}
                          </div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          product.status === 'Available' ? 'bg-green-100 text-green-700' :
                          product.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${soldPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span className="text-green-700 font-medium">{available} kg available</span>
                        <span className="text-blue-600">{sold} kg sold</span>
                        <span>{total} kg total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.a 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="/products/create" 
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add New Product
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="/orders" 
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                View Orders
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="/analytics" 
                className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                View Analytics
              </motion.a>
            </div>
          </motion.div>

          {/* Product Grading Guidelines */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow p-6 mb-8"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Grading Guidelines</h3>
                <p className="text-sm text-gray-700 mb-3">Use these standards when listing your products:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-bold text-sm mr-2">A</span>
                      <span className="font-semibold text-gray-900">Premium Quality</span>
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Uniform size and shape</li>
                      <li>• No defects or blemishes</li>
                      <li>• Perfect appearance</li>
                      <li>• Best market price</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm mr-2">B</span>
                      <span className="font-semibold text-gray-900">Good Quality</span>
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Slight size variations</li>
                      <li>• Minor blemishes allowed</li>
                      <li>• Good overall appearance</li>
                      <li>• Standard market price</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm mr-2">C</span>
                      <span className="font-semibold text-gray-900">Standard Quality</span>
                    </div>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>• Mixed sizes acceptable</li>
                      <li>• Cosmetic defects ok</li>
                      <li>• Edible and fresh</li>
                      <li>• Budget-friendly price</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Products</h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-lg">No products yet</p>
                <p className="text-sm mt-2">Click "Add New Product" to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
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
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.pricePerKg)}/kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-gray-900">{product.availableQuantityKg} kg remaining</div>
                          {(product.soldQuantityKg ?? 0) > 0 && (
                            <div className="text-xs text-blue-600">{product.soldQuantityKg} kg sold</div>
                          )}
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
                          {formatDate(product.harvestDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/products/edit/${product.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.vegetableName)}
                              disabled={deletingId === product.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === product.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant="danger"
        confirmLabel="Delete"
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />
    </RoleProtectedRoute>
  );
}
