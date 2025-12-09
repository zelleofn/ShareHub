import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

type FileVersion = {
  version: number;
  uploadDate: string;
  size: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
};

const VersionHistoryModal = ({ isOpen, onClose, fileId }: Props) => {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchVersions = async () => {
      try {
        const res = await axios.get(`/versions/${fileId}`);
        setVersions(res.data);
      } catch {
        toast.error('Failed to load version history');
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, [isOpen, fileId]);

  const handleDownload = async (version: number) => {
    try {
      const res = await axios.get(`/versions/${fileId}/download/${version}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `file_v${version}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Version ${version} download started`);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleRestore = async (version: number) => {
    try {
      await axios.post(`/versions/${fileId}/restore/${version}`);
      toast.success(`Version ${version} restored`);
    } catch {
      toast.error('Restore failed');
    }
  };

  const handleDelete = async (version: number) => {
    const confirmed = window.confirm(`Delete version ${version}?`);
    if (!confirmed) return;
    try {
      await axios.delete(`/versions/${fileId}/${version}`);
      setVersions((prev) => prev.filter((v) => v.version !== version));
      toast.success(`Version ${version} deleted`);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-lg">
        <Dialog.Title className="text-lg font-semibold mb-4">Version History</Dialog.Title>

        {loading ? (
          <p>Loading...</p>
        ) : versions.length === 0 ? (
          <p>No versions available</p>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 text-left">Version</th>
                <th className="px-2 py-1 text-left">Date</th>
                <th className="px-2 py-1 text-left">Size</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr key={v.version} className="border-t">
                  <td className="px-2 py-1">{v.version}</td>
                  <td className="px-2 py-1">{new Date(v.uploadDate).toLocaleString()}</td>
                  <td className="px-2 py-1">{(v.size / 1024).toFixed(1)} KB</td>
                  <td className="px-2 py-1 flex gap-2">
                    <button
                      onClick={() => handleDownload(v.version)}
                      className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleRestore(v.version)}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(v.version)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default VersionHistoryModal;
