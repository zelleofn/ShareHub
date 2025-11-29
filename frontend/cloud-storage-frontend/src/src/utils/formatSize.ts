const formatSize = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : bytes < 1024 * 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : bytes < 1024 * 1024 * 1024 * 1024
    ? `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
    : `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;

export default formatSize;
