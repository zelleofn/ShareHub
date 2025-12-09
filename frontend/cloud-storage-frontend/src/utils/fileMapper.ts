import type { File, FileDetails } from '../types/file';

export function mapFileToDetails(file: File): FileDetails {
  return {
    id: file.id,
    name: file.filename,
    size: file.size,
    uploadedAt: file.createdAt,
    type: file.mimetype.split('/')[0],
    sharingStatus: file.isPublic ? 'public' : 'private',
    versionCount: file.versions.length,
    mimetype: file.mimetype,
  };
}
