export default function Home() {
  return (
    <div
      className="relative"
      style={{
        backgroundImage:
          "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1759843388/maxresdefault_hcmyfs.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Single Section with shared overlay and background */}
      <section className="relative py-16 md:py-20">
        <div className="absolute inset-0 bg-white/0 backdrop-blur-[0px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          {/* Hero block */}
          <div className="min-h-[50vh] flex items-center">
            <div className="max-w-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-8">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
                Powering Fair Trade in Sri Lankan Agriculture
              </h1>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                Connect directly with verified partners. Farmers gain transparency and better prices;
                exporters secure consistent, quality supply.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                  Get Started
                </a>
                <a href="/about" className="bg-white text-green-700 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition font-semibold">
                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Features block */}
          <div className="py-12 md:py-16 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white-900">How It Works</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.02]">
                <div className="text-4xl mb-3">👨‍🌾</div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Farmers List Products</h3>
                <p className="text-gray-700">Publish vegetable listings with grade, volume, pricing, and photos.</p>
              </div>

              {/* Card 2 */}
              <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.02]">
                <div className="text-4xl mb-3">🌍</div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Exporters Browse & Order</h3>
                <p className="text-gray-700">Search, filter, and confirm orders with transparent pricing and availability.</p>
              </div>

              {/* Card 3 */}
              <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.02]">
                <div className="text-4xl mb-3">💳</div>
                <h3 className="text-xl font-semibold text-green-700 mb-2">Secure Payments</h3>
                <p className="text-gray-700">Stripe-powered checkout and automated notifications for confidence and speed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}