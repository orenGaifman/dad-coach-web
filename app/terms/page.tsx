import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Dad Coach",
  description: "Read the terms and conditions for using Dad Coach parenting coaching service.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-4">Last updated: August 1, 2026</p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By using Dad Coach AI, you agree to these Terms of Service. 
            If you do not agree, please do not use our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
          <p className="text-gray-700">
            Dad Coach AI is an AI-powered parenting coaching service delivered via WhatsApp. 
            We provide guidance, tips, and support for fathers navigating parenthood.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. User Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>You must be 18 years or older to use this service</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You agree not to misuse the service or use it for unlawful purposes</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Disclaimer</h2>
          <p className="text-gray-700">
            Dad Coach AI provides general parenting guidance and is not a substitute for professional 
            medical, psychological, or legal advice. Always consult qualified professionals for 
            specific concerns about your child&apos;s health or development.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Limitation of Liability</h2>
          <p className="text-gray-700">
            Dad Coach AI is provided &quot;as is&quot; without warranties of any kind. 
            We are not liable for any damages arising from the use of our service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these terms from time to time. Continued use of the service 
            constitutes acceptance of the updated terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contact</h2>
          <p className="text-gray-700">
            For questions about these Terms, please contact us at: oren26g@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
