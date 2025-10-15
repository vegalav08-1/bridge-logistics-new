import type { Annotation, AttachmentInfo, AttachmentVersion } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function fetchAttachmentInfo(attachmentId: string): Promise<AttachmentInfo> {
  await wait(200);
  const isPdf = attachmentId.includes('pdf');
  const url = isPdf
    ? 'https://example.com/dummy.pdf'
    : 'https://picsum.photos/1200/800'; // заглушка

  return {
    id: attachmentId,
    name: isPdf ? 'document.pdf' : 'photo.jpg',
    mime: isPdf ? 'application/pdf' : 'image/jpeg',
    size: 350_000,
    url,
    kind: isPdf ? 'pdf' : 'image',
    versions: [
      { id: 'v3', createdAtISO: new Date().toISOString(), author: 'Operator', note: 'current', url },
      { id: 'v2', createdAtISO: new Date(Date.now() - 86400000).toISOString(), author: 'Me', note: 'fixed crop', url },
      { id: 'v1', createdAtISO: new Date(Date.now() - 2*86400000).toISOString(), author: 'System', note: 'original', url },
    ]
  };
}

export async function createNewVersion(attachmentId: string, blob: Blob, note?: string): Promise<AttachmentVersion> {
  await wait(400);
  return {
    id: 'v' + Math.random().toString(36).slice(2,6),
    createdAtISO: new Date().toISOString(),
    author: 'Me',
    note,
    url: URL.createObjectURL(blob),
    size: blob.size,
  };
}

export async function fetchAnnotations(attachmentId: string, versionId?: string): Promise<Annotation[]> {
  await wait(150);
  return [];
}

export async function saveAnnotation(attachmentId: string, versionId: string, a: Omit<Annotation,'id'|'createdAtISO'>): Promise<Annotation> {
  await wait(150);
  return { ...a, id: 'ann_' + Math.random().toString(36).slice(2,8), createdAtISO: new Date().toISOString() };
}


