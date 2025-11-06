import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_HOSTEL_UTILIZATION, GET_ACCOMMODATIONS } from '../graphql/queries';
import { DashboardStats, HostelUtilization, Accommodation } from '../types';
import { Users, Home, DollarSign, CheckCircle, AlertCircle, Percent } from 'lucide-react';

export default function AdminDashboard() {
  const { data: statsData, loading: statsLoading } = useQuery<{ getDashboardStats: DashboardStats }>(GET_DASHBOARD_STATS);
  const { data: hostelData, loading: hostelLoading } = useQuery<{ getHostelUtilization: HostelUtilization[] }>(GET_HOSTEL_UTILIZATION);
  const { data: accommodationsData, loading: accommodationsLoading } = useQuery<{ getAccommodations: Accommodation[] }>(GET_ACCOMMODATIONS);

  const stats = statsData?.getDashboardStats;
  const hostels = hostelData?.getHostelUtilization || [];
  const accommodations = accommodationsData?.getAccommodations || [];

  if (statsLoading || hostelLoading || accommodationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Accommodations</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalAccommodations}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-3xl font-bold text-green-600">{stats?.paidAccommodations}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.pendingAccommodations}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600">₹{stats?.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalRooms}</p>
              </div>
              <Home className="w-12 h-12 text-gray-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.occupancyRate.toFixed(1)}%</p>
              </div>
              <Percent className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-3xl font-bold text-green-600">{stats?.checkedIn}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-3xl font-bold text-red-600">{stats?.openTickets}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gender Distribution</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Male</span>
                  <span className="text-sm font-semibold">{stats?.maleParticipants}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.maleParticipants || 0) / (stats?.totalAccommodations || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Female</span>
                  <span className="text-sm font-semibold">{stats?.femaleParticipants}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.femaleParticipants || 0) / (stats?.totalAccommodations || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Other</span>
                  <span className="text-sm font-semibold">{stats?.otherGenderParticipants}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.otherGenderParticipants || 0) / (stats?.totalAccommodations || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hostel Utilization</h2>
            <div className="space-y-4">
              {hostels.map((hostel) => (
                <div key={hostel.hostelName}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{hostel.hostelName}</span>
                    <span className="text-sm font-semibold">
                      {hostel.occupiedCapacity}/{hostel.totalCapacity} ({hostel.utilizationRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${hostel.utilizationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Accommodations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accommodations.slice(0, 10).map((acc) => (
                  <tr key={acc.accoId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{acc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{acc.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{acc.organization}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(acc.arrivalDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">₹{acc.amount}</td>
                    <td className="px-6 py-4">
                      {acc.paid ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
