import { useState } from 'react';
import ShareModal from './ShareModal';
import { toast } from 'react-hot-toast';

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
        onClick={handleDownload} 
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
>
          Download
      </button>

      {/* Share button now opens ShareModal */}
      <button
        onClick={() => setIsShareOpen(true)}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Share
      </button>

      <button
        onClick={onTrash}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        Move to Trash
      </button>
      <button
        onClick={onDetails}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
      >
        View Details
      </button>
      <button
        onClick={onVersionHistory}
        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
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
    </div>
  );
};

export default FileActionsMenu;
