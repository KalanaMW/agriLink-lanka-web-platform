'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { Product, ProductFilter } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getImageUrl } from '@/lib/utils';
import { PageTransition } from '@/components/animations/PageTransition';
import { Search, MapPin, Package, User, CheckCircle, Leaf, Filter, Store, ChevronLeft, ChevronRight } from 'lucide-react';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const GRADES = ['A', 'B', 'C'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalCount: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState<ProductFilter>({
    pageNumber: 1,
    pageSize: 12,
    sortBy: 'DateDesc',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await productService.getProducts(filters);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err: any) {
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
      pageNumber: 1, // Reset to first page when filters change
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({
      ...filters,
      pageNumber: page,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 12,
      sortBy: 'DateDesc',
    });
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div 
          className="min-h-screen py-10 relative"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/PRODUCTS_BG_kxprpt.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Optional overlay to soften background */}
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-white/50">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <Store className="w-10 h-10 text-green-600" /> Available Products
                </h1>
                <p className="mt-2 text-lg text-gray-800 font-medium">
                  Browse fresh vegetables from verified farmers across Sri Lanka
                </p>
              </div>
            </div>

          {/* Filter Toggle Button (Mobile) */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6 sticky top-24">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-green-600" /> Filters
                  </h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search by Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search Product
                  </label>
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g., Tomato"
                      value={filters.vegetableName || ''}
                      onChange={(e) => handleFilterChange('vegetableName', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                  >
                    <option value="">All Districts</option>
                    {DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    value={filters.grade || ''}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                  >
                    <option value="">All Grades</option>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Range (Rs/kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Quantity Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity (kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minQuantity || ''}
                      onChange={(e) => handleFilterChange('minQuantity', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxQuantity || ''}
                      onChange={(e) => handleFilterChange('maxQuantity', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isExportReady || false}
                      onChange={(e) => handleFilterChange('isExportReady', e.target.checked ? true : undefined)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Export Ready Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isOrganic || false}
                      onChange={(e) => handleFilterChange('isOrganic', e.target.checked ? true : undefined)}
                      className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Organic Only</span>
                  </label>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || 'DateDesc'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                  >
                    <option value="DateDesc">Newest First</option>
                    <option value="DateAsc">Oldest First</option>
                    <option value="PriceAsc">Price: Low to High</option>
                    <option value="PriceDesc">Price: High to Low</option>
                    <option value="QuantityDesc">Quantity: High to Low</option>
                    <option value="QuantityAsc">Quantity: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                      <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                      <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                        <div className="relative overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.vegetableName}
                              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 font-medium">No Image</span>
                            </div>
                          )}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                            Grade {product.grade}
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {product.vegetableName}
                            {product.variety && <span className="text-gray-500 font-normal"> - {product.variety}</span>}
                          </h3>
                          
                          <div className="text-2xl font-black text-green-600 mb-4">
                            Rs. {product.pricePerKg}<span className="text-sm font-medium text-gray-500">/kg</span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                            <p className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-gray-900">Available:</span> {product.availableQuantityKg} kg{(product.soldQuantityKg ?? 0) > 0 ? ` (${product.soldQuantityKg} kg sold)` : ''}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-gray-900">District:</span> {product.district}
                            </p>
                            <p className="flex items-center gap-2">
                              <User className="w-4 h-4 text-orange-500" />
                              <span className="font-medium text-gray-900">Farmer:</span> {product.farmerName}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {product.isExportReady && (
                              <span className="flex items-center text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Export Ready
                              </span>
                            )}
                            {product.isOrganic && (
                              <span className="flex items-center text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                                <Leaf className="w-3.5 h-3.5 mr-1.5" />
                                Organic
                              </span>
                            )}
                          </div>

                          <Link href={`/products/${product.id}`} className="block w-full bg-gray-50 border border-gray-200 text-gray-900 py-3 rounded-xl hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors font-bold text-center">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-gray-50 shadow-sm transition"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      
                      <span className="text-gray-700 font-medium px-4">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white bg-gray-50 shadow-sm transition"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
