import { Dialog } from '@headlessui/react';
import type { FileDetails } from '../types/file';
import { ConfirmDialog } from "./uiConfirmDialog";
import axios from "../utils/axiosConfig";
import toast from "react-hot-toast";
import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";



type Props = {
  isOpen: boolean;
  onClose: () => void;
  fileDetails: FileDetails;   
  onDelete?: (id: string) => Promise<void> | void; 
};


const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const FileDetailModal = ({ isOpen, onClose, fileDetails, onDelete }: Props) => {
const [confirmRemove, setConfirmRemove] = useState(false);



const handleDelete = async (fileId: string) => {
  try {
    await axios.delete(`/files/${fileId}`);
    toast.success("File deleted successfully");

    if (onDelete) {
      onDelete(fileId); 
    }

    onClose();
  } catch (error) {
    console.error("Delete error:", error);
    toast.error("Failed to delete file");
  }
};

  
  return (
  <Dialog
    open={isOpen}
    onClose={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center"
  >
    {/* Overlay with fade transition */}
    <Dialog.Title className="fixed inset-0 bg-black transition-opacity duration-300 opacity-30" />

    {/* Modal container with fade/slide transition */}
    <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md 
                    transform transition-transform duration-300 ease-out">
      <Dialog.Title className="text-lg font-semibold mb-4 text-text.DEFAULT">
        File Details
      </Dialog.Title>

      {/* Accessible contrast for body text */}
      <ul className="space-y-2 text-sm text-text.DEFAULT">
        <li><strong>Name:</strong> {fileDetails.name}</li>
        <li><strong>Size:</strong> {formatSize(fileDetails.size)}</li>
        <li><strong>Uploaded:</strong> {new Date(fileDetails.uploadedAt).toLocaleString()}</li>
        <li><strong>Type:</strong> {fileDetails.type}</li>
        <li><strong>Sharing:</strong> {fileDetails.sharingStatus}</li>
        <li><strong>Versions:</strong> {fileDetails.versionCount}</li>
      </ul>
    
      {/* Preview section */}
        <div className="mt-4">
          <FilePreviewModal fileId={fileDetails.id} mimeType={fileDetails.mimetype} />
        </div>


      {/* Footer buttons with brand colors + focus states */}
      <div className="mt-6 flex justify-end space-x-2">
        <button
          tabIndex={0}
          onClick={onClose}
          className="px-4 py-2 bg-brand text-white rounded 
                     hover:bg-brand-dark transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-brand-light"
        >
          Close
        </button>

        <button
          tabIndex={0}
          onClick={() => setConfirmRemove(true)} 
          className="px-4 py-2 bg-danger text-white rounded 
                     hover:bg-danger-dark transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-danger"
        >
          Delete
        </button>
      </div>
    </div>

    {/* Confirmation dialog for destructive action */}
    {confirmRemove && (
  <ConfirmDialog
    message={`Delete ${fileDetails.name}?`}
    onConfirm={() => {
      handleDelete(fileDetails.id);
      setConfirmRemove(false);
    }}
    onCancel={() => setConfirmRemove(false)}
  />
)}

  </Dialog>
);
};

export default FileDetailModal;
