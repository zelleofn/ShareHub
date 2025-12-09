import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MoreVertical } from 'lucide-react';
import { getFileIcon } from '../utils/getFileIcon';
import FileActionsMenu from './FileActionsMenu';
import FileDetailModal from './FileDetailModal';
import VersionHistoryModal from './VersionHistoryModal';
import type { FileDetails } from '../types/file';
import { ConfirmDialog } from './uiConfirmDialog';

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
  onOpenDetails: () => void;
};

const FileItem = ({ file, selected, onSelect }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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
      toast.success('Moved to trash');
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
  };

  return (
    <>
      <div
        tabIndex={0}
        className="flex items-center justify-between p-4 border rounded shadow-sm hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
        onContextMenu={handleContextMenu} // NEW
      >
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={selected} onChange={onSelect} />
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded transition-colors duration-200">
            {getFileIcon(file.type)}
          </div>
          <div>
            <p className="font-medium text-text.DEFAULT">{file.name}</p>
            <p className="text-sm text-text.subtle">
              {formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
            {downloading && <p className="text-xs text-brand animate-pulse mt-1">Downloading...</p>}
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="w-5 h-5 text-text.subtle transition-colors duration-200" />
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
                setConfirmRemove(true);
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

      {/*Context Menu */}
      {contextMenu && (
        <ul
          className="absolute bg-white border rounded shadow-md z-20 transition-opacity duration-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <li
            tabIndex={0}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.subtle"
            onClick={() => {
              handleDownload();
              setContextMenu(null);
            }}
          >
            Download
          </li>
          <li
            tabIndex={0}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.subtle"
            onClick={() => {
              handleShare();
              setContextMenu(null);
            }}
          >
            Share
          </li>
          <li
            tabIndex={0}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.subtle"
            onClick={() => {
              handleDetails();
              setContextMenu(null);
            }}
          >
            Details
          </li>
          <li
            tabIndex={0}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light text-text.subtle"
            onClick={() => {
              handleVersionHistory();
              setContextMenu(null);
            }}
          >
            Version History
          </li>
          <li
            tabIndex={0}
            className="px-4 py-2 hover:bg-red-50 cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-danger text-danger"
            onClick={() => {
              setConfirmRemove(true);
              setContextMenu(null);
            }}
          >
            Delete
          </li>
        </ul>
      )}

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

      {/* Confirm Remove Dialog */}
      {confirmRemove && (
        <ConfirmDialog
          message={`Delete ${file.name}?`}
          onConfirm={() => {
            handleTrash();
            setConfirmRemove(false);
          }}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
    </>
  );
};

export default FileItem;
