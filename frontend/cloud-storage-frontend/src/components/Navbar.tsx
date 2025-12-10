import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="relative w-full z-50 bg-white shadow px-6 py-4 flex items-center justify-between h-16">
      <h1 className="text-2xl font-bold text-gray-800">ShareHub</h1>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center space-x-6 ml-auto">
        {/* Upload Button - Navigate to Dashboard */}
        <button
          className="bg-brand text-white px-5 py-3 rounded-lg text-base hover:bg-brand-dark active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>

        {/* Storage Usage */}
        <div className="text-sm text-text.subtle hidden sm:block">
          Storage: 1.2 GB / 5 GB
        </div>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-text.DEFAULT font-medium px-3 py-2 rounded-lg active:scale-95 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              {user.name}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-10">
                <Link
                  to="/settings/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
                >
                  Profile
                </Link>
                <Link
                  to="/settings/general"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 md:hidden z-30"
          onClick={(e) => {
            e.stopPropagation();
            closeMobileMenu();
          }}
        />
      )}

      {/* Mobile Hamburger with Menu */}
      <div className="relative md:hidden ml-auto">
        <button
          className="text-2xl"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen(!mobileOpen);
          }}
        >
          ☰
        </button>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="absolute top-full right-0 w-56 bg-white shadow-lg rounded-lg flex flex-col items-stretch p-2 space-y-1 z-40 mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Upload Button - Navigate to Dashboard */}
            <button
              onClick={() => {
                navigate('/dashboard');
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-brand text-white rounded-lg text-base active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              Dashboard
            </button>

            <Link
              to="/settings/profile"
              onClick={closeMobileMenu}
              className="w-full px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
            >
              Profile
            </Link>
            <Link
              to="/settings/general"
              onClick={closeMobileMenu}
              className="w-full px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
            >
              Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.DEFAULT"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;