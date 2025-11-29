import { useEffect, useState } from "react";
import axios from "../services/api";
import { toast } from "react-hot-toast";
import formatSize from "../utils/formatSize";


type StorageStats = {
  totalFiles: number;
  totalVersions: number;
  averageSize: number;
  largestSize: number;
  smallestSize: number;
  lastUpload: string | null;
  used: number;
  total: number;
  percentage: number;
};

type FileItem = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type Breakdown = Record<string, number>;

type CleanupSuggestion = {
  id: string;
  name: string;
  reason: string;
};

const StoragePage = () => {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
    const [largestFiles, setLargestFiles] = useState<FileItem[]>([]);
    const [suggestions, setSuggestions] = useState<CleanupSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, largestRes, breakdownRes, cleanupRes] = await Promise.all([
          axios.get("/storage/statistics"),
          axios.get("/storage/largest"),
          axios.get("/storage/breakdown"),
          axios.get("/storage/cleanup"),
        ]);
        setStats(statsRes.data);
        setLargestFiles(largestRes.data);
        setBreakdown(breakdownRes.data);
        setSuggestions(cleanupRes.data);
            } catch {
                toast.error("Failed to load storage data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="text-gray-500">Loading storage data</p>;

     return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Storage Settings</h1>

      {/* Detailed Statistics */}
      {stats && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Detailed Statistics</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Total Files: {stats.totalFiles}</li>
            <li>Total Versions: {stats.totalVersions}</li>
            <li>Average Size: {formatSize(stats.averageSize)}</li>
            <li>Largest File: {formatSize(stats.largestSize)}</li>
            <li>Smallest File: {formatSize(stats.smallestSize)}</li>
            <li>Last Upload: {stats.lastUpload ? new Date(stats.lastUpload).toLocaleString() : "N/A"}</li>
            <li>Used: {formatSize(stats.used)} / {formatSize(stats.total)} ({stats.percentage}%)</li>
          </ul>
        </div>
      )}

       {/* Largest Files */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Largest Files</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          {largestFiles.map(file => (
            <li key={file.id}>
              {file.name} — {formatSize(Number(file.size))}
            </li>
          ))}
        </ul>
      </div>

      {/* File Type Breakdown */}
      {breakdown && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">File Type Breakdown</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {Object.entries(breakdown).map(([type, size]) => (
              <li key={type} className="flex justify-between">
                <span>{type.toUpperCase()}</span>
                <span>{formatSize(size)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cleanup Suggestions */}
      <div className="bg-white border rounded p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Cleanup Suggestions</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions at this time.</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {suggestions.map(s => (
              <li key={s.id}>
                {s.name} — {s.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StoragePage;