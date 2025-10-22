'use client';

import PhotoManager from './PhotoManager';

interface PhotoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Array<{
    id: string;
    url: string;
    fileName?: string;
    name?: string;
    size?: number;
  }>;
  currentIndex: number;
  onDownload?: (id: string) => void;
}

export default function PhotoGallery(props: PhotoGalleryProps) {
  return <PhotoManager {...props} />;
}
