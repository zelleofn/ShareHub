import { useNavigate } from 'react-router-dom';
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
        {/* Dashboard Button */}
        <button
          className="bg-brand text-white px-5 py-3 rounded-lg text-base hover:bg-brand-dark active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>

        {/* Trash Button */}
        <button
          className="bg-red-500 text-white px-5 py-3 rounded-lg text-base hover:bg-red-600 active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={() => navigate('/trash')}
        >
          Trash
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-md z-10 space-y-1 p-2">
                <button
                  onClick={() => {
                    navigate('/settings/profile');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/settings/general');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate('/trash');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
                >
                  Trash
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
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
            {/* Mobile Dashboard Button */}
            <button
              onClick={() => {
                navigate('/dashboard');
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-brand text-white rounded-lg text-base active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              Dashboard
            </button>

            {/* Mobile Trash Button */}
            <button
              onClick={() => {
                navigate('/trash');
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg text-base active:scale-95 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              Trash
            </button>

            <button
              onClick={() => {
                navigate('/settings/profile');
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              Profile
            </button>
            <button
              onClick={() => {
                navigate('/settings/general');
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              Settings
            </button>
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg transition-colors duration-200 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
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