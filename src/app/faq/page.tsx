import { HelpCircle, Plus } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I get my account verified?",
      answer: "After signing up, your account goes into a pending state. Our administrative team will review your details (such as your NIC and business registration). You will receive an email once your account is fully verified, which usually takes 1-2 business days."
    },
    {
      question: "Are there any fees to join AgriLink Lanka?",
      answer: "No, creating an account and browsing the platform is completely free for both farmers and exporters. Our goal is to empower Sri Lankan agriculture by removing unnecessary barriers."
    },
    {
      question: "How do exporters contact farmers?",
      answer: "Once an exporter is verified, they can view the detailed contact information of farmers on the product listings and can place orders directly through the platform dashboard."
    },
    {
      question: "What does 'Export Ready' mean?",
      answer: "The 'Export Ready' tag indicates that the farmer has met specific quality standards and packaging requirements suitable for international shipping, reducing the friction for exporters."
    },
    {
      question: "How do I list my farm as Organic?",
      answer: "When adding a new product, you can check the 'Is Organic' option. However, you must upload valid organic certification documents which will be visible to exporters."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-10 border-b border-gray-100 pb-8">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h1>
              <p className="mt-2 text-gray-500">Everything you need to know about AgriLink Lanka.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition-shadow bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-start gap-3">
                  <Plus className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 pl-8 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
