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
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [shared, setShared] = useState("");

  
  const sendFilter = (updatedFilters: {
    type: string;
    dateFrom: string;
    dateTo: string;
    sizeMin: string;
    sizeMax: string;
    shared: string;
  }) => {
    onFilter({
      type: updatedFilters.type || undefined,
      dateRange: updatedFilters.dateFrom || updatedFilters.dateTo 
        ? [updatedFilters.dateFrom, updatedFilters.dateTo] 
        : undefined,
      sizeRange: updatedFilters.sizeMin || updatedFilters.sizeMax
        ? [
            (Number(updatedFilters.sizeMin) || 0) * 1024 * 1024,
            (Number(updatedFilters.sizeMax) || 0) * 1024 * 1024,
          ]
        : undefined,
      shared: updatedFilters.shared === "true" ? true : updatedFilters.shared === "false" ? false : undefined
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    sendFilter({ type: e.target.value, dateFrom, dateTo, sizeMin, sizeMax, shared });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFrom(e.target.value);
    sendFilter({ type, dateFrom: e.target.value, dateTo, sizeMin, sizeMax, shared });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateTo(e.target.value);
    sendFilter({ type, dateFrom, dateTo: e.target.value, sizeMin, sizeMax, shared });
  };

  const handleSizeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeMin(e.target.value);
    sendFilter({ type, dateFrom, dateTo, sizeMin: e.target.value, sizeMax, shared });
  };

  const handleSizeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeMax(e.target.value);
    sendFilter({ type, dateFrom, dateTo, sizeMin, sizeMax: e.target.value, shared });
  };

  const handleSharedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setShared(val);
    sendFilter({
      type,
      dateFrom,
      dateTo,
      sizeMin,
      sizeMax,
      shared: val,
    });
  };

  const handleClear = () => {
    setQuery("");
    setType("");
    setDateFrom("");
    setDateTo("");
    setSizeMin("");
    setSizeMax("");
    setShared("");
    onClear();
  };

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
      {/* Search */}
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

      {/* Filter by type */}
      <select
        value={type}
        onChange={handleTypeChange}
        className="border px-3 py-2 rounded"
      >
        <option value="">All types</option>
        <option value="application/pdf">PDF</option>
        <option value="image/png">Image</option>
        <option value="text/plain">Text</option>
        <option value="video/mp4">Video</option>
      </select>

      {/* Date range */}
      <input
        type="date"
        value={dateFrom}
        onChange={handleDateFromChange}
        className="border px-3 py-2 rounded"
      />
      <input
        type="date"
        value={dateTo}
        onChange={handleDateToChange}
        className="border px-3 py-2 rounded"
      />

      {/* Size range (MB) */}
      <input
        type="number"
        placeholder="Min MB"
        value={sizeMin}
        onChange={handleSizeMinChange}
        className="border px-3 py-2 rounded w-24"
      />
      <input
        type="number"
        placeholder="Max MB"
        value={sizeMax}
        onChange={handleSizeMaxChange}
        className="border px-3 py-2 rounded w-24"
      />

      {/* Shared/private */}
      <select
        value={shared}
        onChange={handleSharedChange}
        className="border px-3 py-2 rounded"
      >
        <option value="">All</option>
        <option value="true">Shared</option>
        <option value="false">Private</option>
      </select>

      {/* Sort */}
      <select
        onChange={(e) => onSort(e.target.value)}
        className="border px-3 py-2 rounded"
      >
        <option value="">Sort by</option>
        <option value="name">Name</option>
        <option value="date">Date</option>
        <option value="size">Size</option>
        <option value="type">Type</option>
      </select>

      {/* Clear */}
      <button
        onClick={handleClear}
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Clear
      </button>
    </div>
  );
};

export default FileSearchFilter;