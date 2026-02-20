'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {isAuthenticated
              ? `Your account role (${user?.role}) does not have permission to access this page.`
              : 'You need to be logged in to access this page.'}
          </p>
          <div className="space-y-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Login
              </Link>
            )}
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
