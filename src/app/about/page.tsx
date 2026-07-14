'use client';

import { motion } from 'framer-motion';
import { PageTransition, fadeInUp, staggerContainer, slideIn } from '@/components/animations/PageTransition';
import { Sprout, Globe, Target, AlertTriangle, CheckCircle2, TrendingUp, ShieldCheck, Handshake, Truck, Search, Coins, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function About() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        {/* HERO SECTION */}
        <div 
          className="relative overflow-hidden bg-green-900 text-white pt-24 pb-32"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1761896989/top-view-vegetables-with-free-place-your-text-dark-grey-green-background_irs7yr_lbi0wk.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-6">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-800/50 text-green-200 border border-green-700/50 mb-4 backdrop-blur-sm">
                <Sprout className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide uppercase">About Us</span>
              </motion.div>
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold tracking-tight text-white">
                Reimagining <span className="text-green-400">Sri Lankan</span> Agriculture
              </motion.h1>
              <motion.p variants={fadeInUp} className="mt-6 max-w-2xl mx-auto text-xl text-green-100 leading-relaxed">
                AgriLink Lanka is a centralized B2B web platform connecting Sri Lankan farmers directly with authorized exporters, eliminating intermediaries and ensuring fair, transparent trade.
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* THE PROBLEM & VISION SECTION */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <motion.div 
            initial="initial" 
            whileInView="animate" 
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer} 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* The Problem */}
            <motion.div variants={slideIn('up')} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertTriangle className="w-32 h-32 text-red-500" />
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Problem We Address</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Sri Lankan farmers face persistent barriers in reaching reliable export markets, often suffering from exploitation by middlemen and low profit margins. Meanwhile, export agents struggle to find quality-assured suppliers efficiently.
              </p>
            </motion.div>

            {/* The Vision */}
            <motion.div variants={slideIn('up')} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 shadow-xl border border-green-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target className="w-32 h-32 text-green-600" />
              </div>
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Target className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision & Mission</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                We envision a future where every Sri Lankan farmer can reach reliable export markets. Our mission is to facilitate efficient, secure, and transparent connections between farmers and authorized export agents using modern digital technology.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* CORE BENEFITS SECTION */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">A Platform Built for Everyone</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Whether you're growing crops or exporting them globally, we've designed our tools specifically for your needs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* For Farmers */}
              <motion.div 
                initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Empowering Farmers</h3>
                </div>
                
                {[
                  { icon: Handshake, title: "Direct Market Access", desc: "Connect directly with verified exporters without middlemen taking a cut." },
                  { icon: Search, title: "Easy Management", desc: "Simple tools to upload photos, update quantities, and manage your crop listings." },
                  { icon: TrendingUp, title: "Fair Pricing", desc: "Set your own prices based on quality and market demand." },
                  { icon: Coins, title: "Secure Payments", desc: "Fast and secure payment processing directly to your account." }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* For Exporters */}
              <motion.div 
                initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}
                className="space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Streamlining Exports</h3>
                </div>

                {[
                  { icon: ShieldCheck, title: "Quality Assurance", desc: "Browse graded produce with clear photos and organic certifications." },
                  { icon: Target, title: "Verified Network", desc: "All farmers and products are vetted by our team for absolute reliability." },
                  { icon: TrendingUp, title: "Efficient Procurement", desc: "Order exactly what you need with real-time stock updates." },
                  { icon: Truck, title: "Seamless Operations", desc: "Streamlined communication and documentation for smooth exporting." }
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* WHY CHOOSE US */}
        <div className="bg-white py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AgriLink Lanka?</h2>
              <p className="text-xl text-gray-600">How we differ from traditional agricultural exporters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                "Open farmer registration portal instead of exclusive partnerships",
                "Transparent pricing visible to all parties vs. company-set prices",
                "Inclusion of small-scale farmers often ignored by traditional exporters",
                "Real-time payment processing vs. manual invoicing and bank transfers",
                "Automated digital notifications vs. phone/email coordination",
                "Modern scalable marketplace vs. static company websites or catalogs"
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 bg-green-100 rounded-full p-1">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA SECTION */}
        <div className="mt-auto bg-green-900 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your agricultural business?</h2>
            <p className="text-green-100 text-lg mb-8">
              Join AgriLink Lanka today and be part of the future of Sri Lankan agriculture.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 bg-white text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
