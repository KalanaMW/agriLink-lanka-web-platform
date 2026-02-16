'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/animations/PageTransition';

export default function Home() {
  return (
    <div
      className="relative"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1761896170/upscaled_1920x1080_1_vzupie.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Single Section with shared overlay and background */}
      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          
          {/* Hero block */}
          <div className="min-h-[60vh] flex items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl bg-white/75 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-10"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3 mb-4"
              >
                <img 
                  src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761895483/d5513655-e2aa-4582-8bf8-5c3c196fa828_vnk5cq.png" 
                  alt="AgriLink Lanka Logo" 
                  className="h-16 w-16 object-contain"
                />
                <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                  AgriLink Lanka
                </h1>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl md:text-3xl font-semibold text-green-700 mb-4"
              >
                Connecting Sri Lankan Farmers with Global Exporters
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-base md:text-lg text-gray-800 mb-6 leading-relaxed"
              >
                Empowering farmers to reach reliable export markets while enabling exporters from companies like Keells, Cargills, and Arpico to source verified, quality-assured crops efficiently. Our platform eliminates intermediaries, ensures fair trade, and promotes transparency in Sri Lanka's agricultural supply chain.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/register" 
                  className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition font-semibold shadow-lg"
                >
                  Get Started
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/about" 
                  className="bg-white text-green-700 border-2 border-green-700 px-6 py-3 rounded-lg hover:bg-green-50 transition font-semibold shadow-lg"
                >
                  Learn More
                </motion.a>
              </motion.div>
            </motion.div>
          </div>

          {/* Problem Statement Section */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="py-12 md:py-16"
          >
            <div className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-10 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-6">The Challenge We Solve</h2>
              <p className="text-gray-800 text-lg leading-relaxed text-center max-w-4xl mx-auto mb-6">
                Sri Lankan farmers face barriers in reaching export markets, suffering from exploitation by intermediaries, low profit margins, and post-harvest losses. Export agents struggle to access verified suppliers transparently. 
              </p>
              <p className="text-gray-800 text-lg leading-relaxed text-center max-w-4xl mx-auto font-semibold">
                AgriLink Lanka bridges this gap with a modern platform that ensures fair trade, reduces wastage, and creates a sustainable agricultural export ecosystem.
              </p>
            </div>
          </motion.div>

          {/* Key Benefits for Users */}
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="py-12 md:py-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg mb-12"
            >
              Why Choose AgriLink Lanka?
            </motion.h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* For Farmers */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8"
              >
                <div className="text-5xl mb-4 text-center">👨‍🌾</div>
                <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">For Farmers</h3>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span><strong>Direct Market Access:</strong> List your products directly to verified exporters without intermediaries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span><strong>Fair Pricing:</strong> Set your own prices and maximize your profit margins</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span><strong>Secure Payments:</strong> Receive payments instantly through our integrated payment system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span><strong>Transparency:</strong> Track orders and communicate directly with buyers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">✓</span>
                    <span><strong>No Scale Restrictions:</strong> Whether small or large-scale, all farmers are welcome</span>
                  </li>
                </ul>
              </motion.div>

              {/* For Exporters */}
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8"
              >
                <div className="text-5xl mb-4 text-center">🌍</div>
                <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">For Exporters</h3>
                <ul className="space-y-3 text-gray-800">
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">✓</span>
                    <span><strong>Quality Assurance:</strong> Access verified, quality-assured suppliers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">✓</span>
                    <span><strong>Efficient Sourcing:</strong> Search by district, grade, variety, and export-ready status</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">✓</span>
                    <span><strong>Real-Time Availability:</strong> See current stock levels and place orders instantly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">✓</span>
                    <span><strong>Reduced Costs:</strong> Eliminate middlemen and reduce procurement costs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 font-bold mr-2">✓</span>
                    <span><strong>Reliable Supply:</strong> Direct connection ensures consistent quality and timely delivery</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* How It Works */}
          <div className="py-12 md:py-16 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative group p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-[1.03] duration-300">
                <div className="absolute -top-4 -left-4 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">1</div>
                <div className="text-5xl mb-4 text-center">📝</div>
                <h3 className="text-xl font-bold text-green-800 mb-3 text-center">Register & List</h3>
                <p className="text-gray-800 leading-relaxed text-center">Farmers register and list their vegetables with details like variety, grade, pricing, photos, and export-ready certification. Admin verifies and approves exporters.</p>
              </div>

              {/* Step 2 */}
              <div className="relative group p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-[1.03] duration-300">
                <div className="absolute -top-4 -left-4 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">2</div>
                <div className="text-5xl mb-4 text-center">🔍</div>
                <h3 className="text-xl font-bold text-green-800 mb-3 text-center">Search & Order</h3>
                <p className="text-gray-800 leading-relaxed text-center">Exporters browse listings using advanced filters (district, grade, price, organic, export-ready), view farmer profiles, and place orders with full transparency.</p>
              </div>

              {/* Step 3 */}
              <div className="relative group p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 hover:scale-[1.03] duration-300">
                <div className="absolute -top-4 -left-4 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">3</div>
                <div className="text-5xl mb-4 text-center">💳</div>
                <h3 className="text-xl font-bold text-green-800 mb-3 text-center">Pay & Fulfill</h3>
                <p className="text-gray-800 leading-relaxed text-center">Secure payment processing via Stripe. Automated email notifications keep both parties updated on order status, payment confirmation, and shipment details.</p>
              </div>
            </div>
          </div>

          {/* Impact Section */}
          <div className="py-12 md:py-16">
            <div className="bg-gradient-to-br from-green-600 to-green-700 backdrop-blur-xl border border-green-500/40 shadow-2xl rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">Our Impact on Sri Lankan Agriculture</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">100%</div>
                  <p className="text-green-100 font-medium">Transparent Pricing</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">0</div>
                  <p className="text-green-100 font-medium">Intermediaries</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">⚡</div>
                  <p className="text-green-100 font-medium">Real-Time Payments</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">🤝</div>
                  <p className="text-green-100 font-medium">Fair Trade Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison with Traditional Methods */}
          <div className="py-12 md:py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg mb-8">Why We're Different</h2>
            <div className="bg-white/75 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 md:p-10">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-green-600">
                      <th className="py-3 px-4 text-green-800 font-bold">Feature</th>
                      <th className="py-3 px-4 text-green-800 font-bold">Traditional Exporters</th>
                      <th className="py-3 px-4 text-green-800 font-bold">AgriLink Lanka</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-800">
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">Farmer Access</td>
                      <td className="py-3 px-4">Limited to established partners only</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">Open registration for all farmers ✓</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">Pricing</td>
                      <td className="py-3 px-4">Company-set prices, no transparency</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">Transparent, farmer-set pricing ✓</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">Small Farmers</td>
                      <td className="py-3 px-4">Often excluded, bulk-only focus</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">All scales welcome ✓</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">Payments</td>
                      <td className="py-3 px-4">Manual invoicing, delayed bank transfers</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">Real-time secure payments ✓</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-semibold">Communication</td>
                      <td className="py-3 px-4">Phone calls, manual emails</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">Automated notifications ✓</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold">Platform</td>
                      <td className="py-3 px-4">Static websites or paper catalogs</td>
                      <td className="py-3 px-4 text-green-700 font-semibold">Modern digital marketplace ✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="py-12 md:py-16">
            <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">Ready to Transform Sri Lankan Agriculture?</h2>
              <p className="text-lg text-gray-800 mb-6 max-w-2xl mx-auto">
                Join AgriLink Lanka today and be part of the revolution in fair trade agricultural exports. Whether you're a farmer looking for better markets or an exporter seeking reliable suppliers, we're here to connect you.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="/register?role=farmer" className="bg-green-700 text-white px-8 py-4 rounded-lg hover:bg-green-800 transition font-semibold shadow-lg text-lg">
                  Register as Farmer
                </a>
                <a href="/register?role=exporter" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold shadow-lg text-lg">
                  Register as Exporter
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}