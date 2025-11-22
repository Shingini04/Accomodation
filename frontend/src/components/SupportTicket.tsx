import { useState, FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_SUPPORT_TICKET } from '../graphql/mutations';
import { GET_USER_SUPPORT_TICKETS } from '../graphql/queries';
import { SupportTicket as SupportTicketType } from '../types';
import { MessageCircle, Send } from 'lucide-react';

interface SupportTicketProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function SupportTicket({ userId, userName, userEmail }: SupportTicketProps) {
  const [formData, setFormData] = useState({
    category: '',
    message: '',
  });

  const { data, loading, refetch } = useQuery<{ getUserSupportTickets: SupportTicketType[] }>(
    GET_USER_SUPPORT_TICKETS,
    { variables: { userId } }
  );

  const [createTicket, { loading: creating }] = useMutation(CREATE_SUPPORT_TICKET, {
    onCompleted: () => {
      setFormData({ category: '', message: '' });
      refetch();
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate category is not empty
    if (!formData.category || formData.category.trim() === '') {
      alert('Please select a category');
      return;
    }
    
    // Validate message is not empty or just whitespace
    if (!formData.message || formData.message.trim().length === 0) {
      alert('Please enter a message describing your issue');
      return;
    }
    
    // Validate minimum message length
    if (formData.message.trim().length < 10) {
      alert('Message must be at least 10 characters long');
      return;
    }
    
    // Validate maximum message length
    if (formData.message.trim().length > 500) {
      alert('Message must be less than 500 characters');
      return;
    }
    
    try {
      await createTicket({
        variables: {
          data: {
            userId,
            name: userName,
            email: userEmail,
            category: formData.category.trim(),
            message: formData.message.trim(),
          },
        },
      });
      alert('Support ticket created successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to create support ticket');
    }
  };

  const tickets = data?.getUserSupportTickets || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <MessageCircle className="w-8 h-8 mr-3 text-blue-600" />
          Support Center
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Issue Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="Payment Error">Payment Error</option>
              <option value="Allotment Issue">Allotment Issue</option>
              <option value="Check-in Problem">Check-in Problem</option>
              <option value="Facility Issue">Facility Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Describe Your Issue *</label>
            <textarea
              required
              minLength={10}
              maxLength={500}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={5}
              placeholder="Please provide details about your issue (minimum 10 characters, maximum 500 characters)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            <Send className="w-5 h-5 mr-2" />
            {creating ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Your Tickets</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-600">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-600">You have no support tickets yet.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.status === 'open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {ticket.status.toUpperCase()}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">{ticket.category}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{ticket.message}</p>
                  {ticket.response && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Response:</p>
                      <p className="text-sm text-gray-700">{ticket.response}</p>
                      {ticket.respondedAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Responded on {new Date(ticket.respondedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
