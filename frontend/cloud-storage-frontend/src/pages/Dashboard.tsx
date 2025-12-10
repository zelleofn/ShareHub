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

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const fetchFiles = () => {
    console.log('Fetching files...');
    api
      .get('/files')
      .then((response) => {
        console.log('Files response:', response.data);
        const filesList = response.data.files || [];
        console.log('Files count:', filesList.length);
        setFiles(filesList);
        setFilteredFiles(filesList);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch files:', error);
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
      result = result.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterType) {
      result = result.filter((file) => file.type.includes(filterType));
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
      result.sort((a, b) => new Date(b.uploadAt).getTime() - new Date(a.uploadAt).getTime());
    } else if (sortBy === 'type') {
      result.sort((a, b) => a.type.localeCompare(b.type));
    }

    setFilteredFiles(result);
  }, [searchQuery, filterType, dateRange, sizeRange, shared, sortBy, files]);

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>{' '}
        / <span className="text-gray-700">Dashboard</span>
      </nav>

      {/* Header + Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Files ({filteredFiles.length})</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            List
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Controls */}
      <FileSearchFilter
        onSearch={(query) => setSearchQuery(query)}
        onFilter={(filters) => {
          if (filters.type) setFilterType(filters.type);
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

      {/* Upload Component */}
      <Upload
        onUploadSuccess={() => {
          console.log('Upload successful, refetching files...');
          fetchFiles();
        }}
      />

      {/* Storage Usage */}
      <StorageUsage />

      {/* File Display */}
      {loading ? (
        files.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-10 w-10 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p className="ml-3 text-gray-600">Loading your files...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )
      ) : !filteredFiles || filteredFiles.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No files found. Upload something to get started!
        </div>
      ) : (
        <div
          className={`grid ${
            viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'grid-cols-1'
          } transition-all`}
        >
          {filteredFiles?.map((file) => (
            <div key={file.id} className="bg-white border rounded p-4 shadow hover:shadow-md">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatSize(Number(file.size))} • {new Date(file.uploadAt).toLocaleDateString()} •{' '}
                {file.shared ? 'Shared' : 'Private'}
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
  );
};

export default Dashboard;