export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img 
                                src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761895483/d5513655-e2aa-4582-8bf8-5c3c196fa828_vnk5cq.png" 
                                alt="AgriLink Lanka Logo" 
                                className="h-8 w-8 object-contain"
                            />
                            <h3 className="text-lg font-bold">AgriLink Lanka</h3>
                        </div>
                        <p>Connecting Sri Lankan farmers with global exporters.</p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="/" className="hover:text-green-300">Home</a></li>
                            <li><a href="/products" className="hover:text-green-300">Products</a></li>
                            <li><a href="/contact" className="hover:text-green-300">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <p>Email: agrilinklanka@gmail.com</p>
                        <p>Phone: +94 70 201 8278</p>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-4 text-center">
                    <p>2024 AgriLink Lanka. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}