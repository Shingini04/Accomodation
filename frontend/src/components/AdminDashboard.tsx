import { useMemo, useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import {
  GET_DASHBOARD_STATS,
  GET_ACCOMMODATIONS,
  GET_SUPPORT_TICKETS,
  EXPORT_SUPPORT_TICKETS_CSV,
  EXPORT_ACCOMMODATIONS_CSV_ADMIN,
  GET_HOSTEL_UTILIZATION,
  GENERATE_RECEIPT,
} from '../graphql/queries';
import { DashboardStats, Accommodation, HostelUtilization } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function AdminDashboard() {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(() => !!localStorage.getItem('adminPassword'));

  const client = useApolloClient();

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery<{ getDashboardStats: DashboardStats }>(GET_DASHBOARD_STATS, { skip: !adminAuthenticated });
  const { data: accommodationsData, loading: accommodationsLoading, error: accommodationsError } = useQuery<{ getAccommodations: Accommodation[] }>(GET_ACCOMMODATIONS, { skip: !adminAuthenticated });
  const { data: ticketsData, error: ticketsError } = useQuery<{ getSupportTickets: any[] }>(GET_SUPPORT_TICKETS, { skip: !adminAuthenticated });
  const { data: hostelData, error: hostelError } = useQuery<{ getHostelUtilization: HostelUtilization[] }>(GET_HOSTEL_UTILIZATION, { skip: !adminAuthenticated });

  const stats = statsData?.getDashboardStats;
  const accommodations = accommodationsData?.getAccommodations || [];
  const tickets = ticketsData?.getSupportTickets || [];
  const hostelUtil = hostelData?.getHostelUtilization || [];

  // Debug logging
  console.log('Admin authenticated:', adminAuthenticated);
  console.log('Admin password in localStorage:', !!localStorage.getItem('adminPassword'));
  console.log('Accommodations data:', accommodations);
  console.log('Accommodations count:', accommodations.length);
  console.log('Loading states:', { statsLoading, accommodationsLoading });

  // Log errors for debugging
  if (accommodationsError) {
    console.error('Accommodations error:', accommodationsError);
  }
  if (statsError) {
    console.error('Stats error:', statsError);
  }
  if (ticketsError) {
    console.error('Tickets error:', ticketsError);
  }
  if (hostelError) {
    console.error('Hostel error:', hostelError);
  }

  // Filters
  const [search, setSearch] = useState('');
  const [paidFilter, setPaidFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Male' | 'Female' | 'Other'>('all');

  const filteredAccommodations = useMemo(() => {
    const s = search.trim().toLowerCase();
    return accommodations.filter(acc => {
      const matchText = !s ||
        acc.name.toLowerCase().includes(s) ||
        acc.email.toLowerCase().includes(s) ||
        (acc.user?.name?.toLowerCase?.().includes(s)) ||
        (acc.user?.email?.toLowerCase?.().includes(s));
      const matchPaid = paidFilter === 'all' || (paidFilter === 'paid' ? acc.paid : !acc.paid);
      const matchGender = genderFilter === 'all' || acc.gender === genderFilter;
      return matchText && matchPaid && matchGender;
    });
  }, [accommodations, search, paidFilter, genderFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccommodations.length / pageSize));
  const pageAccommodations = filteredAccommodations.slice(page * pageSize, (page + 1) * pageSize);

  const handleSwipe = (startX: number | null, endX: number) => {
    if (startX === null) return;
    const diff = endX - startX;
    const threshold = 50; // px
    if (diff > threshold && page > 0) setPage(page - 1);
    if (diff < -threshold && page < totalPages - 1) setPage(page + 1);
  };

  if (!adminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <p className="text-sm text-gray-600 mb-4">Enter admin password to access the dashboard.</p>
          <input type="password" id="admin-password" placeholder="Admin Password" className="w-full px-3 py-2 border rounded mb-4" />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('admin-password') as HTMLInputElement | null;
                const val = el?.value || '';
                if (!val) return alert('Enter admin password');
                if (val !== 'admin123') {
                  alert('Incorrect password');
                  return;
                }
                localStorage.setItem('adminPassword', val);
                setAdminAuthenticated(true);
                // reload to trigger queries with header
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (statsLoading || accommodationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const handleExportCSV = async () => {
    try {
      const res = await client.query({ query: EXPORT_ACCOMMODATIONS_CSV_ADMIN, fetchPolicy: 'no-cache' });
      const csv = res.data.exportAccommodationsCSVAdmin;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accommodations_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export accommodations');
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Accommodations', 14, 20);
      const startY = 30;
      const cols = ['Name', 'Shaastra ID', 'Guests', 'Money Due', 'Money Paid', 'Status'];
      let y = startY;
      doc.setFontSize(10);
      doc.text(cols.join(' | '), 14, y);
      y += 6;
      accommodations.forEach(acc => {
        const row = [
          acc.name, 
          acc.user?.shaastraId || 'N/A', 
          String(acc.numberOfPeople || ''), 
          `₹${acc.amount}`, 
          acc.paid ? `₹${acc.amount}` : '₹0', 
          acc.paid ? 'Paid' : 'Pending'
        ];
        const text = row.join(' | ');
        doc.text(text, 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save(`accommodations_${new Date().toISOString()}.pdf`);
    } catch (e) {
      alert('Failed to export PDF');
    }
  };

  const handleExportTicketsCSV = async () => {
    try {
      const res = await client.query({ query: EXPORT_SUPPORT_TICKETS_CSV, fetchPolicy: 'no-cache' });
      const csv = res.data.exportSupportTicketsCSV;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `support_tickets_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export complaints');
    }
  };

  const handleExportTicketsPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text('Support Tickets', 14, 20);
      let y = 30;
      doc.setFontSize(10);
      doc.text('Name | Email | Message | Timestamp', 14, y);
      y += 6;
      tickets.slice().reverse().forEach(t => {
        const created = t.createdAt ? new Date(t.createdAt).toLocaleString() : 'NIL';
        const line = `${t.name} | ${t.email} | ${(t.message || '').replace(/\n/g, ' ')} | ${created}`;
        doc.text(line, 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      doc.save(`support_tickets_${new Date().toISOString()}.pdf`);
    } catch (e) {
      alert('Failed to export complaints PDF');
    }
  };

  const handleDownloadReceipt = async (accommodationId: string) => {
    try {
      const res = await client.query({
        query: GENERATE_RECEIPT,
        variables: { accommodationId },
        fetchPolicy: 'no-cache',
      });
      const receipt = res.data.generateReceipt;
      const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${accommodationId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Failed to generate receipt');
    }
  };

  const handleCheckInOut = async (accoId: string, type: 'checkin' | 'checkout') => {
    try {
      // dynamic import mutation to avoid circular imports at top
      const { UPDATE_CHECK_IN_OUT } = await import('../graphql/mutations');
      await client.mutate({
        mutation: UPDATE_CHECK_IN_OUT,
        variables: { data: { accommodationId: accoId, type } },
        fetchPolicy: 'no-cache'
      });
      alert(type === 'checkin' ? 'Check-in recorded' : 'Check-out recorded');
    } catch (e: any) {
      alert(e.message || 'Failed to record action');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('adminPassword');
              window.location.reload();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Recent Accommodations */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              handleSwipe(touchStartX, e.changedTouches[0].clientX);
              setTouchStartX(null);
            }}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Accommodations</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} className="p-2 rounded bg-gray-100">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600">Page {page + 1} / {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} className="p-2 rounded bg-gray-100">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Search name or email..."
                className="px-3 py-2 border rounded"
              />
              <select value={paidFilter} onChange={(e) => { setPaidFilter(e.target.value as any); setPage(0); }} className="px-3 py-2 border rounded">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
              <select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value as any); setPage(0); }} className="px-3 py-2 border rounded">
                <option value="all">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="p-4 flex items-center justify-end gap-2">
              <button onClick={handleExportCSV} className="bg-blue-600 text-white px-3 py-2 rounded">Export CSV</button>
              <button onClick={handleExportPDF} className="bg-gray-800 text-white px-3 py-2 rounded">Export PDF</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shaastra ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Number of Guests</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Money Due (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Money Paid (₹)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageAccommodations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {accommodationsLoading ? 'Loading accommodations...' : 
                         accommodationsError ? `Error: ${accommodationsError.message}` :
                         accommodations.length === 0 ? 'No accommodations found in database' :
                         'No accommodations match your filters'}
                      </td>
                    </tr>
                  ) : (
                    pageAccommodations.map((acc) => (
                      <tr key={acc.accoId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{acc.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-mono">{acc.user?.shaastraId || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{acc.numberOfPeople}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">₹{acc.amount}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{acc.paid ? `₹${acc.amount}` : '₹0'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${acc.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{acc.paid ? 'Paid' : 'Pending'}</span>
                        </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {acc.paid && (
                            <button
                              onClick={() => handleDownloadReceipt(acc.accoId)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                            >
                              Receipt
                            </button>
                          )}
                          {!acc.checkInAt && acc.paid && (
                            <button
                              onClick={() => handleCheckInOut(acc.accoId, 'checkin')}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Check In
                            </button>
                          )}
                          {acc.checkInAt && !acc.checkOutAt && (
                            <button
                              onClick={() => handleCheckInOut(acc.accoId, 'checkout')}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Support Tickets / Complaints</h2>
            <div className="flex items-center gap-2">
              <button onClick={handleExportTicketsCSV} className="bg-blue-600 text-white px-3 py-2 rounded">Export CSV</button>
              <button onClick={handleExportTicketsPDF} className="bg-gray-800 text-white px-3 py-2 rounded">Export PDF</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{t.userId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={t.message}>{t.message}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        t.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        t.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}</td>
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
