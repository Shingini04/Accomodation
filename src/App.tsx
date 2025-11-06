import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apolloClient';
import Navigation from './components/Navigation';
import AccommodationForm from './components/AccommodationForm';
import SupportTicket from './components/SupportTicket';
import AdminDashboard from './components/AdminDashboard';
import RoomManagement from './components/RoomManagement';
import ExportData from './components/ExportData';

function App() {
  // Generate a deterministic UUID for the session
  const sessionUserId = 'a3f47c9e-8f3b-4b2d-9b2e-1f2a3b4c5d6e';
  const mockUser = {
    id: sessionUserId,
    name: '',
    email: '',
  };

  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation isAdmin={isAdminRoute} />
          <Routes>
            <Route
              path="/"
              element={
                <AccommodationForm
                  userId={mockUser.id}
                  userName={mockUser.name}
                  userEmail={mockUser.email}
                />
              }
            />
            <Route
              path="/accommodation"
              element={
                <AccommodationForm
                  userId={mockUser.id}
                  userName={mockUser.name}
                  userEmail={mockUser.email}
                />
              }
            />
            <Route
              path="/support"
              element={
                <SupportTicket
                  userId={mockUser.id}
                  userName={mockUser.name}
                  userEmail={mockUser.email}
                />
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/accommodations" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<RoomManagement />} />
            <Route path="/admin/support" element={<SupportTicket userId={mockUser.id} userName={mockUser.name} userEmail={mockUser.email} />} />
            <Route path="/admin/export" element={<ExportData />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
