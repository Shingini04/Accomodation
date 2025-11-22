import { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ACCOMMODATION, VERIFY_RAZORPAY_PAYMENT } from '../graphql/mutations';
import { User, Calendar, Phone, Mail, MapPin, Building, Users } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AccommodationFormProps {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export default function AccommodationForm({ userId }: AccommodationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    dob: '',
    gender: '',
    idType: '',
    idNumber: '',
    address: '',
    organization: '',
    arrivalDate: '',
    departureDate: '',
    numberOfPeople: 1,
    guestGenders: [''],
    eventName: '',
    termsAccepted: false,
  });

  const [showTerms, setShowTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(true);
  // accommodationDates is derived when submitting; no local state needed

  const [createAccommodation, { loading: creating }] = useMutation(CREATE_ACCOMMODATION);
  const [verifyPayment] = useMutation(VERIFY_RAZORPAY_PAYMENT);

  const calculateAmount = () => {
    const basePrice = 300; // fixed price per night per person
    const nights = formData.arrivalDate && formData.departureDate
      ? Math.max(1, Math.ceil((new Date(formData.departureDate).getTime() - new Date(formData.arrivalDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    return basePrice * nights * formData.numberOfPeople;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions');
      setTermsModalOpen(true);
      return;
    }

    const amount = calculateAmount();
    const dates = `${new Date(formData.arrivalDate).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', hour12: true
    })} - ${new Date(formData.departureDate).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', hour12: true
    })}`;

    try {
      const { data } = await createAccommodation({
        variables: {
          data: {
            userId,
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            dob: formData.dob,
            gender: formData.gender,
            idType: formData.idType,
            idNumber: formData.idNumber,
            address: formData.address,
            organization: formData.organization,
            arrivalDate: formData.arrivalDate,
            departureDate: formData.departureDate,
            numberOfPeople: formData.numberOfPeople,
            guestGenders: formData.guestGenders,
            accommodationDates: dates,
            amount,
            eventName: formData.eventName || null,
            termsAndConditions: formData.termsAccepted,
          },
        },
      });

      const orderId = data.createAccommodation.orderId;
      initiateRazorpayPayment(orderId, amount, formData.email, formData.name);
    } catch (error: any) {
      alert(error.message || 'Failed to create accommodation');
    }
  };

  const initiateRazorpayPayment = (orderId: string, amount: number, email: string, name: string) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100,
      currency: 'INR',
      name: 'Shaastra Accommodation',
      description: 'Accommodation Registration',
      order_id: orderId,
      handler: async (response: any) => {
        try {
          await verifyPayment({
            variables: {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          });
          alert('Payment successful! You will receive a confirmation email shortly.');
          // Clear form data after successful payment
          setFormData({
            name: '',
            email: '',
            mobile: '',
            dob: '',
            gender: '',
            idType: '',
            idNumber: '',
            address: '',
            organization: '',
            arrivalDate: '',
            departureDate: '',
            numberOfPeople: 1,
            guestGenders: [''],
            eventName: '',
            termsAccepted: false,
          });
          window.location.href = '/my-accommodations';
        } catch (error: any) {
          alert('Payment verification failed: ' + (error.message || 'Unknown error'));
          // Form data is preserved, user can try again
        }
      },
      modal: {
        ondismiss: function() {
          alert('Payment was cancelled or failed. Your accommodation form has been preserved. Please try again.');
          // Form data is preserved automatically, user can retry
        }
      },
      prefill: {
        name,
        email,
      },
      theme: {
        color: '#2563eb',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      alert('Payment Failed: ' + (response.error.description || 'Your payment was not successful. Please try again. Your accommodation form has been reopened.'));
      // Form data remains intact, email notification sent by backend
    });
    razorpay.open();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Accommodation Registration</h1>

        {termsModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[80vh]">
              <h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
              <div className="prose max-w-none text-sm mb-4 text-gray-700 space-y-3">
                <p>Please read the following carefully before proceeding:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Accommodation is allotted only after successful payment confirmation.</li>
                  <li>Government issued ID must be presented at check-in; details must match the submitted form.</li>
                  <li>Check-in and check-out times must be adhered to; late check-out may incur penalties.</li>
                  <li>Any damage to hostel property will be chargeable to the participant.</li>
                  <li>Bulk bookings must correctly list gender for each guest; mismatches can lead to cancellation.</li>
                  <li>No refund after check-in except in force majeure scenarios approved by admins.</li>
                  <li>Support issues should be raised promptly via the Support section.</li>
                </ul>
                <p>By accepting you agree to comply with Shaastra accommodation policies and code of conduct.</p>
              </div>
              <div className="flex items-center mb-4">
                <input
                  id="accept-terms"
                  type="checkbox"
                  className="mr-2"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-700">I have read and agree to the Terms & Conditions</label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!formData.termsAccepted) {
                      alert('Please accept the terms to continue');
                      return;
                    }
                    setTermsModalOpen(false);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                  disabled={!formData.termsAccepted}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline w-4 h-4 mr-1" />
                Mobile
              </label>
              <input
                type="tel"
                required
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
              <select
                required
                value={formData.idType}
                onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select ID Type</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Student ID">Student ID</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline w-4 h-4 mr-1" />
                Organization
              </label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Name (optional)</label>
              <input
                type="text"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Address
            </label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arrival Date</label>
              <input
                type="datetime-local"
                required
                value={formData.arrivalDate}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
              <input
                type="datetime-local"
                required
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline w-4 h-4 mr-1" />
                Number of People
              </label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.numberOfPeople}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
                  const copy = [...formData.guestGenders];
                  while (copy.length < val) copy.push('');
                  while (copy.length > val) copy.pop();
                  setFormData({ ...formData, numberOfPeople: val, guestGenders: copy });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Pricing is fixed at ₹300/night/person, AC/Non-AC option removed */}

          {formData.arrivalDate && formData.departureDate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Accommodation Summary</p>
              <p className="text-gray-600">
                {new Date(formData.arrivalDate).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', hour12: true
                })} - {new Date(formData.departureDate).toLocaleString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', hour12: true
                })}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹{calculateAmount()}</p>
            </div>
          )}

          {/* Guest genders: show after number of people is selected */}
          {formData.numberOfPeople > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Gender Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: formData.numberOfPeople }).map((_, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {idx === 0 ? 'Guest 1 (You)' : `Guest ${idx + 1}`}
                    </label>
                    <select
                      required
                      value={formData.guestGenders[idx] || ''}
                      onChange={(e) => {
                        const copy = [...formData.guestGenders];
                        copy[idx] = e.target.value;
                        // Update the main gender field with Guest 1's gender
                        if (idx === 0) {
                          setFormData({ ...formData, gender: e.target.value, guestGenders: copy });
                        } else {
                          setFormData({ ...formData, guestGenders: copy });
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-start">
            <input
              type="checkbox"
              required
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              I confirm that all information provided is true and I approve my participation. I have read and accept the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-blue-600 hover:underline"
              >
                terms and conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {creating ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>

      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>1. All participants must provide valid identification at check-in.</p>
              <p>2. Accommodation is provided on a first-come, first-served basis after payment.</p>
              <p>3. Check-in time is 2:00 PM and check-out time is 11:00 AM.</p>
              <p>4. Participants are responsible for their belongings.</p>
              <p>5. Any damage to property will be charged to the participant.</p>
              <p>6. Refunds are not available after payment confirmation.</p>
              <p>7. The organizing committee reserves the right to modify room allocations.</p>
              <p>8. Participants must follow all hostel rules and regulations.</p>
            </div>
            <button
              onClick={() => setShowTerms(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
