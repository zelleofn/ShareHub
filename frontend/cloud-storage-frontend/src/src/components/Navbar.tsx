import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";
import { useState } from 'react';

const Navbar = () => {
    
    const { user, logout } = useAuth();
    const navigate = useNavigate();
   const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="w-full bg-white shadow px-6 py-4 flex items-center justify-between">
            {/*Logo / App Name*/}
            <Link to="/" className="text-xl font-bold text-blue-600 hover:underline">
            CloudStorage</Link>

            {/*Right Side*/}
            <div className="flex items-center space-x-6">

                {/*Upload Button*/}
                <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick= {() => navigate('/dashboard')} 
                >
                    Upload
                </button>

                {/*Storage Usage*/}
                <div className="text-sm text-gray-600 hidden sm:block">
                    Storage: 1.2 GB / 5 GB
                </div>

                {/*User Dropdown*/}
                {user && (
                    <div className="relative">
                        <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="text-gray-700 font-medium hover:underline"
                        >
                            {user.name}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-md z-10">
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                                    <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">Settings</Link>
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
                </header>
    );
};

export default Navbar;