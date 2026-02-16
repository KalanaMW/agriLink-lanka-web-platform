'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { getImageUrl, formatCurrency, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/animations/PageTransition';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [all, pending] = await Promise.all([
        productService.getProducts({}),
        productService.getPendingProducts()
      ]);
      setAllProducts(Array.isArray(all) ? all : (all.products || []));
      setPendingProducts(pending);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this product?')) return;
    
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
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject and delete this product?')) return;
    
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
  };

  const availableProducts = allProducts?.filter(p => p.status === 'Available') || [];

  return (
    <RoleProtectedRoute allowedRoles={['Admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user?.fullName}!</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Products</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{allProducts?.length || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Pending Approval</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{pendingProducts?.length || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Available</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{availableProducts.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-500">Total Stock</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {allProducts?.reduce((sum, p) => sum + p.availableQuantityKg, 0) || 0} kg
              </div>
            </div>
          </div>

          {/* Pending Approvals Section */}
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
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
    </RoleProtectedRoute>
  );
}
