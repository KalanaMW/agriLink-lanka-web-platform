'use client'
import Link from 'next/link'

export default function Login() {
    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">

            <div>

                <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome Back!</h2>
                <p className="mt-2 text-center text-sm text-gray-600"> Log in to manage your agricultural marketplace account. </p>

            </div>

            <form className="mt-8 space-y-6">
                <div className="space-y-4">

                    <div>
                        <input
                            type="email"
                            placeholder='Email Address'
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-black focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder='Password'
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-black focus:outline-none"
                            required
                        />
                    </div>

                </div>

                <div className="flex justify-center">
                    <Link href="/forgot-password" className=" text-sm text-green-600 hover:text-green-500">forgot your password?</Link>
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition-colors">
                    Log in
                </button>

            </form>

            <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="text-green-600 hover:text-green-500 font-medium">
                    Sign up
                </Link>
            </p>

        </div>
    </div>
    
    )
}