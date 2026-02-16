'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link'

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear messages when user types
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await login(formData.email, formData.password);
            setSuccess('Login successful! Redirecting...');
            
            // Redirect based on role
            setTimeout(() => {
                const role = response.user.role;
                if (role === 'Admin') {
                    router.push('/dashboard/admin');
                } else if (role === 'Farmer') {
                    router.push('/dashboard/farmer');
                } else if (role === 'Exporter') {
                    router.push('/dashboard/exporter');
                } else {
                    router.push('/dashboard');
                }
            }, 1000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">

            <div>

                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome Back!</h2>
                <p className="mt-2 text-center text-sm text-gray-600"> Log in to manage your agricultural marketplace account. </p>

            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
                <div className="space-y-4">

                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder='Email Address'
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-black focus:outline-none"
                            required
                        />
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-black focus:outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Logging in...' : 'Log in'}
                </button>

            </form>

            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-500 font-medium">
                    Sign up
                </Link>
            </p>

            <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p className="font-medium mb-2">Test Credentials:</p>
                <p>Admin: admin@agrilink.lk / admin123</p>
                <p>Farmer: farmer@agrilink.lk / farmer123</p>
                <p>Exporter: exporter@keells.com / exporter123</p>
            </div>

        </div>
    </div>
    
    )
}