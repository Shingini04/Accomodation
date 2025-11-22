import { useState, FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_SUPPORT_TICKET } from '../graphql/mutations';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', category: 'General', message: '' });
  const [createTicket, { loading }] = useMutation(CREATE_SUPPORT_TICKET);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const storedUser = localStorage.getItem('authUser');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || 'guest';

      await createTicket({
        variables: {
          data: {
            userId,
            name: formData.name || (user?.name || 'Guest'),
            email: formData.email || (user?.email || 'guest@example.com'),
            category: formData.category,
            message: formData.message,
          },
        },
      });

      alert('Message sent — our support team will contact you.');
      setFormData({ name: '', email: '', category: 'General', message: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p className="text-sm text-gray-600 mb-6">Send us a message about payments, allotments, or check-in problems.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded">
              <option>General</option>
              <option>Payment Error</option>
              <option>Allotment Issue</option>
              <option>Check-in Problem</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message <span className="text-xs text-gray-400">(max 200 chars)</span></label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value.slice(0, 200) })}
              rows={5}
              maxLength={200}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="text-right text-xs text-gray-500 mt-1">{formData.message.length}/200</div>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
