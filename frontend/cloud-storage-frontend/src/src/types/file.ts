export interface FileVersion{
    verionId: string;
    filename: string;
    size: number;
    uploadedAt: string;
}

export interface File{
    id: string;
    owner: string;
    filename: string;
    mimetype: string;
    size: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    versions: FileVersion[];
}
export type FileDetails = {
  name: string;
  size: number;
  uploadedAt: string;
  type: string;
  sharingStatus: string;
  versionCount: number;
};
