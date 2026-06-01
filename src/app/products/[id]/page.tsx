'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { productService } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getImageUrl, formatCurrency, formatDate } from '@/lib/utils';
import { PageTransition } from '@/components/animations/PageTransition';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const id = Number(params.id);
        if (isNaN(id)) { setError('Invalid product ID'); return; }
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch {
        setError('Product not found or you do not have access.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !product) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 text-lg">{error || 'Product not found'}</p>
          <button onClick={() => router.back()} className="text-green-600 hover:underline">Go Back</button>
        </div>
      </ProtectedRoute>
    );
  }

  const statusColor: Record<string, string> = {
    Available: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Sold: 'bg-blue-100 text-blue-800',
    OutOfStock: 'bg-red-100 text-red-800',
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-5xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-gray-500">
              <button onClick={() => router.push('/products')} className="hover:text-green-600">Products</button>
              <span className="mx-2">/</span>
              <span className="text-gray-800">{product.vegetableName}</span>
            </nav>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative bg-gray-100 min-h-[300px] md:min-h-[400px]">
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.vegetableName}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[product.status] || 'bg-gray-100 text-gray-800'}`}>
                      {product.status}
                    </span>
                    {product.isOrganic && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Organic</span>
                    )}
                    {product.isExportReady && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">Export Ready</span>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h1 className="text-3xl font-bold text-gray-900">{product.vegetableName}</h1>
                  {product.variety && <p className="text-gray-500 mt-1">Variety: {product.variety}</p>}

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-700">{formatCurrency(product.pricePerKg)}</span>
                    <span className="text-gray-500">/ kg</span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-800">{product.grade}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Available</p>
                      <p className="font-semibold text-gray-800">{product.availableQuantityKg} kg</p>
                      {(product.soldQuantityKg ?? 0) > 0 && (
                        <p className="text-xs text-blue-600 mt-1">{product.soldQuantityKg} kg sold</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">Harvest Date</p>
                      <p className="font-semibold text-gray-800">{formatDate(product.harvestDate)}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-500">District</p>
                      <p className="font-semibold text-gray-800">{product.district}</p>
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  {(product.totalQuantityKg ?? 0) > 0 && (product.soldQuantityKg ?? 0) > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{product.soldQuantityKg} kg sold</span>
                        <span>{product.totalQuantityKg} kg total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, ((product.soldQuantityKg || 0) / (product.totalQuantityKg || 1)) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{product.availableQuantityKg} kg remaining</p>
                    </div>
                  )}

                  {product.description && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {product.certificationUrl && (
                    <div className="mt-4">
                      <a
                        href={getImageUrl(product.certificationUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Certification Document
                      </a>
                    </div>
                  )}

                  {/* Farmer Info */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-700 mb-2">Farmer Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Name:</span> <span className="font-medium">{product.farmerName}</span></p>
                      <p><span className="text-gray-500">Email:</span> <span className="font-medium">{product.farmerEmail}</span></p>
                      {product.farmerPhone && (
                        <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{product.farmerPhone}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-3 flex-wrap">
                    {user?.role === 'Exporter' && product.status === 'Available' && (
                      <button
                        onClick={() => router.push(`/orders?productId=${product.id}&productName=${encodeURIComponent(product.vegetableName)}&pricePerKg=${product.pricePerKg}&maxQty=${product.availableQuantityKg}`)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex-1"
                      >
                        Place Order
                      </button>
                    )}
                    {user?.role === 'Farmer' && product.farmerId === user.id && (
                      <button
                        onClick={() => router.push(`/products/edit/${product.id}`)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex-1"
                      >
                        Edit Product
                      </button>
                    )}
                    <button
                      onClick={() => router.back()}
                      className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                      Back
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Listed on {formatDate(product.createdAt)} &middot; Last updated {formatDate(product.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
