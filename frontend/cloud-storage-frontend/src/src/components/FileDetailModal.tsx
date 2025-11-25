import { Dialog } from '@headlessui/react';
import type { FileDetails } from '../types/file';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  fileDetails: FileDetails;
};

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const FileDetailModal = ({ isOpen, onClose, fileDetails }: Props) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Title className="fixed inset-0 bg-black opacity-30" />

      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
        <Dialog.Title className="text-lg font-semibold mb-4">File Details</Dialog.Title>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><strong>Name:</strong> {fileDetails.name}</li>
          <li><strong>Size:</strong> {formatSize(fileDetails.size)}</li>
          <li><strong>Uploaded:</strong> {new Date(fileDetails.uploadedAt).toLocaleString()}</li>
          <li><strong>Type:</strong> {fileDetails.type}</li>
          <li><strong>Sharing:</strong> {fileDetails.sharingStatus}</li>
          <li><strong>Versions:</strong> {fileDetails.versionCount}</li>
        </ul>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default FileDetailModal;
