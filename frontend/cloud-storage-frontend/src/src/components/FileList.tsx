import { useState, useEffect } from "react";
import FileItem from "./FileItem";
import axios from "../utils/axiosConfig";
import toast from "react-hot-toast";

type File = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

type FilesResponse = {
  files: File[];
  nextOffset: number;
  hasMore: boolean;
};


const fetchWithRetry = async (
  url: string,
  retries = 3
): Promise<import("axios").AxiosResponse<FilesResponse>> => {
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
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

 
const loadFiles = async () => {
  if (!hasMore) return;
  setLoading(true);
  setError(false);

  try {
    const res = await fetchWithRetry(`/files?limit=50&offset=${offset}`);
    setFiles(prev => [...prev, ...res.data.files]);
    setOffset(res.data.nextOffset);
    setHasMore(res.data.hasMore);
  } catch (err) {
    console.error("File load error:", err);
    setError(true);
    toast.error("Failed to load files after retries");
  } finally {
    setLoading(false);
  }
};



useEffect(() => {
  const fetchFiles = async () => {
    try {
      const res = await fetchWithRetry(`/files?limit=50&offset=0`);
      setFiles(res.data.files);
      setOffset(res.data.nextOffset);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error("Initial fetch error:", err);
      setError(true);
      toast.error("Failed to fetch files after retries");
    }
  };

  fetchFiles();
}, []);


useEffect(() => {
  const handleOffline = () => toast.error("You are offline");
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("offline", handleOffline);
  };
}, []);


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
    try {
      const response = await axios.post(
        "/files/bulk/download",
        { fileIds: selectedFiles },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "files.zip";
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Bulk download started");
    } catch (error) {
      console.error("Bulk download error:", error);
      toast.error("Bulk download failed");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.delete("/files/bulk/delete", {
        data: { fileIds: selectedFiles },
      });
      toast.success("Files deleted successfully");
      setSelectedFiles([]);
    
      setFiles((prev) => prev.filter((f) => !selectedFiles.includes(f.id)));
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete files");
    }
  };

  const handleBulkMove = async (destinationFolderId: string) => {
    try {
      await axios.post("/files/bulk/move", {
        fileIds: selectedFiles,
        destination: destinationFolderId,
      });
      toast.success("Files moved successfully");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Bulk move error:", error);
      toast.error("Failed to move files");
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
          onClick={() => handleBulkMove("archive")}
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
          {loading ? "Loading..." : "Load More"}
        </button>

        {/* Retry button */}
        {error && (
          <button
            onClick={loadFiles}
            className="px-3 py-1 bg-red-600 text-white rounded"
          >
            Retry
          </button>
        )}
      </div>
    </div>

    {/* Error message */}
    {error && !loading && (
      <p className="text-red-500 mb-4">Could not load files. Please retry.</p>
    )}

    {/* File Items */}
    {files.map((file) => (
      <FileItem
        key={file.id}
        file={file}
        selected={selectedFiles.includes(file.id)}
        onSelect={() => toggleSelect(file.id)}
      />
    ))}

    {/* Graceful fallback */}
    {files.length === 0 && !loading && (
      <p className="text-gray-500">No files available</p>
    )}
  </div>
);
};

export default FileList;

