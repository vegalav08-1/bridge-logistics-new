export type AttachmentKind = 'image' | 'pdf' | 'other';

export interface AttachmentInfo {
  id: string;
  name: string;
  mime: string;
  size: number;
  url: string;            // прямой URL файла (s3, cdn)
  kind: AttachmentKind;   // 'image' | 'pdf' | 'other'
  versions?: AttachmentVersion[];
}

export interface AttachmentVersion {
  id: string;
  createdAtISO: string;
  author?: string;
  note?: string;
  url: string;
  size?: number;
}

export interface Annotation {
  id: string;
  x: number;              // 0..1 относительные координаты
  y: number;              // 0..1
  page?: number;          // для PDF
  text?: string;
  author?: string;
  createdAtISO: string;
}


