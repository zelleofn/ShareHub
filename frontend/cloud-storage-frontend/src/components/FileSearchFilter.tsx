import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  onFilter: (filters: {
    type?: string;
    dateRange?: [string, string];
    sizeRange?: [number, number];
    shared?: boolean;
  }) => void;
  onSort: (sortBy: string) => void;
  onClear: () => void;
};

const FileSearchFilter = ({ onSearch, onFilter, onSort, onClear }: Props) => {
  const [query, setQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [shared, setShared] = useState("");

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
      {/*  Search */}
      <input
        type="text"
        placeholder="Search files..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="border px-3 py-2 rounded w-full md:w-1/3"
      />

      {/*  Filter by type */}
      <select
        className="border px-3 py-2 rounded"
        onChange={(e) => onFilter({ type: e.target.value || undefined })}
      >
        <option value="">All types</option>
        <option value="application/pdf">PDF</option>
        <option value="image/png">Image</option>
        <option value="text/plain">Text</option>
        <option value="video/mp4">Video</option>
      </select>

      {/*  Date range */}
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          onFilter({ dateRange: [e.target.value, dateTo] });
        }}
        className="border px-3 py-2 rounded"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => {
          setDateTo(e.target.value);
          onFilter({ dateRange: [dateFrom, e.target.value] });
        }}
        className="border px-3 py-2 rounded"
      />

      {/*  Size range (MB) */}
      <input
        type="number"
        placeholder="Min MB"
        value={sizeMin}
        onChange={(e) => {
          setSizeMin(e.target.value);
          onFilter({
            sizeRange: [
              Number(e.target.value) * 1024 * 1024,
              Number(sizeMax) * 1024 * 1024,
            ],
          });
        }}
        className="border px-3 py-2 rounded w-24"
      />
      <input
        type="number"
        placeholder="Max MB"
        value={sizeMax}
        onChange={(e) => {
          setSizeMax(e.target.value);
          onFilter({
            sizeRange: [
              Number(sizeMin) * 1024 * 1024,
              Number(e.target.value) * 1024 * 1024,
            ],
          });
        }}
        className="border px-3 py-2 rounded w-24"
      />

      {/*  Shared/private */}
      <select
        className="border px-3 py-2 rounded"
        value={shared}
        onChange={(e) => {
          setShared(e.target.value);
          onFilter({
            shared:
              e.target.value === "true"
                ? true
                : e.target.value === "false"
                ? false
                : undefined,
          });
        }}
      >
        <option value="">All</option>
        <option value="true">Shared</option>
        <option value="false">Private</option>
      </select>

      {/*  Sort */}
      <select
        className="border px-3 py-2 rounded"
        onChange={(e) => onSort(e.target.value)}
      >
        <option value="">Sort by</option>
        <option value="name">Name</option>
        <option value="date">Date</option>
        <option value="size">Size</option>
        <option value="type">Type</option>
      </select>

      {/*  Clear */}
      <button
        onClick={() => {
          setQuery("");
          setDateFrom("");
          setDateTo("");
          setSizeMin("");
          setSizeMax("");
          setShared("");
          onClear();
        }}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Clear
      </button>
    </div>
  );
};

export default FileSearchFilter;
