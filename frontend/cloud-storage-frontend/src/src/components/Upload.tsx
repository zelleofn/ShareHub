import { useRef, useState } from 'react';
import { toast } from "react-hot-toast";
import { Button } from "./uiButton";
import { ConfirmDialog } from "./uiConfirmDialog";

type UploadFile = {
  file: File;
  progress: number;
  speed?: number;
  status: 'queued' | 'uploading' | 'success' | 'error';
  xhr?: XMLHttpRequest;
};

const Upload = () => {
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ index: number } | null>(null);

  
  const [contextMenu, setContextMenu] = useState<{x:number,y:number,index:number}|null>(null);

  const MAX_SIZE_MB = 50;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

  const handleFiles = (files: FileList) => {
    const newFiles: UploadFile[] = [];

    Array.from(files).forEach((file) => {
      const isValidType = ALLOWED_TYPES.includes(file.type);
      const isValidSize = file.size / (1024 * 1024) <= MAX_SIZE_MB;
        
      if (!isValidType) {
        toast.error(`File type ${file.type} is not allowed`);
        return;
      }
      if (!isValidSize) {
        toast.error(`${file.name} exceeds the ${MAX_SIZE_MB}MB limit.`);
        return;
      }
      newFiles.push({ file, progress: 0, status: 'queued' });
    });
      
    setUploadQueue((prev) => {
      const combined = [...prev, ...newFiles];    
      combined.forEach((item, i) => {
        if (item.status === 'queued') uploadFile(item, i);
      });
      return combined;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const uploadFile = (item: UploadFile, index: number) => {
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = (e.loaded / 1024 / 1024) / elapsed;

        setUploadQueue((prev) => {
          const updated = [...prev];
          updated[index].progress = percent;
          updated[index].speed = speed;
          updated[index].status = 'uploading';
          return updated;
        });
      }
    };

    xhr.onload = () => {
      setUploadQueue((prev) => {
        const updated = [...prev];
        updated[index].status = xhr.status === 200 ? 'success' : 'error';
        if (xhr.status === 200) {
          toast.success(`${item.file.name} uploaded successfully`);
        } else {
          toast.error(`${item.file.name} upload failed`);
        }
        return updated;
      });
    };

    xhr.onerror = () => {
      setUploadQueue((prev) => {
        const updated = [...prev];
        updated[index].status = 'error';
        toast.error(`${item.file.name} upload failed`);
        return updated;
      });
    };

    xhr.open('POST', '/api/upload');
    const formData = new FormData();
    formData.append('file', item.file);
    xhr.send(formData);

    setUploadQueue((prev) => {
      const updated = [...prev];
      updated[index].xhr = xhr;
      return updated;
    });
  };

  
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, index });
  };

  return (
  <div className="p-6 relative">
    {/* Drop Zone */}
    <div
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      className={`border-2 border-dashed rounded p-10 text-center cursor-pointer transition-colors 
        focus:outline-none focus:ring-2 focus:ring-brand-light ${
          dragOver ? "border-brand bg-brand-light/10" : "border-gray-300"
        }`}
      onClick={handleBrowse}
    >
      <p className="text-text.subtle">Drag & drop files here or click to browse</p>
      <input
        type="file"
        multiple
        hidden
        ref={inputRef}
        className="form-input"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />
    </div>

    {/* Upload Queue */}
    <div className="mt-6 space-y-4">
      {uploadQueue.map((item, i) => (
        <div
          key={i}
          className="border rounded p-4 shadow-sm"
          onContextMenu={(e) => handleContextMenu(e, i)}
        >
          <p className="font-medium text-text.DEFAULT">{item.file.name}</p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded mt-2">
            <div
              className={`h-2 rounded transition-all duration-300 ${
                item.status === "error"
                  ? "bg-danger"
                  : item.status === "success"
                  ? "bg-success"
                  : "bg-brand"
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>

          {/* Status + Speed */}
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-text.subtle">
              {item.status === "uploading"
                ? `Uploading... ${item.progress.toFixed(0)}% (${item.speed?.toFixed(2)} MB/s)`
                : item.status === "success"
                ? "Uploaded"
                : item.status === "error"
                ? "Failed"
                : "Queued"}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {item.status === "uploading" && (
                <Button variant="danger" onClick={() => item.xhr?.abort()}>
                  Cancel
                </Button>
              )}
              {item.status === "error" && (
                <Button variant="primary" onClick={() => uploadFile(item, i)}>
                  Retry
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() =>
                  setUploadQueue((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Context Menu */}
    {contextMenu && (
      <ul
        className="absolute bg-white border rounded shadow-md z-20 transition-opacity duration-200"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onMouseLeave={() => setContextMenu(null)}
      >
        <li
          tabIndex={0}
          className="px-4 py-2 text-text.subtle hover:bg-gray-100 cursor-pointer 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
          onClick={() => {
            const item = uploadQueue[contextMenu.index];
            if (item.status === "error") uploadFile(item, contextMenu.index);
            setContextMenu(null);
          }}
        >
          Retry
        </li>
        <li
          tabIndex={0}
          className="px-4 py-2 text-danger hover:bg-red-50 cursor-pointer 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-danger"
          onClick={() => {
            const item = uploadQueue[contextMenu.index];
            item.xhr?.abort();
            setContextMenu(null);
          }}
        >
          Cancel
        </li>
        <li
          tabIndex={0}
          className="px-4 py-2 text-text.subtle hover:bg-gray-100 cursor-pointer 
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-light"
          onClick={() => {
            setConfirmRemove({ index: contextMenu.index });
            setContextMenu(null);
          }}
        >
          Remove
        </li>
      </ul>
    )}

    {confirmRemove && (
      <ConfirmDialog
        message={`Remove ${uploadQueue[confirmRemove.index].file.name} from queue?`}
        onConfirm={() => {
          setUploadQueue((prev) =>
            prev.filter((_, idx) => idx !== confirmRemove.index)
          );
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    )}
  </div>
);
};

export default Upload;
