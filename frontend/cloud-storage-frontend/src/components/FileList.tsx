import { useState, useEffect } from 'react';
import FileItem from './FileItem';
import axios from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FileDetailModal from './FileDetailModal';

import FileListView from './FileListView';

type File = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  sharingStatus?: string;
  versionCount?: number;
};

export type FileItem = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  type: string;
  sharingStatus: string;
  versionCount: number;
  mimetype: string;
};

type FilesResponse = {
  files: File[];
  nextOffset: number;
  hasMore: boolean;
};

const fetchWithRetry = async (
  url: string,
  retries = 3
): Promise<import('axios').AxiosResponse<FilesResponse>> => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get<FilesResponse>(url);
    } catch (err) {
      lastError = err;
      if (i === retries - 1) throw lastError;
    }
  }
  throw lastError;
};

const FileList = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const loadFiles = async () => {
    if (!hasMore) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetchWithRetry(`/files?limit=50&offset=${offset}`);

      const normalized: FileItem[] = res.data.files.map((d: File) => ({
        id: d.id,
        name: d.name,
        size: d.size,
        uploadedAt: d.uploadedAt,
        type: d.type,
        mimetype: d.type,
        sharingStatus: d.sharingStatus ?? 'private',
        versionCount: d.versionCount ?? 1,
      }));

      setFiles((prev) => [...prev, ...normalized]);
      setOffset(res.data.nextOffset);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error('File load error:', err);
      setError(true);
      toast.error('Failed to load files after retries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetchWithRetry(`/files?limit=50&offset=0`);

        const normalized: FileItem[] = res.data.files.map((d: File) => ({
          id: d.id,
          name: d.name,
          size: d.size,
          uploadedAt: d.uploadedAt,
          type: d.type,
          mimetype: d.type,
          sharingStatus: d.sharingStatus ?? 'private',
          versionCount: d.versionCount ?? 1,
        }));

        setFiles(normalized);
        setOffset(res.data.nextOffset);
        setHasMore(res.data.hasMore);
      } catch (err) {
        console.error('Initial fetch error:', err);
        setError(true);
        toast.error('Failed to fetch files after retries');
      }
    };

    fetchFiles();
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  }, [selectedFiles, files]);

  const handleBulkDelete = useCallback(async () => {
    try {
      await axios.delete('/files/bulk/delete', {
        data: { fileIds: selectedFiles },
      });
      toast.success('Files deleted successfully');
      setSelectedFiles([]);
      setFiles((prev) => prev.filter((f) => !selectedFiles.includes(f.id)));
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete files');
    }
  }, [selectedFiles]);

  useEffect(() => {
    const handleOffline = () => toast.error('You are offline');
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggleSelectAll();
      }

      if (e.key === 'Delete' && selectedFiles.length > 0) {
        handleBulkDelete();
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();

        navigate('/upload');
      }

      if (e.key === 'Escape') {
        setSelectedFiles([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFiles, navigate, toggleSelectAll, handleBulkDelete]);

  const toggleSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = async () => {
    try {
      const response = await axios.post(
        '/files/bulk/download',
        { fileIds: selectedFiles },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'files.zip';
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Bulk download started');
    } catch (error) {
      console.error('Bulk download error:', error);
      toast.error('Bulk download failed');
    }
  };

  const handleBulkMove = async (destinationFolderId: string) => {
    try {
      await axios.post('/files/bulk/move', {
        fileIds: selectedFiles,
        destination: destinationFolderId,
      });
      toast.success('Files moved successfully');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Bulk move error:', error);
      toast.error('Failed to move files');
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axios.delete(`/files/${fileId}`);
      toast.success('File deleted successfully');

      setFiles((prev) => prev.filter((f) => f.id !== fileId));

      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete file');
    }
  };

  return (
    <div>
      {/* Bulk Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedFiles.length === files.length && files.length > 0}
            onChange={toggleSelectAll}
          />
          <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleBulkDownload}
            disabled={selectedFiles.length === 0}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Download Zip
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedFiles.length === 0}
            className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
          >
            Delete
          </button>
          <button
            onClick={() => handleBulkMove('archive')}
            disabled={selectedFiles.length === 0}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Move
          </button>
          <button
            onClick={loadFiles}
            disabled={!hasMore || loading}
            className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>

          {/* Retry button */}
          {error && (
            <button onClick={loadFiles} className="px-3 py-1 bg-red-600 text-white rounded">
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && !loading && (
        <p className="text-red-500 mb-4">Could not load files. Please retry.</p>
      )}

      {/* File Items in Responsive Grid */}
      <FileListView
        files={files}
        onFileClick={(file) => setSelectedFile(file)}
        onSelect={(id) => toggleSelect(id)}
        selectedIds={selectedFiles}
      />

      {/* Graceful fallback */}
      {files.length === 0 && !loading && <p className="text-gray-500">No files available</p>}

      {/* File detail modal */}
      {selectedFile && (
        <FileDetailModal
          isOpen={true}
          onClose={() => setSelectedFile(null)}
          fileDetails={selectedFile}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default FileList;
