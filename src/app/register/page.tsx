'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { RegisterDto } from '@/types';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'Farmer' | 'Exporter' | '',
    district: '',
    address: '',
    phoneNumber: '',
    companyName: '',
  });
  const [doc, setDoc] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setError('Full name is required');
      return;
    }

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    if (formData.role === 'Exporter' && !formData.companyName?.trim()) {
      setError('Company name is required for exporters');
      return;
    }

    if (formData.phoneNumber && !/^[\d\s+\-()]+$/.test(formData.phoneNumber)) {
      setError('Phone number can only contain digits, spaces, +, -, (, )');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (doc && doc.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterDto = {
        fullName: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
        district: formData.district?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        companyName: formData.companyName?.trim() || undefined,
        farmerIdProof: doc || undefined,
      };

      await authService.register(registerData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">Create an Account</h2>
          <p className="text-gray-500">Register as Farmer or Exporter</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              name="role"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="" className="text-gray-400">Select role</option>
              <option value="Farmer" className="text-black">Farmer</option>
              <option value="Exporter" className="text-black">Exporter</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">District</label>
            <input 
              type="text" 
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="e.g., Colombo, Kandy, Galle"
              maxLength={50}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+94 XX XXX XXXX"
              maxLength={20}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
            />
          </div>

          {formData.role === 'Exporter' && (
            <div>
              <label className="block text-gray-700 mb-1">Company Name</label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                maxLength={200}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" 
              />
            </div>
          )}

          {formData.role === 'Farmer' && (
            <div>
              <label className="block text-gray-700 mb-1">Upload Farmer ID or Proof <span className="text-gray-400 text-sm">(Optional)</span></label>
              <div className="flex items-center space-x-4">
                <label htmlFor="farmer-doc-upload" className="bg-green-600 text-white px-4 py-1 rounded cursor-pointer hover:bg-green-500 transition font-semibold">
                  Choose File
                </label>
                <span className="text-black text-sm">
                  {doc ? doc.name : 'No file chosen'}
                </span>
                <input
                  id="farmer-doc-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => setDoc(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="text-green-700 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  )
}