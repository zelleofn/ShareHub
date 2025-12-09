import { useState } from 'react';
import ShareModal from './ShareModal';
import { toast } from 'react-hot-toast';
import { ConfirmDialog } from "./uiConfirmDialog";

type Props = {
  onDownload: () => void;
  onTrash: () => void;
  onShare: () => void;
  onDetails: () => void;
  onVersionHistory: () => void;
  fileId: string;
  currentShareUrl?: string;
};

const FileActionsMenu = ({
  onDownload,
  onTrash,
  onDetails,
  onVersionHistory,
  fileId,
  currentShareUrl,
}: Props) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);


  const handleDownload = async () => {
    toast.loading('Download started...');
    try {
      await onDownload();
      toast.success('Download completed!');
    } catch (error) {
      console.error(error)
      toast.error('Download failed!');
    }
  }

  return (
  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
    <button
      tabIndex={0}
      onClick={handleDownload}
      className="block w-full px-4 py-2 text-left text-text.subtle hover:bg-gray-100 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
    >
      Download
    </button>

    {/* Share button now opens ShareModal */}
    <button
      tabIndex={0}
      onClick={() => setIsShareOpen(true)}
      className="block w-full px-4 py-2 text-left text-text.subtle hover:bg-gray-100 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
    >
      Share
    </button>

    <button
      tabIndex={0}
      onClick={() => setConfirmRemove(true)} 
      className="block w-full px-4 py-2 text-left text-danger hover:bg-red-50 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-danger"
    >
      Move to Trash
    </button>

    <button
      tabIndex={0}
      onClick={onDetails}
      className="block w-full px-4 py-2 text-left text-text.subtle hover:bg-gray-100 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
    >
      View Details
    </button>

    <button
      tabIndex={0}
      onClick={onVersionHistory}
      className="block w-full px-4 py-2 text-left text-text.subtle hover:bg-gray-100 
                 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
    >
      Version History
    </button>

    {/* Share Modal integration */}
    <ShareModal
      isOpen={isShareOpen}
      onClose={() => setIsShareOpen(false)}
      fileId={fileId}
      currentShareUrl={currentShareUrl}
    />

    {/* Confirm Remove Dialog */}
    {confirmRemove && (
      <ConfirmDialog
        message="Move this file to Trash?"
        onConfirm={() => {
          onTrash();
          setConfirmRemove(false);
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    )}
  </div>
);
};


export default FileActionsMenu;
