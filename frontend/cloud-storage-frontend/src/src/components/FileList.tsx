import { useState } from 'react';
import FileItem from './FileItem';
import axios from 'axios';
import toast from 'react-hot-toast';

type File = {
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
};

const FileList = ({ files }: { files: File[] }) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((f) => f.id));
    }
  };

  const handleBulkDownload = async () => {
      try{
        const response = await axios.post(
            '/files/bulk/download',
            { fileIds: selectedFiles},
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

const handleBulkDelete = async () => {
  try {
    await axios.delete('/files/bulk/delete', {
      data: { fileIds: selectedFiles },
    });
    toast.success('Files deleted successfully');
    setSelectedFiles([]);
  } catch (error) {
    console.error('Bulk delete error:', error);
    toast.error('Failed to delete files');
  }
};

  const handleBulkMove = async (destinationFolderId: string) => {
    try {
        await axios.post('/files/bulk/move', {
            fileIds: selectedFiles,
            destination: destinationFolderId
        });
        toast.success('Files moved successfully');
        setSelectedFiles([]);
    } catch (error) {
        console.error('Bulk move error:', error);
        toast.error('Failed to move files');
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
          {/* ✅ Step 5: Selection Counter */}
          <span className="text-sm text-gray-600">
            {selectedFiles.length} selected
          </span>
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
        </div>
      </div>

      {/* File Items */}
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          selected={selectedFiles.includes(file.id)}
          onSelect={() => toggleSelect(file.id)}
        />
      ))}
    </div>
  );
};

export default FileList;