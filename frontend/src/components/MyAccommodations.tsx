import { useQuery } from '@apollo/client';
import { GET_USER_ACCOMMODATIONS } from '../graphql/queries';
import { Accommodation } from '../types';
import { Calendar, Users, DollarSign, Home, CheckCircle, XCircle } from 'lucide-react';

interface MyAccommodationsProps {
  userId: string;
}

export default function MyAccommodations({ userId }: MyAccommodationsProps) {
  const { data, loading, error } = useQuery<{ getUserAccommodations: Accommodation[] }>(
    GET_USER_ACCOMMODATIONS,
    { variables: { userId } }
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your accommodations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading accommodations: {error.message}</p>
        </div>
      </div>
    );
  }

  const accommodations = data?.getUserAccommodations || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Home className="w-8 h-8 mr-3 text-blue-600" />
        My Accommodations
      </h1>

      {accommodations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Home className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Accommodations Yet</h2>
          <p className="text-gray-600">You haven't submitted any accommodation requests yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {accommodations.map((acc) => (
            <div
              key={acc.accoId}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">{acc.name}</h3>
                  <div className="flex items-center space-x-2">
                    {acc.paid ? (
                      <span className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Paid
                      </span>
                    ) : (
                      <span className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1" />
                        Payment Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium text-gray-900">
                        {new Date(acc.arrivalDate).toLocaleDateString()} - {new Date(acc.departureDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Number of People</p>
                      <p className="font-medium text-gray-900">{acc.numberOfPeople}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">₹{acc.amount}</p>
                    </div>
                  </div>

                  {acc.allotment && (
                    <div className="flex items-start">
                      <Home className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Room Allotted</p>
                        <p className="font-medium text-gray-900">
                          {acc.allotment.room.hostelName} - Room {acc.allotment.room.roomNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 text-gray-900">{acc.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Mobile:</span>
                      <span className="ml-2 text-gray-900">{acc.mobile}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Organization:</span>
                      <span className="ml-2 text-gray-900">{acc.organization}</span>
                    </div>
                  </div>
                </div>

                {acc.checkInAt && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Checked in on {new Date(acc.checkInAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {acc.checkOutAt && (
                  <div className="mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span>Checked out on {new Date(acc.checkOutAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {!acc.paid && (
                  <div className="border-t pt-4 mt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Payment Pending:</strong> Please complete your payment to confirm your accommodation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
