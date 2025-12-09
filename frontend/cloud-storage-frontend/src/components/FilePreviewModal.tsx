const FilePreviewModal = ({ fileId, mimeType }: { fileId: string; mimeType: string }) => {
  if (mimeType.startsWith("image/")) {
    return (
      <img
        src={`/files/${fileId}/preview`}
        alt="Preview"
        onError={(e) => (e.currentTarget.src = "/fallback.png")}
      />
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <iframe
        src={`/files/${fileId}/preview`}
        width="100%"
        height="600px"
      />
    );
  }

  return <p>Preview not available for this file type.</p>;
};

export default FilePreviewModal;
