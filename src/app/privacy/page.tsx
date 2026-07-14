import { Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
              <p className="mt-2 text-gray-500">Last updated: July 12, 2026</p>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-600 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="leading-relaxed">We collect information that you provide directly to us when you register for an account, update your profile, list products, or place orders. This includes:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 leading-relaxed">
                <li>Personal identification information (Name, Email Address, Phone Number, NIC)</li>
                <li>Business information (Farm location, export business registration)</li>
                <li>Agricultural data (Produce types, harvest schedules, farming methods)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="leading-relaxed">The information we collect is used in the following ways:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4 leading-relaxed">
                <li>To verify your identity and maintain a secure marketplace.</li>
                <li>To connect farmers with relevant exporters based on district and produce.</li>
                <li>To send important administrative messages, order updates, and platform announcements.</li>
                <li>To analyze platform usage and improve our services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
              <p className="leading-relaxed">We implement a variety of security measures to maintain the safety of your personal information. All sensitive data is transmitted via Secure Socket Layer (SSL) technology and encrypted in our database, accessible only by authorized personnel with special access rights.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
