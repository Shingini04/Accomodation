import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apolloClient';
import Navigation from './components/Navigation';
import AccommodationForm from './components/AccommodationForm';
import Login from './components/Login';
import ContactUs from './components/ContactUs';
import SupportTicket from './components/SupportTicket';
import AdminDashboard from './components/AdminDashboard';
import RoomManagement from './components/RoomManagement';
import ExportData from './components/ExportData';
import MyAccommodations from './components/MyAccommodations';

function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  // Get actual user from localStorage
  const getAuthUser = () => {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return (
    <ApolloProvider client={apolloClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation isAdmin={isAdminRoute} />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/support" element={<Navigate to="/contact-us" replace />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route
              path="/accommodation"
              element={
                localStorage.getItem('authToken') ? (
                  (() => {
                    const user = getAuthUser();
                    return <AccommodationForm userId={user?.id || ''} userName={user?.name || ''} userEmail={user?.email || ''} />;
                  })()
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/my-accommodations"
              element={
                localStorage.getItem('authToken') ? (
                  (() => {
                    const user = getAuthUser();
                    return <MyAccommodations userId={user?.id || ''} />;
                  })()
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/accommodations" element={<AdminDashboard />} />
            <Route path="/accommodation/admin" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<RoomManagement />} />
            <Route 
              path="/admin/support" 
              element={
                (() => {
                  const user = getAuthUser();
                  return <SupportTicket userId={user?.id || ''} userName={user?.name || ''} userEmail={user?.email || ''} />;
                })()
              } 
            />
            <Route path="/admin/export" element={<ExportData />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
