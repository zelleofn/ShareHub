import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../services/api";
import { toast } from "react-hot-toast";
import formatSize from "../utils/formatSize";
import type { StorageData } from "./StorageUsage";
import { Suspense, lazy } from "react";
import type { FileDetails } from "../types/file";
import { mapFileToDetails } from "../utils/fileMapper";


const FileDetailModal = lazy(() => import("../components/FileDetailModal"));

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


type Breakdown = Record<string, number>;

type CleanupSuggestion = {
  id: string;
  name: string;
  reason: string;
};

const StoragePage = () => {
    const [stats, setStats] = useState<StorageStats | null>(null);
    const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
    const [largestFiles, setLargestFiles] = useState<FileDetails[]>([]);
    const [suggestions, setSuggestions] = useState<CleanupSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [usage] = useState<StorageData | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileDetails | null>(null);
    
   

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
        setLargestFiles(largestRes.data.map(mapFileToDetails));

            } catch {
                toast.error("Failed to load storage data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedLargestFiles = useMemo(
      () => [...largestFiles].sort((a, b) => b.size - a.size),
      [largestFiles]
    );

    const formattedBreakdown = useMemo(
      () => 
        breakdown 
      ? Object.entries(breakdown).map(([type, size]) => ({
        type: type.toUpperCase(),
        size: formatSize(size),
        
            }))
        : [],
    [breakdown]
  );

  const handleFileClick = useCallback((file: FileDetails) => {
    setSelectedFile(file);
  }, []);

    if (loading) return <p className="text-gray-500">Loading storage data</p>;
    if (!usage && !stats && !breakdown && largestFiles.length === 0 && !suggestions) {
  return <p>No storage data available. Upload files to start tracking usage.</p>;
}

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
  {sortedLargestFiles.map((file) => (
    <li
      key={file.id}
      className="cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => handleFileClick(file)}   
    >
      {file.name} — {formatSize(file.size)}
    </li>
  ))}
</ul>
      </div>

      {/* File Type Breakdown */}
      {breakdown && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">File Type Breakdown</h2>
          <ul className="text-sm text-gray-700 space-y-1">
  {formattedBreakdown.map(({ type, size }) => (
    <li key={type} className="flex justify-between">
      <span>{type}</span>
      <span>{size}</span>
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
       {/*  Lazy-loaded FileDetailModal */}
      <Suspense fallback={<div>Loading file details...</div>}>
        {selectedFile && (
          <FileDetailModal
            isOpen={true}
            onClose={() => setSelectedFile(null)}
            fileDetails={selectedFile}
          />
        )}
      </Suspense>
    </div>
  );
};
 
export default StoragePage;