export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Deletion Instructions</h1>
        <p className="text-gray-600 mb-4">Last updated: August 1, 2026</p>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">How to Request Data Deletion</h2>
          <p className="text-gray-700 mb-4">
            You have the right to request deletion of your personal data from Dad Coach AI. 
            We take your privacy seriously and will process your request promptly.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Option 1: Email Request</h2>
          <p className="text-gray-700 mb-2">
            Send an email to <strong>oren26g@gmail.com</strong> with:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Subject: &quot;Data Deletion Request&quot;</li>
            <li>Your WhatsApp phone number</li>
            <li>Confirmation that you want all your data deleted</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Option 2: WhatsApp Message</h2>
          <p className="text-gray-700">
            Send a message to our WhatsApp number saying &quot;DELETE MY DATA&quot; and we will 
            process your request.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What Gets Deleted</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Your phone number from our database</li>
            <li>All conversation history</li>
            <li>Any preferences or settings</li>
            <li>All associated metadata</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Processing Time</h2>
          <p className="text-gray-700">
            Data deletion requests are typically processed within 30 days. 
            You will receive confirmation once your data has been deleted.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
          <p className="text-gray-700">
            For questions about data deletion, please contact us at: oren26g@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
