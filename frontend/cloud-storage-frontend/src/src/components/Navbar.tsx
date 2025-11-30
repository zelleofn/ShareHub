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

  // NEW: handle file uploads (mobile picker)
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      
      console.log("Selected files:", files);
      navigate('/dashboard');
    }
  };

  return (
    <header className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
      {/* Logo / App Name */}
      <Link to="/" className="text-xl font-bold text-blue-600 hover:underline">
        CloudStorage
      </Link>

      {/* Desktop Right Side */}
      <div className="hidden md:flex items-center space-x-6">
        {/* Upload Button (touch-friendly) */}
        <button
          className="bg-blue-600 text-white px-5 py-3 rounded-lg text-base hover:bg-blue-700 active:scale-95 transition"
          onClick={() => navigate('/dashboard')}
        >
          Upload
        </button>

        {/* Storage Usage */}
        <div className="text-sm text-gray-600 hidden sm:block">
          Storage: 1.2 GB / 5 GB
        </div>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 font-medium hover:underline px-3 py-2 rounded-lg active:scale-95"
            >
              {user.name}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-10">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
                <Link to="/settings/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden text-gray-700 px-3 py-2 rounded-lg active:scale-95"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-start p-4 space-y-2 md:hidden">
          {/* Mobile Upload Interface */}
          <label className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-base active:scale-95">
            Upload
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          <Link to="/profile" className="w-full px-4 py-2 hover:bg-gray-100 rounded-lg">Profile</Link>
          <Link to="/settings" className="w-full px-4 py-2 hover:bg-gray-100 rounded-lg">Settings</Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg active:scale-95"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
