import {
  FileText,
  Image,
  Video,
  Music,
  FileArchive,
  FileCode,
  File,
} from 'lucide-react';

export const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500"/>;
     if (type.includes('zip')) return <FileArchive className="w-5 h-5 text-yellow-500" />;
    if (type.includes('json') || type.includes('javascript')) return <FileCode className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
};