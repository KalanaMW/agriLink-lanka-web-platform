'use client'
import Link from 'next/link'
import { useState } from 'react'
//Mac,Dev
export default function Register() {
  const [role, setRole] = useState('')
  const [doc, setDoc] = useState<File | null>(null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">Create an Account</h2>
          <p className="text-gray-500">Register as Farmer, Exporter, or Admin</p>
        </div>
        <form className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input type="text" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <select
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-black bg-green-50"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="" className="text-gray-400">Select role</option>
              <option value="farmer" className="text-black">Farmer</option>
              <option value="exporter" className="text-black">Exporter</option>
              <option value="admin" className="text-black">Admin</option>
            </select>
          </div>
          {role === 'farmer' && (
            <div>
              <label className="block text-gray-700 mb-1">Upload Farmer ID or Proof</label>
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
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 transition font-semibold"
          >
            Register
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