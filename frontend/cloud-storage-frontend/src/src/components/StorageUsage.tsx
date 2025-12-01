import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from 'axios';
import formatSize from "../utils/formatSize";


export type StorageData = {
  used: number;
  limit: number;
  percentage: number;
  breakdown?: Record<string, number>; 
};



const StorageUsage = () => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get("/storage/usage");
        setData(res.data);
      } catch {
        toast.error("Failed to load storage usage");
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return <p className="text-gray-500">Loading storage usage...</p>;
  }

  if (!data) {
    return <p>No storage data available. Upload files to start tracking usage.</p>;
  }

  const warning = data.percentage >= 80;

   return (
    <div className="bg-white border rounded p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Storage Usage</h2>

      {/* Visual bar */}
      <div className="w-full bg-gray-200 rounded h-4 mb-2">
        <div
          className={`h-4 rounded ${warning ? "bg-red-500" : "bg-blue-600"}`}
          style={{ width: `${data.percentage}%` }}
        />
      </div>

      {/* Percentage + used/total */}
      <p className="text-sm text-gray-700">
        {formatSize(data.used)} / {formatSize(data.limit)} ({data.percentage.toFixed(1)}%)
      </p>

      {/* Warning */}
      {warning && (
        <p className="text-sm text-red-600 mt-1">
          ⚠️ You are approaching your storage limit.
        </p>
      )}

      {/* Breakdown by file type */}
    {data.breakdown && (    
  <div className="mt-3">
    <h3 className="text-sm font-medium mb-1">By File Type:</h3>
    <ul className="text-sm text-gray-600 space-y-1">
      {Object.entries(data.breakdown).map(([type, size]) => (
        <li key={type}>
          {type.toUpperCase()}: {formatSize(size)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StorageUsage;