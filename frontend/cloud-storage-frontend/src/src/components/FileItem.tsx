import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MoreVertical } from 'lucide-react';
import { getFileIcon } from '../utils/getFileIcon';
import FileActionsMenu from './FileActionsMenu';
import FileDetailModal from './FileDetailModal'; 
import VersionHistoryModal from './VersionHistoryModal'; 
import type { FileDetails } from '../types/file';

type Props = {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  };
  selected: boolean;
  onSelect: () => void;
};

const FileItem = ({ file, selected, onSelect }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);

  const formatSize = (bytes: number) =>
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await axios.get(`/download/${file.id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await axios.post(`/share/${file.id}`);
      await navigator.clipboard.writeText(res.data.link);
      toast.success('Share link copied to clipboard');
    } catch {
      toast.error('Failed to generate share link');
    }
  };

  const handleTrash = async () => {
    const confirmed = window.confirm(`Move "${file.name}" to trash?`);
    if (!confirmed) return;

    try {
      await axios.patch(`/files/${file.id}/trash`);

      toast((t) => (
        <span>
          Moved to trash
          <button
            onClick={async () => {
              try {
                await axios.patch(`/files/${file.id}/restore`);
                toast.success('File restored');
                toast.dismiss(t.id);
              } catch {
                toast.error('Undo failed');
              }
            }}
            className="ml-2 text-blue-600 underline"
          >
            Undo
          </button>
        </span>
      ), {
        duration: 5000
      });

    } catch {
      toast.error('Failed to move file to trash');
    }
  };

  const handleDetails = async () => {
    try {
      const res = await axios.get(`/files/${file.id}`);
      setFileDetails(res.data);
      setShowDetailsModal(true);
    } catch {
      toast.error('Failed to fetch file details');
    }
  };

  const handleVersionHistory = () => {
    setShowVersionModal(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded shadow-sm hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={selected} onChange={onSelect} />
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
            {getFileIcon(file.type)}
          </div>
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              {formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
            {downloading && (
              <p className="text-xs text-blue-500 animate-pulse mt-1">Downloading...</p>
            )}
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
          {showMenu && (
            <FileActionsMenu
              fileId={file.id}
              onDownload={() => {
                setShowMenu(false);
                handleDownload();
              }}
              onShare={() => {
                setShowMenu(false);
                handleShare();
              }}
              onTrash={() => {
                setShowMenu(false);
                handleTrash();
              }}
              onDetails={() => {
                setShowMenu(false);
                handleDetails();
              }}
              onVersionHistory={() => {
                setShowMenu(false);
                handleVersionHistory();
              }}
            />
          )}
        </div>
      </div>

      {showDetailsModal && fileDetails && (
        <FileDetailModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          fileDetails={fileDetails}
        />
      )}

      {showVersionModal && (
        <VersionHistoryModal
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          fileId={file.id}
        />
      )}
    </>
  );
};

export default FileItem;
