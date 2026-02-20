import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-b from-gray-800 to-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img 
                                src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761895483/d5513655-e2aa-4582-8bf8-5c3c196fa828_vnk5cq.png" 
                                alt="AgriLink Lanka Logo" 
                                className="h-9 w-9 object-contain"
                            />
                            <h3 className="text-xl font-bold tracking-tight">AgriLink Lanka</h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Connecting Sri Lankan farmers with global exporters, building a transparent, 
                            efficient agricultural marketplace.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-green-400 uppercase text-sm tracking-wider">Quick Links</h4>
                        <ul className="space-y-2.5">
                            <li><Link href="/" className="text-gray-300 hover:text-green-300 transition">Home</Link></li>
                            <li><Link href="/products" className="text-gray-300 hover:text-green-300 transition">Products</Link></li>
                            <li><Link href="/about" className="text-gray-300 hover:text-green-300 transition">About</Link></li>
                            <li><Link href="/contact" className="text-gray-300 hover:text-green-300 transition">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4 text-green-400 uppercase text-sm tracking-wider">Contact</h4>
                        <div className="space-y-2.5 text-gray-300">
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                agrilinklanka@gmail.com
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +94 70 201 8278
                            </p>
                            <p className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Sri Lanka
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700/50 mt-10 pt-6 text-center">
                    <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} AgriLink Lanka. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}