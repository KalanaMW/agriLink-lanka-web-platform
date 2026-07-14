'use client';

import { useAuth } from '@/contexts/AuthContext';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { dashboardService } from '@/services/dashboardService';
import { Product, ExporterDashboard as ExporterDashboardType } from '@/types';
import { getImageUrl, formatCurrency, formatDate } from '@/lib/utils';
import { Ship, Leaf, ClipboardList, CheckCircle2, Wallet, Search, Filter, MapPin, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExporterDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ExporterDashboardType | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    district: '',
    isOrganic: false,
    isExportReady: false,
    searchTerm: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, dashboard] = await Promise.all([
          productService.getProducts({ status: 'Available' }),
          dashboardService.getExporterDashboard().catch(() => null),
        ]);
        const productList = Array.isArray(productData) ? productData : (productData.products || []);
        setProducts(productList);
        setFilteredProducts(productList);
        setDashboardData(dashboard);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (filters.district) {
      filtered = filtered.filter(p => p.district === filters.district);
    }
    if (filters.isOrganic) {
      filtered = filtered.filter(p => p.isOrganic);
    }
    if (filters.isExportReady) {
      filtered = filtered.filter(p => p.isExportReady);
    }
    if (filters.searchTerm) {
      filtered = filtered.filter(p => 
        p.vegetableName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (p.variety && p.variety.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [filters, products]);

  const availableProducts = products.filter(p => p.status === 'Available');
  const exportReadyProducts = products.filter(p => p.isExportReady);
  const organicProducts = products.filter(p => p.isOrganic);
  const districts = [...new Set(products.map(p => p.district))].sort();

  return (
    <RoleProtectedRoute allowedRoles={['Exporter']}>
      <div 
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
          <div className="mb-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3"><Ship className="w-8 h-8 text-blue-600" /> Exporter Dashboard</h1>
            <p className="mt-2 text-gray-800 font-medium">Welcome back, {user?.fullName}!</p>
            {!user?.isVerified && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-600 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Account Pending Verification</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your exporter account is pending admin approval. You'll be able to place orders once verified.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Available Products</div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">{dashboardData?.availableProducts ?? availableProducts.length}</div>
                  <div className="text-xs text-gray-400 mt-2">{exportReadyProducts.length} export ready</div>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">My Orders</div>
                  <div className="mt-2 text-3xl font-bold text-blue-600">{dashboardData?.totalOrders ?? 0}</div>
                  <div className="text-xs text-gray-400 mt-2">{dashboardData?.pendingOrders ?? 0} pending</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Completed Orders</div>
                  <div className="mt-2 text-3xl font-bold text-green-600">{dashboardData?.completedOrders ?? 0}</div>
                  <div className="text-xs text-gray-400 mt-2">delivered successfully</div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Total Spent</div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData?.totalSpent ?? 0)}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">on delivered orders</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Filter className="w-5 h-5 text-gray-400" /> Filter Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  placeholder="Search vegetables..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                >
                  <option value="">All Districts</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    checked={filters.isOrganic}
                    onChange={(e) => setFilters({ ...filters, isOrganic: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic Only</span>
                </label>
              </div>
              <div>
                <label className="flex items-center mt-8">
                  <input
                    type="checkbox"
                    checked={filters.isExportReady}
                    onChange={(e) => setFilters({ ...filters, isExportReady: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Export Ready Only</span>
                </label>
              </div>
            </div>
            {(filters.searchTerm || filters.district || filters.isOrganic || filters.isExportReady) && (
              <button
                onClick={() => setFilters({ district: '', isOrganic: false, isExportReady: false, searchTerm: '' })}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Products ({filteredProducts.length})
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <p className="text-lg">No products found</p>
                <p className="text-sm mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.vegetableName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-product.svg';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {product.isOrganic && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Organic
                          </span>
                        )}
                        {product.isExportReady && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Export Ready
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900">{product.vegetableName}</h3>
                      {product.variety && (
                        <div className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                          <MapPin className="w-4 h-4 text-gray-400" /> {product.district}
                        </div>
                      )}
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Grade:</span>
                          <span className="font-medium">{product.grade}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium text-green-600">{formatCurrency(product.pricePerKg)}/kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium">{product.availableQuantityKg} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{product.district}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Farmer:</span>
                          <span className="font-medium">{product.farmerName}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.vegetableName}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getImageUrl(selectedProduct.imageUrl)}
                      alt={selectedProduct.vegetableName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.svg';
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedProduct.variety && (
                    <div>
                      <span className="text-sm text-gray-600">Variety:</span>
                      <p className="font-medium">{selectedProduct.variety}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm text-gray-600">Grade:</span>
                    <p className="font-medium">{selectedProduct.grade}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Price per Kg:</span>
                    <p className="font-medium text-2xl text-green-600">{formatCurrency(selectedProduct.pricePerKg)}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Available Quantity:</span>
                    <p className="font-medium text-lg">{selectedProduct.availableQuantityKg} kg</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">District:</span>
                    <p className="font-medium">{selectedProduct.district}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Harvest Date:</span>
                    <p className="font-medium">{formatDate(selectedProduct.harvestDate)}</p>
                  </div>

                  <div className="flex gap-2">
                    {selectedProduct.isOrganic && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        ✓ Organic
                      </span>
                    )}
                    {selectedProduct.isExportReady && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        ✓ Export Ready
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="mt-4">
                  <span className="text-sm text-gray-600">Description:</span>
                  <p className="text-gray-700 mt-1">{selectedProduct.description}</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Farmer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedProduct.farmerName}</span></p>
                  <p><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedProduct.farmerEmail}</span></p>
                  <p><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedProduct.farmerPhone}</span></p>
                </div>
              </div>

              {selectedProduct.certificationUrl && (
                <div className="mt-4">
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

              <button
                onClick={() => {
                  if (user?.isVerified) {
                    router.push(`/orders?productId=${selectedProduct.id}&maxQty=${selectedProduct.availableQuantityKg}`);
                  } else {
                    alert('Please wait for your account to be verified by an admin.');
                  }
                }}
                disabled={!user?.isVerified}
                className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user?.isVerified ? 'Place Order' : 'Account Verification Required'}
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleProtectedRoute>
  );
}
