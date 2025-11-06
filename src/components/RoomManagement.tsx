import { useState, FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ROOMS, GET_AVAILABLE_ROOMS } from '../graphql/queries';
import { CREATE_ROOM } from '../graphql/mutations';
import { Room } from '../types';
import { Home, Plus, Users } from 'lucide-react';

export default function RoomManagement() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    hostelName: '',
    roomType: '',
    capacity: 1,
  });

  const { data, loading, refetch } = useQuery<{ getRooms: Room[] }>(GET_ROOMS);
  const [createRoom, { loading: creating }] = useMutation(CREATE_ROOM, {
    onCompleted: () => {
      setFormData({ roomNumber: '', hostelName: '', roomType: '', capacity: 1 });
      setShowForm(false);
      refetch();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createRoom({
        variables: {
          data: {
            roomNumber: formData.roomNumber,
            hostelName: formData.hostelName,
            roomType: formData.roomType,
            capacity: formData.capacity,
          },
        },
      });
      alert('Room created successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to create room');
    }
  };

  const rooms = data?.getRooms || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Home className="w-8 h-8 mr-3 text-blue-600" />
          Room Management
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Room
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Room</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hostel Name</label>
                <input
                  type="text"
                  required
                  value={formData.hostelName}
                  onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  required
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Quad">Quad</option>
                  <option value="Dormitory">Dormitory</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Rooms</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-6 text-gray-600">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="p-6 text-gray-600">No rooms available yet.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hostel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{room.roomNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{room.hostelName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{room.roomType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {room.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{room.occupied}</td>
                    <td className="px-6 py-4">
                      {room.available ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Full
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
