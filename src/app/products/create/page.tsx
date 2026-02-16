'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { productService } from '@/services/productService';

const districts = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const grades = ['A', 'B', 'C'];

export default function CreateProduct() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    vegetableName: '',
    variety: '',
    grade: 'A',
    pricePerKg: '',
    availableQuantityKg: '',
    harvestDate: '',
    district: user?.district || '',
    description: '',
    isExportReady: false,
    isOrganic: false,
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [certificationDocument, setCertificationDocument] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError('');
    setSuccess('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        return;
      }
      setProductImage(file);
      setError('');
    }
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      setCertificationDocument(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.vegetableName || !formData.pricePerKg || !formData.availableQuantityKg || !formData.harvestDate) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Create FormData for multipart upload
      const data = new FormData();
      data.append('vegetableName', formData.vegetableName);
      if (formData.variety) data.append('variety', formData.variety);
      data.append('grade', formData.grade);
      data.append('pricePerKg', formData.pricePerKg);
      data.append('availableQuantityKg', formData.availableQuantityKg);
      data.append('harvestDate', formData.harvestDate);
      data.append('district', formData.district);
      if (formData.description) data.append('description', formData.description);
      data.append('isExportReady', formData.isExportReady.toString());
      data.append('isOrganic', formData.isOrganic.toString());
      
      if (productImage) data.append('productImage', productImage);
      if (certificationDocument) data.append('certificationDocument', certificationDocument);

      await productService.createProduct(data);
      
      setSuccess('Product created successfully! Waiting for admin approval...');
      
      // Redirect to farmer dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/farmer');
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create product';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard/farmer')}
              className="flex items-center text-green-600 hover:text-green-700 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-2 text-gray-600">List your vegetables for export</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vegetable Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="vegetableName"
                      value={formData.vegetableName}
                      onChange={handleChange}
                      placeholder="e.g., Tomato, Carrot, Cabbage"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variety (Optional)
                    </label>
                    <input
                      type="text"
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      placeholder="e.g., Cherry, Roma, Beefsteak"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                      <p className="font-semibold text-blue-900 mb-2">Grade Guidelines:</p>
                      <ul className="space-y-1 text-blue-800">
                        <li><strong>Grade A:</strong> Premium quality - uniform size, no defects, perfect appearance</li>
                        <li><strong>Grade B:</strong> Good quality - slight size variations, minor blemishes allowed</li>
                        <li><strong>Grade C:</strong> Standard quality - mixed sizes, cosmetic defects acceptable</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Quantity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Quantity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per KG (LKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity (KG) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="availableQuantityKg"
                      value={formData.availableQuantityKg}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harvest Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="harvestDate"
                      value={formData.harvestDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your product, growing conditions, special features..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOrganic"
                      checked={formData.isOrganic}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Organic Certified
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isExportReady"
                      checked={formData.isExportReady}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Export Ready (meets export standards)
                    </label>
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images & Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max size: 5MB. Formats: JPEG, PNG, WebP</p>
                    {productImage && (
                      <p className="mt-2 text-sm text-green-600">✓ {productImage.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certification Document (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleCertificationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-500">Max size: 5MB. Formats: PDF, JPEG, PNG</p>
                    {certificationDocument && (
                      <p className="mt-2 text-sm text-green-600">✓ {certificationDocument.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Product...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/farmer')}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                >
                  Cancel
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Your product will be reviewed by an admin before being listed on the marketplace.
              </p>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
