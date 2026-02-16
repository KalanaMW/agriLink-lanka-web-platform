'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productService } from '@/services/productService';
import { Product } from '@/types';
import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const grades = ['A', 'B', 'Premium', 'Standard'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    vegetableName: '',
    variety: '',
    grade: '',
    pricePerKg: '',
    availableQuantityKg: '',
    harvestDate: '',
    district: '',
    description: '',
    isExportReady: false,
    isOrganic: false,
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);
  const [newCertificationDoc, setNewCertificationDoc] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProduct(Number(productId));
        setProduct(data);
        setFormData({
          vegetableName: data.vegetableName,
          variety: data.variety || '',
          grade: data.grade,
          pricePerKg: data.pricePerKg.toString(),
          availableQuantityKg: data.availableQuantityKg.toString(),
          harvestDate: new Date(data.harvestDate).toISOString().split('T')[0],
          district: data.district,
          description: data.description || '',
          isExportReady: data.isExportReady,
          isOrganic: data.isOrganic,
        });
      } catch (error) {
        console.error('Failed to fetch product:', error);
        alert('Failed to load product. Redirecting...');
        router.push('/dashboard/farmer');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vegetableName.trim()) newErrors.vegetableName = 'Vegetable name is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.pricePerKg || Number(formData.pricePerKg) <= 0) newErrors.pricePerKg = 'Valid price is required';
    if (!formData.availableQuantityKg || Number(formData.availableQuantityKg) <= 0) newErrors.availableQuantityKg = 'Valid quantity is required';
    if (!formData.harvestDate) newErrors.harvestDate = 'Harvest date is required';
    if (!formData.district) newErrors.district = 'District is required';

    if (newProductImage && newProductImage.size > 5 * 1024 * 1024) {
      newErrors.productImage = 'Image must be less than 5MB';
    }
    if (newCertificationDoc && newCertificationDoc.size > 5 * 1024 * 1024) {
      newErrors.certificationDocument = 'Document must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('vegetableName', formData.vegetableName);
      submitData.append('variety', formData.variety);
      submitData.append('grade', formData.grade);
      submitData.append('pricePerKg', formData.pricePerKg);
      submitData.append('availableQuantityKg', formData.availableQuantityKg);
      submitData.append('harvestDate', formData.harvestDate);
      submitData.append('district', formData.district);
      submitData.append('description', formData.description);
      submitData.append('isExportReady', formData.isExportReady.toString());
      submitData.append('isOrganic', formData.isOrganic.toString());

      if (newProductImage) {
        submitData.append('productImage', newProductImage);
      }
      if (newCertificationDoc) {
        submitData.append('certificationDocument', newCertificationDoc);
      }

      await productService.updateProduct(Number(productId), submitData);
      alert('Product updated successfully!');
      router.push('/dashboard/farmer');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <RoleProtectedRoute allowedRoles={['Farmer']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={['Farmer']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vegetable Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vegetable Name *
                </label>
                <input
                  type="text"
                  value={formData.vegetableName}
                  onChange={(e) => setFormData({ ...formData, vegetableName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Tomato, Carrot"
                />
                {errors.vegetableName && <p className="mt-1 text-sm text-red-600">{errors.vegetableName}</p>}
              </div>

              {/* Variety */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variety (Optional)
                </label>
                <input
                  type="text"
                  value={formData.variety}
                  onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Cherry Tomato"
                />
              </div>

              {/* Grade and District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                  {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Kg (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {errors.pricePerKg && <p className="mt-1 text-sm text-red-600">{errors.pricePerKg}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity (Kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.availableQuantityKg}
                    onChange={(e) => setFormData({ ...formData, availableQuantityKg: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {errors.availableQuantityKg && <p className="mt-1 text-sm text-red-600">{errors.availableQuantityKg}</p>}
                </div>
              </div>

              {/* Harvest Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.harvestDate && <p className="mt-1 text-sm text-red-600">{errors.harvestDate}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional details about your product..."
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image {product?.imageUrl && '(Leave empty to keep current)'}
                </label>
                {product?.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={`http://localhost:5189${product.imageUrl}`}
                      alt="Current"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setNewProductImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">Max 5MB - JPEG, PNG, or WebP</p>
                {errors.productImage && <p className="mt-1 text-sm text-red-600">{errors.productImage}</p>}
              </div>

              {/* Certification Document */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Document {product?.certificationUrl && '(Leave empty to keep current)'}
                </label>
                {product?.certificationUrl && (
                  <div className="mb-2">
                    <a href={`http://localhost:5189${product.certificationUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      View current document
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setNewCertificationDoc(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">Max 5MB - JPEG, PNG, WebP, or PDF</p>
                {errors.certificationDocument && <p className="mt-1 text-sm text-red-600">{errors.certificationDocument}</p>}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isExportReady}
                    onChange={(e) => setFormData({ ...formData, isExportReady: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Export Ready</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isOrganic}
                    onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
