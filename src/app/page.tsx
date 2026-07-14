'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, slideIn } from '@/components/animations/PageTransition';
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Truck, Users, Sprout, Globe, Search, Coins, Handshake } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen relative"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1761896170/upscaled_1920x1080_1_vzupie.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Global dark overlay. Adjust the 'bg-black/40' to 'bg-black/30' (lighter) or 'bg-black/50' (darker) to change the darkness level */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[90vh] flex items-center pt-20 pb-32">
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="h-24 w-24 bg-white rounded-full p-2 shadow-2xl flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dgyqfax25/image/upload/v1761895483/d5513655-e2aa-4582-8bf8-5c3c196fa828_vnk5cq.png"
                  alt="AgriLink Lanka Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg"
            >
              Transforming Sri Lankan <span className="text-green-400">Agriculture</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow"
            >
              The centralized B2B marketplace connecting farmers directly with global exporters. Fair trade, verified quality, and zero intermediaries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-500 transition-all font-bold text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] flex items-center justify-center gap-2 group"
              >
                Join the Network <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl hover:bg-white/20 transition-all font-bold text-lg shadow-lg flex items-center justify-center"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* THE CHALLENGE SECTION */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="initial" whileInView="animate" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-white mb-6">Bridging the Gap in Agriculture</motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-200 leading-relaxed mb-8">
              Sri Lankan farmers often suffer from low profit margins due to intermediaries, while exporters struggle to find verified, quality-assured suppliers efficiently.
            </motion.p>
            <motion.div variants={fadeInUp} className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white font-medium text-lg shadow-sm">
              AgriLink Lanka solves this by creating a direct, transparent, and secure digital ecosystem for both parties.
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TWO-SIDED MARKETPLACE SECTION */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 text-white">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-md">A Marketplace Built for Both</h2>
            <p className="text-xl text-gray-200 drop-shadow-md">Tailored tools whether you are growing the crops or exporting them.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Farmers */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 hover:bg-white transition-colors"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">For Farmers</h3>
              <ul className="space-y-4">
                {[
                  { icon: Handshake, text: "Direct access to major exporters without middlemen" },
                  { icon: TrendingUp, text: "Set your own fair prices and maximize profits" },
                  { icon: Coins, text: "Secure, real-time payments directly to your account" },
                  { icon: Search, text: "Easy-to-use digital dashboard to manage your stock" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-green-50 p-1 rounded-lg">
                      <item.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-lg text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Exporters */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 hover:bg-white transition-colors"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-8">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">For Exporters</h3>
              <ul className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "Access to Admin-verified, quality-assured suppliers" },
                  { icon: Search, text: "Advanced filtering by district, grade, and organic status" },
                  { icon: Leaf, text: "Real-time stock availability and instant ordering" },
                  { icon: Truck, text: "Streamlined logistics and automated notifications" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 p-1 rounded-lg">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-lg text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-white mb-16 drop-shadow-md">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-white/20 z-0"></div>

            {[
              { step: "01", title: "Register & List", desc: "Farmers create an account and list their produce with photos, grade, and pricing.", icon: "📝" },
              { step: "02", title: "Search & Order", desc: "Exporters browse the marketplace, filter by needs, and place orders directly.", icon: "🔍" },
              { step: "03", title: "Pay & Fulfill", desc: "Secure payments are processed, and automated notifications handle the logistics.", icon: "💳" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="relative z-10 text-center bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20"
              >
                <div className="w-24 h-24 mx-auto bg-green-50 border-4 border-green-600 shadow-xl rounded-full flex items-center justify-center text-4xl mb-6 relative">
                  {item.icon}
                  <div className="absolute -top-2 -right-2 bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-200 text-lg leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STATS */}
      <section className="py-20 relative z-10 bg-green-900/70 backdrop-blur-md border-y border-white/20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { stat: "100%", label: "Transparent Pricing" },
              { stat: "0", label: "Intermediaries" },
              { stat: "24/7", label: "Market Access" },
              { stat: "Fast", label: "Secure Payments" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="text-5xl font-extrabold mb-2 drop-shadow-md">{item.stat}</div>
                <div className="text-green-200 font-medium text-lg">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/50"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-10">
              Join the fastest-growing agricultural network in Sri Lanka today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register?role=farmer" className="bg-orange-500 text-white px-8 py-4 rounded-xl hover:bg-orange-600 transition-colors font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                <Sprout className="w-5 h-5" /> I am a Farmer
              </Link>
              <Link href="/register?role=exporter" className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                <Globe className="w-5 h-5" /> I am an Exporter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}