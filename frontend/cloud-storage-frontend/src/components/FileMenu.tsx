import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/axio";

type FileMenuProps = {
  fileId: string;
  isPublic: boolean;  
  onRefresh: () => void;
};

const FileMenu = ({ fileId, isPublic, onRefresh }: FileMenuProps) => {
  const [loading, setLoading] = useState(false);
  const [localIsPublic, setLocalIsPublic] = useState(isPublic);

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      const res = await api.post(`/share/${fileId}`);
      const link = res.data.shareUrl; 
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard");
      setLocalIsPublic(true);
      onRefresh(); 
    } catch {
      toast.error("Failed to generate link");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLinks = async () => {
    try {
      setLoading(true);
      await api.delete(`/share/${fileId}`);
      toast.success("Share link revoked");
      setLocalIsPublic(false);
      onRefresh();
    } catch {
      toast.error("Failed to revoke links");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-2 text-sm">
      {!localIsPublic && (
        <button
          onClick={handleGenerateLink}
          disabled={loading}
          className="text-blue-600 hover:underline disabled:opacity-50"
        >
          Generate Link & Copy
        </button>
      )}

      {localIsPublic && (
        <button
          onClick={handleRevokeLinks}
          disabled={loading}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          Revoke Link
        </button>
      )}

      <p className="text-gray-600">
        Status: {localIsPublic ? "Shared" : "Private"}
      </p>
    </div>
  );
};

export default FileMenu;