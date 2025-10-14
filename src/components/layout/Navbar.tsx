export default function Navbar() {
    return (
        <nav className ="bg-green-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">

                    {/* Logo Section */}
                    <div className="flex items-center">
                        <span className="text-xl font-bold">🌱 AgriLink Lanka</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <a href="/" className="hover:text-green-200 transition">Home</a>
                        <a href="/" className="hover:text-green-200 transition">Products</a>
                        <a href="/about" className="hover:text-green-200 transition">About</a>
                    </div>

                    {/* AUTH Buttons */}
                    <div className="flex space-x-4">
                        <a href="/login" className="bg-green-500 px-4 py-2 rounded hover:bg-green-400 transition">Login</a>
                        <a href="/register" className="bg-white text-green-600 px-4 py-2 rounded hover:bg-gray-100 transition">Register</a>
                    </div>
                </div>
            </div>
        </nav>
    )
}