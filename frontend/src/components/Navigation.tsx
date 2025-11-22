import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, MessageCircle, BarChart3 } from 'lucide-react';

interface NavigationProps {
  isAdmin?: boolean;
}

export default function Navigation({ isAdmin = false }: NavigationProps) {
  const location = useLocation();

  const isLoggedIn = Boolean(typeof window !== 'undefined' && localStorage.getItem('authToken'));

  const userLinks = [
    { to: '/my-accommodations', icon: Home, label: 'My Accommodations' },
    { to: '/support', icon: MessageCircle, label: 'Support' },
    { to: '/contact-us', icon: MessageCircle, label: 'Contact Us' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = '/';
  };

  const adminLinks = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard' },
    { to: '/admin/accommodations', icon: Users, label: 'Accommodations' },
    { to: '/admin/rooms', icon: Home, label: 'Rooms' },
    { to: '/admin/support', icon: MessageCircle, label: 'Support' },
    { to: '/admin/export', icon: FileText, label: 'Export' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Shaastra</h1>
            <span className="ml-2 text-sm text-gray-600">Accommodation Portal</span>
          </div>
          <div className="flex space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to + link.label}
                  to={link.to}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <button onClick={handleLogout} className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
