import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
              <p className="mt-2 text-gray-500">Last updated: July 12, 2026</p>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-600 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">By accessing or using the AgriLink Lanka platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service. These terms apply to all users, including farmers, exporters, and administrators.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Registration</h2>
              <p className="leading-relaxed">To use certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. Account verification is required for Exporters and Farmers to ensure marketplace security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Platform Usage</h2>
              <ul className="list-disc pl-6 space-y-3 leading-relaxed">
                <li><strong>Farmers</strong> agree to list accurate produce details, pricing, and availability.</li>
                <li><strong>Exporters</strong> agree to honor their orders and communicate promptly regarding logistics.</li>
                <li>Any fraudulent activity, misrepresentation of produce (such as falsely claiming organic status), or failure to fulfill accepted orders may result in immediate account termination.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Transactions & Payments</h2>
              <p className="leading-relaxed">AgriLink Lanka facilitates connections between farmers and exporters. While we provide the platform for discovering and ordering produce, all financial transactions and logistics are currently handled directly between the parties, unless otherwise specified by our secure escrow services when available.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
