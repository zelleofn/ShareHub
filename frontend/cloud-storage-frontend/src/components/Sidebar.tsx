import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

   const navItem = (label: string, path: string) => (
    <Link
      to={path}
      className={`block px-4 py-2 rounded hover:bg-blue-100 ${
        location.pathname === path ? 'bg-blue-50 font-semibold' : ''
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="hidden md:block w-64 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold text-blue-600 mb-6">CloudStorage</h2>

        <nav className="space-y-2">
        {navItem('My Files', '/dashboard')}
        {navItem('Shared with Me', '/shared')}
        {navItem('Recent Files', '/recent')}
        {navItem('Trash', '/trash')}
      </nav>

       <div className="mt-10 text-sm text-gray-600">
        <p>Storage Usage</p>
        <div className="mt-1 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-blue-500 rounded w-2/5"></div>
        </div>
        <p className="mt-1">2 GB / 5 GB</p>
      </div>

      {user && (
        <div className="mt-10 text-xs text-gray-500">
            Logged in as <span className="font-medium">{user.name}</span>
        </div>
      )}
      </aside>
  );
};

export default Sidebar;