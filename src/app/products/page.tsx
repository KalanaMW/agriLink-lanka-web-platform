'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { Product, ProductFilter } from '@/types';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getImageUrl } from '@/lib/utils';

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Available Products</h1>
            <p className="mt-2 text-lg text-gray-600">
              Browse fresh vegetables from verified farmers across Sri Lanka
            </p>
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
            <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6 sticky top-24">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Search by Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Product
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Tomato"
                    value={filters.vegetableName || ''}
                    onChange={(e) => handleFilterChange('vegetableName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  />
                </div>

                {/* District Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <select
                    value={filters.district || ''}
                    onChange={(e) => handleFilterChange('district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade
                  </label>
                  <select
                    value={filters.grade || ''}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (Rs/kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>
                </div>

                {/* Quantity Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (kg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minQuantity || ''}
                      onChange={(e) => handleFilterChange('minQuantity', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxQuantity || ''}
                      onChange={(e) => handleFilterChange('maxQuantity', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy || 'DateDesc'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
                      <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                        {product.imageUrl ? (
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.vegetableName}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {product.vegetableName}
                              {product.variety && ` - ${product.variety}`}
                            </h3>
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                              Grade {product.grade}
                            </span>
                          </div>
                          
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            Rs. {product.pricePerKg}/kg
                          </div>

                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <p>📦 Available: {product.availableQuantityKg} kg{(product.soldQuantityKg ?? 0) > 0 ? ` (${product.soldQuantityKg} kg sold)` : ''}</p>
                            <p>📍 District: {product.district}</p>
                            <p>👨‍🌾 {product.farmerName}</p>
                          </div>

                          <div className="flex gap-2 mb-3">
                            {product.isExportReady && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Export Ready
                              </span>
                            )}
                            {product.isOrganic && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Organic
                              </span>
                            )}
                          </div>

                          <Link href={`/products/${product.id}`} className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-center">
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
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <span className="text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
