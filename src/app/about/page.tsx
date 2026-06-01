'use client';

import { motion } from 'framer-motion';
import { fadeInUp } from '@/components/animations/PageTransition';

export default function About() {
  const cards = [
    {
      title: 'About AgriLink Lanka',
      content: `AgriLink Lanka is a centralized B2B web platform connecting Sri Lankan farmers with exporters who represent export companies, managed by an admin. Our platform digitizes listings, discovery, orders, export-related details, and payments with role-based access. We empower farmers by providing direct access to verified exporters from companies like Keells, Cargills, and Arpico, eliminating intermediaries and ensuring fair, transparent trade.`,
    },
    {
      title: 'The Problem We Address',
      content: `Sri Lankan farmers face persistent barriers in reaching reliable export markets, often suffering from exploitation by intermediaries, low profit margins, and post-harvest losses. Export agents from major retailers struggle to access verified, quality-assured suppliers transparently and efficiently. The absence of a structured digital platform creates inefficiencies in communication, trust, and logistics between farmers and exporters, weakening the overall agricultural supply chain.`,
    },
    {
      title: 'Our Vision & Mission',
      content: `We envision a future where every Sri Lankan farmer, regardless of scale, can reach reliable export markets, maximize profits, and contribute to a sustainable agricultural economy. Our mission is to develop a web-based system that facilitates efficient, transparent, and secure connections between farmers and authorized export agents, leveraging modern digital technologies to streamline agricultural trade.`,
    },
    {
      title: 'Key Features & Benefits',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Open Farmer Registration:</strong> All farmers can list vegetables directly with variety, grade, pricing, photos, and export-ready status</li>
          <li><strong>Admin-Verified Exporters:</strong> Transparent price listings and verified buyer network for trust and security</li>
          <li><strong>Product Grading System:</strong> Clear A/B/C grading guidelines with visual indicators for quality standards</li>
          <li><strong>Inclusive Platform:</strong> Supports both small-scale and large-scale producers equally</li>
          <li><strong>Image Management:</strong> Local file storage for product photos and organic certifications</li>
          <li><strong>Advanced Search & Filters:</strong> Browse by category, district, grade, price, organic, and export-ready status</li>
          <li><strong>Admin Dashboard:</strong> Product approval workflow, exporter verification, and platform monitoring</li>
          <li><strong>Smooth Animations:</strong> Enhanced user experience with Framer Motion animations throughout</li>
        </ul>
      ),
    },
    {
      title: 'Our Objectives',
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide farmers with a platform to list and manage their available vegetables for export</li>
          <li>Enable exporter agents to browse listings, view detailed product information, and contact farmers</li>
          <li>Allow administrators to verify exporters, approve product listings, and ensure platform integrity</li>
          <li>Implement secure role-based authentication for Farmers, Exporters, and Admins</li>
          <li>Provide real-time product availability with image uploads and certification management</li>
          <li>Create an intuitive, responsive interface with smooth animations for enhanced user experience</li>
          <li>Enable farmers to edit and delete their own products with proper authorization</li>
        </ul>
      ),
    },
    {
      title: 'Technology Stack',
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-green-800">Built with enterprise-grade technologies:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Frontend:</strong> Next.js 15 with TailwindCSS and Framer Motion for responsive, animated UI</li>
            <li><strong>Backend:</strong> ASP.NET Core (.NET 9) Web API for robust performance</li>
            <li><strong>Database:</strong> PostgreSQL 16 with ACID transactions and relational schema design</li>
            <li><strong>File Storage:</strong> Local file system with static file serving for product images and certifications</li>
            <li><strong>Authentication:</strong> JWT token-based authentication with refresh tokens</li>
            <li><strong>Security:</strong> Role-based access control (RBAC), password hashing with BCrypt, input validation</li>
            <li><strong>Deployment:</strong> GitHub for version control with modern CI/CD practices</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Why Choose AgriLink Lanka?',
      content: (
        <div className="space-y-3">
          <p>Unlike traditional agricultural exporters like A & A Enterprises, Agro Island, and Alwis Agro that work with limited suppliers or established partners only, AgriLink Lanka offers:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Open farmer registration portal instead of exclusive partnerships</li>
            <li>Transparent pricing visible to all parties vs. company-set prices</li>
            <li>Inclusion of small-scale farmers often ignored by traditional exporters</li>
            <li>Real-time payment processing vs. manual invoicing and bank transfers</li>
            <li>Automated digital notifications vs. phone/email coordination</li>
            <li>Modern scalable marketplace vs. static company websites or catalogs</li>
          </ul>
        </div>
      ),
    },
    {
      title: '',
      content: (
        <div className="text-center space-y-3">
          <p className="text-green-900 font-bold text-lg">Together, we are building a fair, efficient, and sustainable future for Sri Lankan agriculture.</p>
          <p className="text-gray-800">AgriLink Lanka streamlines farmer–exporter interactions, promotes fair trade, and enhances efficiency in Sri Lanka's agricultural supply chain.</p>
        </div>
      ),
    },
  ];

  return (
    <div
      className="relative min-h-screen w-full py-16 px-2 flex flex-col items-center justify-center bg-white"
      style={{
        backgroundImage: "url('https://res.cloudinary.com/dgyqfax25/image/upload/v1761896989/top-view-vegetables-with-free-place-your-text-dark-grey-green-background_irs7yr_lbi0wk.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
      }}
    >
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-10">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 50, x: idx % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
            className={`group w-full md:w-3/4 mx-auto p-8 rounded-3xl shadow-2xl border border-white/60 bg-white/40 backdrop-blur-lg ${
              idx % 2 === 0 ? 'self-start md:ml-0 md:mr-auto' : 'self-end md:mr-0 md:ml-auto'
            }`}
            style={{
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {card.title && (
              <h2 className="text-2xl font-bold text-green-800 mb-2 drop-shadow-lg text-center md:text-left">{card.title}</h2>
            )}
            <div className="text-gray-800 text-lg leading-relaxed">
              {card.content}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
