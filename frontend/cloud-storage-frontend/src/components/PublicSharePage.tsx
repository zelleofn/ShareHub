import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

type FileInfo = {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

const PublicSharePage = () => {
  const { shareId } = useParams();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await axios.get(`/shared/${shareId}/info`);
        setFile(res.data);
      } catch (err: unknown) {
             console.error(err);
            setError('Invalid or expired share link');
            } finally {
             setLoading(false);
        }

    };
    fetchFile();
  }, [shareId]);

  const handleDownload = async () => {
    try {
      const res = await axios.get(`/shared/${shareId}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file?.name || 'file';
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Shared File</h1>
      {file && (
        <>
          <p className="mb-2"><strong>Name:</strong> {file.name}</p>
          <p className="mb-2"><strong>Type:</strong> {file.type}</p>
          <p className="mb-2"><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
          <p className="mb-4"><strong>Uploaded:</strong> {new Date(file.uploadedAt).toLocaleDateString()}</p>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </button>
        </>
      )}
    </div>
  );
};

export default PublicSharePage;
