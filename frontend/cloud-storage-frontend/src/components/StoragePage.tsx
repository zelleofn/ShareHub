import { useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from '../services/api';
import { toast } from 'react-hot-toast';
import formatSize from '../utils/formatSize';
import type { FileDetails } from '../types/file';
import { mapFileToDetails } from '../utils/fileMapper';
import FileSearch from '../components/FileSearch';

const FileDetailModal = lazy(() => import('../components/FileDetailModal'));

type StorageStats = {
  totalFiles: number;
  totalVersions: number;
  averageSize: number;
  largestSize: number;
  smallestSize: number;
  lastUpload: string | null;
  used: number;
  total: number;
  percentage: number;
};

type Breakdown = Record<string, number>;

type CleanupSuggestion = {
  id: string;
  name: string;
  reason: string;
};

const StoragePage = () => {
  const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['storageStats'],
    queryFn: async () => {
      const res = await axios.get('/storage/statistics');
      return res.data as StorageStats;
    },
  });

  const { data: largestFiles = [], isLoading: largestLoading } = useQuery({
    queryKey: ['largestFiles'],
    queryFn: async () => {
      const res = await axios.get('/storage/largest');
      return res.data.map(mapFileToDetails) as FileDetails[];
    },
  });

  const { data: breakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ['breakdown'],
    queryFn: async () => {
      const res = await axios.get('/storage/breakdown');
      return res.data as Breakdown;
    },
  });

  const { data: suggestions = [], isLoading: cleanupLoading } = useQuery({
    queryKey: ['cleanupSuggestions'],
    queryFn: async () => {
      const res = await axios.get('/storage/cleanup');
      return res.data as CleanupSuggestion[];
    },
  });

  const sortedLargestFiles = useMemo(
    () => [...largestFiles].sort((a, b) => b.size - a.size),
    [largestFiles]
  );

  const formattedBreakdown = useMemo(
    () =>
      breakdown
        ? Object.entries(breakdown).map(([type, size]) => ({
            type: type.toUpperCase(),
            size: formatSize(size),
          }))
        : [],
    [breakdown]
  );

  const handleFileClick = useCallback((file: FileDetails) => {
    setSelectedFile(file);
  }, []);

  if (statsLoading || largestLoading || breakdownLoading || cleanupLoading) {
    return <p className="text-gray-500">Loading storage data...</p>;
  }
  if (statsError) {
    toast.error('Failed to load storage data');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Storage Settings</h1>

      {/* Detailed Statistics */}
      {stats && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Detailed Statistics</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Total Files: {stats.totalFiles}</li>
            <li>Total Versions: {stats.totalVersions}</li>
            <li>Average Size: {formatSize(stats.averageSize)}</li>
            <li>Largest File: {formatSize(stats.largestSize)}</li>
            <li>Smallest File: {formatSize(stats.smallestSize)}</li>
            <li>
              Last Upload: {stats.lastUpload ? new Date(stats.lastUpload).toLocaleString() : 'N/A'}
            </li>
            <li>
              Used: {formatSize(stats.used)} / {formatSize(stats.total)} ({stats.percentage}%)
            </li>
          </ul>
        </div>
      )}

      {/* Largest Files */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Largest Files</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {sortedLargestFiles.map((file) => (
            <li
              key={file.id}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => handleFileClick(file)}
            >
              {/* Thumbnail preview with lazy loading */}
              <img
                src={`/files/${file.id}/thumbnail`}
                alt={file.name}
                loading="lazy"
                className="rounded shadow w-12 h-12 object-cover"
              />
              <span>
                {file.name} — {formatSize(file.size)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* New Search Files Section */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Search Files</h2>
        <FileSearch />
      </div>

      {/* File Type Breakdown */}
      {breakdown && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">File Type Breakdown</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {formattedBreakdown.map(({ type, size }) => (
              <li key={type} className="flex justify-between">
                <span>{type}</span>
                <span>{size}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cleanup Suggestions */}
      <div className="bg-white border rounded p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Cleanup Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions at this time.</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestions.map((s) => (
              <li key={s.id}>
                {s.name} — {s.reason}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Search Files</h2>
        <FileSearch onFileClick={setSelectedFile} />
      </div>

      {/* Lazy-loaded FileDetailModal */}
      <Suspense fallback={<div>Loading file details...</div>}>
        {selectedFile && (
          <FileDetailModal
            isOpen={true}
            onClose={() => setSelectedFile(null)}
            fileDetails={selectedFile}
          />
        )}
      </Suspense>
    </div>
  );
};

export default StoragePage;
