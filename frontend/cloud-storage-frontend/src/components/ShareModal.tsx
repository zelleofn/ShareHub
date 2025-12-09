import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';


type Props = {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  currentShareUrl?: string;
};

const ShareModal = ({ isOpen, onClose, fileId, currentShareUrl }: Props) => {
  const [shareUrl, setShareUrl] = useState<string | undefined>(currentShareUrl);
  const [loading, setLoading] = useState(false);

const handleGenerateLink = async () => {
  setLoading(true);
  try {
    const res = await axios.post(`/share/${fileId}`);
    setShareUrl(res.data.shareUrl);
    toast.success("Share link generated");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Failed to generate share link");
    } else {
      toast.error("Unexpected error occurred");
    }
  } finally {
    setLoading(false);
  }
};

const handleCopyLink = async () => {
  if (!shareUrl) {
    toast.error("No link available to copy");
    return;
  }
  await navigator.clipboard.writeText(shareUrl);
  toast.success("Link copied to clipboard");
};
const handleRevokeLink = async () => {
  setLoading(true);
  try {
    await axios.post(`/unshare/${fileId}`);
    setShareUrl(undefined);
    toast.success("Share link revoked");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      toast.error(err.response?.data?.message || "Failed to revoke share link");
    } else {
      toast.error("Unexpected error occurred");
    }
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
        <Dialog.Title className="text-lg font-semibold mb-4">Share File</Dialog.Title>

        {shareUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">Active Share Link:</p>
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="w-full border rounded px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy Link
              </button>
              <button
                onClick={handleRevokeLink}
                disabled={loading}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Revoking...' : 'Revoke Link'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Shareable Link'}
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default ShareModal;
