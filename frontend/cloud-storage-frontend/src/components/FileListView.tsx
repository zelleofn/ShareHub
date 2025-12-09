import type { FileItem } from "./FileList";

interface Props {
  files: FileItem[];
  onFileClick?: (file: FileItem) => void;
  onSelect?: (id: string) => void;
  selectedIds?: string[];
}

export default function FileListView({ files, onFileClick, onSelect, selectedIds = [] }: Props) {
  return (
    <div>
      {files.map(file => (
        <div
          key={file.id}
          onClick={() => onFileClick?.(file)}
          onDoubleClick={() => onSelect?.(file.id)}
          style={{
            background: selectedIds.includes(file.id) ? "#e5e7eb" : "transparent"
          }}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}
