'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/utils';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 backdrop-blur-md text-white shadow-lg sticky top-0 z-50">
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

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="hover:text-green-200 transition font-medium">Home</Link>
                        <Link href="/products" className="hover:text-green-200 transition font-medium">Products</Link>
                        <Link href="/about" className="hover:text-green-200 transition font-medium">About</Link>
                        {isAuthenticated && (
                            <>
                                <Link href="/dashboard" className="hover:text-green-200 transition font-medium">Dashboard</Link>
                                <Link href="/orders" className="hover:text-green-200 transition font-medium">Orders</Link>
                                <Link href="/analytics" className="hover:text-green-200 transition font-medium">Analytics</Link>
                            </>
                        )}
                    </div>

                    {/* Desktop AUTH Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated && user ? (
                            <>
                                <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition">
                                    <div className="text-right">
                                        <p className="font-semibold">{user.fullName}</p>
                                        <p className="text-xs text-green-200">{user.role}</p>
                                    </div>
                                    {user.profileImageUrl ? (
                                        <img 
                                            src={getImageUrl(user.profileImageUrl)} 
                                            alt={user.fullName}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-sm font-bold">
                                            {user.fullName.charAt(0)}
                                        </div>
                                    )}
                                </Link>
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

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-green-600 transition"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-green-600">
                    <div className="px-4 py-4 space-y-3">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Home</Link>
                        <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Products</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">About</Link>
                        {isAuthenticated && (
                            <>
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Dashboard</Link>
                                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Orders</Link>
                                <Link href="/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Analytics</Link>
                                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-200 transition font-medium">Profile</Link>
                            </>
                        )}
                        <div className="pt-3 border-t border-green-600">
                            {isAuthenticated && user ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {user.profileImageUrl ? (
                                            <img src={getImageUrl(user.profileImageUrl)} alt={user.fullName} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-xs font-bold">
                                                {user.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-sm">{user.fullName}</p>
                                            <p className="text-xs text-green-200">{user.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition font-semibold text-center"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition font-semibold text-center">Login</Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold text-center">Register</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}