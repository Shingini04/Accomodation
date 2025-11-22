import { Building2, CheckCircle, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Shaastra Accommodation Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Register for comfortable and secure accommodation during Shaastra 2025. Experience seamless booking with instant confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Accommodation</h3>
            <p className="text-gray-600">
              Clean and comfortable rooms with all essential amenities for a pleasant stay.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Confirmation</h3>
            <p className="text-gray-600">
              Secure your spot with instant payment confirmation and room allotment updates.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Safe & Secure</h3>
            <p className="text-gray-600">
              Verified participants only with secure payment processing through Razorpay.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Register?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete your accommodation registration in minutes. Fill out the form, make payment, and receive instant confirmation via email.
          </p>
          <div className="inline-block px-8 py-4 rounded-lg font-semibold text-lg text-gray-700">
            Registration is available after login. Please use the login page to access the accommodation form.
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Accommodation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Non-AC Rooms: ₹300 per night per person</li>
                <li>AC Rooms: ₹500 per night per person</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Timings</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Check-in: 2:00 PM onwards</li>
                <li>Check-out: 11:00 AM</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">What to Bring</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Valid Government ID</li>
                <li>Confirmation Email</li>
                <li>Personal Toiletries</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
              <ul className="space-y-2 text-gray-700">
                <li>Visit our Support Center</li>
                <li>Email: support@shaastra.org</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
