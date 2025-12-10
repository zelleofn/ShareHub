import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import formatSize from '../utils/formatSize';
import api from '../services/axio';

export type StorageData = {
  used: number;
  limit: number;
  percentage: number;
  breakdown?: Record<string, number>;
};


const StorageUsage = ({ refresh }: { refresh: number }) => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  console.log(" StorageUsage useEffect triggered. refresh =", refresh);

  const fetchUsage = async () => {
    console.log(" Calling /storage/usage...");

    try {
      const res = await api.get('/storage/usage');
      console.log(" /storage/usage response:", res.data);

     const used = res.data.storageUsed || 0;
     const limit = res.data.storageLimit || 0;

      const percentage = limit > 0 ? (used / limit) * 100 : 0;

      setData({
        used,
        limit,
        percentage,
        breakdown: res.data.breakdown || {}
      });

    } catch (err) {
      console.log(" Error calling /storage/usage:", err);
      toast.error('Failed to load storage usage');
    } finally {
      setLoading(false);
    }
  };

  fetchUsage();
}, [refresh]);


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
          className={`h-4 rounded ${warning ? 'bg-red-500' : 'bg-blue-600'}`}
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
           You are approaching your storage limit.
        </p>
      )}

      {/* Breakdown by file type */}
      {data.breakdown && (
        <div className="mt-3">
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
