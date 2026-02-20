'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageTransition } from '@/components/animations/PageTransition';
import { getImageUrl } from '@/lib/utils';
import { User } from '@/types';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName);
      setDistrict(data.district || '');
      setAddress(data.address || '');
      setPhoneNumber(data.phoneNumber || '');
      setCompanyName(data.companyName || '');
    } catch {
      setMessage({ type: 'error', text: 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB.' });
      return;
    }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Full name is required' });
      return;
    }

    if (phoneNumber && !/^[\d\s+\-()]+$/.test(phoneNumber)) {
      setMessage({ type: 'error', text: 'Phone number can only contain digits, spaces, +, -, (, )' });
      return;
    }

    setSaving(true);

    try {
      const data: Record<string, any> = {};
      if (fullName.trim() !== profile?.fullName) data.fullName = fullName.trim();
      if (district !== (profile?.district || '')) data.district = district;
      if (address.trim() !== (profile?.address || '')) data.address = address.trim();
      if (phoneNumber.trim() !== (profile?.phoneNumber || '')) data.phoneNumber = phoneNumber.trim();
      if (profile?.role === 'Exporter' && companyName.trim() !== (profile?.companyName || '')) data.companyName = companyName.trim();
      if (profileImage) data.profileImage = profileImage;

      await userService.updateProfile(data);
      const updated = await userService.getProfile();
      setProfile(updated);
      updateUser(updated);
      setProfileImage(null);
      setImagePreview(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await userService.changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                  activeTab === 'profile' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile Details
              </button>
              <button
                onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
                className={`px-6 py-3 font-semibold text-sm border-b-2 transition ${
                  activeTab === 'password' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`mb-6 px-4 py-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {activeTab === 'profile' ? (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <img
                      src={imagePreview || getImageUrl(profile?.profileImageUrl)}
                      alt={profile?.fullName}
                      className="w-28 h-28 rounded-full object-cover border-4 border-green-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.svg'; }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Click camera to change photo</p>
                  <span className="mt-1 inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {profile?.role}
                  </span>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text" value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={profile?.email || ''} disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                    <select value={district} onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                      maxLength={500}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07X XXXX XXX"
                      maxLength={20}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                  </div>

                  {profile?.role === 'Exporter' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        maxLength={200}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      />
                    </div>
                  )}

                  <button type="submit" disabled={saving}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      required minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                      required minLength={6}
                    />
                  </div>
                  <button type="submit" disabled={saving}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
