import { useState, useEffect } from "react";
import api from "../services/axio";
import { toast } from "react-hot-toast";
import formatSize from "../utils/formatSize";

type FileItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  deletedAt: string;
};

const TrashPage = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = () => {
    api
      .get("/trash")
      .then((res) => {
        console.log("Trash response:", res.data);
        setFiles(res.data.files || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch trash:", error);
        toast.error("Failed to load trash");
        setLoading(false);
      });
  };

  const handleRestore = (id: string) => {
    api
      .post(`/restore/${id}`)
      .then(() => {
        setFiles(files.filter((f) => f.id !== id));
        toast.success("File restored");
      })
      .catch((error) => {
        console.error("Restore error:", error);
        toast.error("Failed to restore file");
      });
  };

  const handlePermanentDelete = (id: string) => {
    if (window.confirm("Permanently delete this file?")) {
      api
        .delete(`/trash/${id}`)
        .then(() => {
          setFiles(files.filter((f) => f.id !== id));
          toast.success("File permanently deleted");
        })
        .catch((error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete file");
        });
    }
  };

  const handleEmptyTrash = () => {
    if (window.confirm("Are you sure you want to permanently delete all files in trash?")) {
      api
        .delete("/trash")
        .then(() => {
          setFiles([]);
          toast.success("Trash emptied");
        })
        .catch((error) => {
          console.error("Empty trash error:", error);
          toast.error("Failed to empty trash");
        });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkRestore = () => {
    api
      .post("/files/bulk/restore", { fileIds: selected })
      .then(() => {
        setFiles(files.filter((f) => !selected.includes(f.id)));
        setSelected([]);
        toast.success("Files restored");
      })
      .catch((error) => {
        console.error("Bulk restore error:", error);
        toast.error("Failed to restore files");
      });
  };

  const handleBulkDelete = () => {
    if (window.confirm("Permanently delete selected files?")) {
      api
        .post("/files/bulk/permanent-delete", { fileIds: selected })
        .then(() => {
          setFiles(files.filter((f) => !selected.includes(f.id)));
          setSelected([]);
          toast.success("Files permanently deleted");
        })
        .catch((error) => {
          console.error("Bulk delete error:", error);
          toast.error("Failed to delete files");
        });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Trash ({files.length})</h2>

      {files.length > 0 && (
        <button
          onClick={handleEmptyTrash}
          className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Empty Trash
        </button>
      )}

      {loading ? (
        <p className="text-gray-500">Loading trash...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">Trash is empty</p>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div key={file.id} className="border p-4 rounded flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatSize(file.size)} • Deleted on {new Date(file.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handleRestore(file.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(file.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <input
                  type="checkbox"
                  checked={selected.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded flex gap-2 justify-between items-center">
          <p className="font-medium">{selected.length} file(s) selected</p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkRestore}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Restore Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashPage;