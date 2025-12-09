import { useState, useEffect } from "react";
import axios from "axios";

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
    axios.get("/files?deleted=true").then((res) => {
      setFiles(res.data);
      setLoading(false);
    });
  }, []);

  const handleRestore = (id: string) => {
    axios.patch(`/files/${id}/restore`).then(() => {
      setFiles(files.filter((f) => f.id !== id));
    });
  };

  const handlePermanentDelete = (id: string) => {
    axios.delete(`/files/${id}/permanent`).then(() => {
      setFiles(files.filter((f) => f.id !== id));
    });
  };

  const handleEmptyTrash = () => {
    if (window.confirm("Are you sure you want to empty the trash?")) {
      axios.post("/files/bulk-delete", { ids: files.map((f) => f.id) }).then(() => {
        setFiles([]);
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkRestore = () => {
    axios.post("/files/bulk-restore", { ids: selected }).then(() => {
      setFiles(files.filter((f) => !selected.includes(f.id)));
      setSelected([]);
    });
  };

  const handleBulkDelete = () => {
    axios.post("/files/bulk-delete", { ids: selected }).then(() => {
      setFiles(files.filter((f) => !selected.includes(f.id)));
      setSelected([]);
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Trash ({files.length})</h2>

      <button
        onClick={handleEmptyTrash}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Empty Trash
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">Trash is empty</p>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div key={file.id} className="border p-4 rounded flex justify-between">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  Deleted on {new Date(file.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(file.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(file.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
                <input
                  type="checkbox"
                  checked={selected.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleBulkRestore}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Bulk Restore
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Bulk Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TrashPage;
