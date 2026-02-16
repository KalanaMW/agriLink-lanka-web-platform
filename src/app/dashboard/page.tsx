'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect to role-specific dashboard
      switch (user.role) {
        case 'Farmer':
          router.push('/dashboard/farmer');
          break;
        case 'Exporter':
          router.push('/dashboard/exporter');
          break;
        case 'Admin':
          router.push('/dashboard/admin');
          break;
        default:
          router.push('/');
      }
    }
  }, [user, isLoading, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    </ProtectedRoute>
  );
}
