import { useState, useCallback, useMemo } from 'react';
import axios from '../services/api';
import debounce from 'lodash.debounce';
import type { FileDetails } from '../types/file';

type Props = {
  onFileClick?: (file: FileDetails) => void;
};

const FileSearch = ({ onFileClick }: Props) => {
  const [results, setResults] = useState<FileDetails[]>([]);

  const fetchSearch = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }
    try {
      const res = await axios.get<FileDetails[]>(`/search?q=${query}`);
      setResults(res.data);
    } catch {
      console.error('Search failed');
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(fetchSearch, 300), [fetchSearch]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search files..."
        onChange={(e) => debouncedSearch(e.target.value)}
        className="border p-2 rounded w-full"
      />

      <ul className="mt-2 text-sm text-gray-700 space-y-1">
        {results.map((file) => (
          <li
            key={file.id}
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => onFileClick?.(file)}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileSearch;
