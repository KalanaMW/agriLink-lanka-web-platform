'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="bg-green-700/90 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3">
                        <img 
                            src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761895483/d5513655-e2aa-4582-8bf8-5c3c196fa828_vnk5cq.png" 
                            alt="AgriLink Lanka Logo" 
                            className="h-10 w-10 object-contain"
                        />
                        <span className="text-xl font-bold">AgriLink Lanka</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="hover:text-green-200 transition font-medium">Home</Link>
                        <Link href="/products" className="hover:text-green-200 transition font-medium">Products</Link>
                        <Link href="/about" className="hover:text-green-200 transition font-medium">About</Link>
                        {isAuthenticated && (
                            <Link href="/dashboard" className="hover:text-green-200 transition font-medium">Dashboard</Link>
                        )}
                    </div>

                    {/* AUTH Section */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated && user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-3">
                                    <div className="text-right">
                                        <p className="font-semibold">{user.fullName}</p>
                                        <p className="text-xs text-green-200">{user.role}</p>
                                    </div>
                                    {user.profileImageUrl && (
                                        <img 
                                            src={user.profileImageUrl} 
                                            alt={user.fullName}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                        />
                                    )}
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition font-semibold"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition font-semibold">Login</Link>
                                <Link href="/register" className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}