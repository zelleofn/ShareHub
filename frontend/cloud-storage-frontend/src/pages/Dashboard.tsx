import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import FileSearchFilter from '../../src/components/FileSearchFilter';
import api from '../services/axio';
import StorageUsage from '../components/StorageUsage';
import formatSize from '../utils/formatSize';
import Upload from '../components/Upload';

type FileItem = {
  name: string;
  size: string;
  type: string;
  id: string;
  uploadAt: string;
  shared: boolean;
};

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [sizeRange, setSizeRange] = useState<[number, number]>([0, 0]);
  const [shared, setShared] = useState<boolean | undefined>(undefined);
  const [refreshStorage, setRefreshStorage] = useState(0);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchFiles = () => {
    api
      .get('/files')
      .then((response) => {
        const filesList = response.data.files || [];
        setFiles(filesList);
        setFilteredFiles(filesList);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to fetch files');
        setFiles([]);
        setFilteredFiles([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const restoreFile = async (fileId: string) => {
    try {
      await api.patch(`/files/${fileId}/restore`);
      fetchFiles();
      setRefreshStorage((prev) => prev + 1);
      toast.success('File restored');
    } catch {
      toast.error('Failed to restore file');
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setFilteredFiles((prev) => prev.filter((f) => f.id !== fileId));
      setRefreshStorage((prev) => prev + 1);

      toast(
        (t) => (
          <span>
            File deleted
            <button
              onClick={() => {
                restoreFile(fileId);
                toast.dismiss(t.id);
              }}
              className="ml-2 text-blue-500 underline"
            >
              Undo
            </button>
          </span>
        ),
        { duration: 4000 }
      );
    } catch {
      toast.error('Failed to delete file');
    }
  };

  useEffect(() => {
    let result = [...files];

    if (searchQuery) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType && filterType !== '') {
      result = result.filter(
        (file) => file.type?.toLowerCase() === filterType.toLowerCase()
      );
    }

    if (dateRange && (dateRange[0] || dateRange[1])) {
      const [from, to] = dateRange;
      result = result.filter((file) => {
        const uploaded = new Date(file.uploadAt).getTime();
        return (
          (!from || uploaded >= new Date(from).getTime()) &&
          (!to || uploaded <= new Date(to).getTime())
        );
      });
    }

    if (sizeRange && (sizeRange[0] || sizeRange[1])) {
      const [min, max] = sizeRange;
      result = result.filter((file) => {
        const size = Number(file.size);
        return (!min || size >= min) && (!max || size <= max);
      });
    }

    if (shared !== undefined && shared !== null) {
      result = result.filter((file) => file.shared === shared);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      result.sort((a, b) => Number(a.size) - Number(b.size));
    } else if (sortBy === 'date') {
      result.sort(
        (a, b) =>
          new Date(b.uploadAt).getTime() - new Date(a.uploadAt).getTime()
      );
    } else if (sortBy === 'type') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    }

    setFilteredFiles(result);
  }, [searchQuery, filterType, dateRange, sizeRange, shared, sortBy, files]);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">Home</Link> / <span className="text-gray-700">Dashboard</span>
      </nav>

      {/* ROW 1: Search | Buttons + Upload | Storage */}
      <div className="flex items-start mb-12" style={{ gap: '100px' }}>
        {/* Left: File Search Filter */}
        <div className="flex-shrink-0 bg-white rounded-lg p-8 shadow">
          <FileSearchFilter
            onSearch={(query) => setSearchQuery(query)}
            onFilter={(filters) => {
              setFilterType(filters.type || '');
              if (filters.dateRange) setDateRange(filters.dateRange);
              if (filters.sizeRange) setSizeRange(filters.sizeRange);
              if (filters.shared !== undefined) setShared(filters.shared);
            }}
            onSort={(sort) => setSortBy(sort)}
            onClear={() => {
              setSearchQuery('');
              setFilterType('');
              setSortBy('');
              setDateRange(['', '']);
              setSizeRange([0, 0]);
              setShared(undefined);
              setFilteredFiles(files);
            }}
          />
        </div>

        {/* Center: View Mode Buttons + Upload */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center gap-6">
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-5 py-2 rounded text-sm font-medium transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-2 rounded text-sm font-medium transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              List
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          <Upload
            onUploadSuccess={() => {
              fetchFiles();
              setRefreshStorage((prev) => prev + 1);
            }}
          />
        </div>

        {/* Right: Storage Usage */}
        <div className="flex-shrink-0">
          <StorageUsage refresh={refreshStorage} />
        </div>
      </div>

      {/* ROW 2: File Display (Full Width) */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          My Files ({filteredFiles.length})
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="ml-3 text-gray-600">Loading your files...</p>
          </div>
        ) : !filteredFiles || filteredFiles.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No files found. Upload something to get started!
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid-cols-1'} transition-all`}>
            {filteredFiles.map((file) => (
              <div key={file.id} className="bg-white border rounded p-4 shadow hover:shadow-md">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatSize(Number(file.size))} • {file.uploadAt ? new Date(file.uploadAt).toLocaleDateString() : 'Unknown'} • {file.shared ? 'Shared' : 'Private'}
                </p>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="mt-2 text-red-500 text-sm hover:underline"
                >
                  Move to Trash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;