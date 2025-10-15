'use client';
import { AttachmentMini } from '@/lib/chat/messages';
import { File, FileText, Image as ImageIcon, Download } from 'lucide-react';
import IfCan from '@/lib/acl/IfCan';

type Props = {
  file: AttachmentMini;
  align?: 'left' | 'right';          // для выравнивания в ленте
  onOpen?: (id: string) => void;     // откроет Viewer (UI6)
  onDownload?: (id: string) => void;
};

export default function AttachmentCardMini({ file, align = 'left', onOpen, onDownload }: Props) {
  const isImage = file.mime.startsWith('image/');
  const isPdf = file.mime === 'application/pdf';

  return (
    <div className={`w-full flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div data-testid="msg-attach" data-id={file.id} className="w-[78%] rounded-2xl bg-white border overflow-hidden">
        <button className="w-full text-left" onClick={() => onOpen?.(file.id)}>
          <div className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--muted)] flex items-center justify-center overflow-hidden">
              {isImage ? (
                <ImageIcon className="h-5 w-5" />
              ) : isPdf ? (
                <FileText className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-[11px] text-[var(--text-secondary)] truncate">{formatSize(file.size)} · {file.mime}</div>
            </div>
            <IfCan resource="file" action="download" mode="disable">
              <button
                className="ml-1 shrink-0 h-9 w-9 rounded-lg border grid place-items-center"
                onClick={(e) => { e.stopPropagation(); onDownload?.(file.id); }}
                aria-label="Download"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            </IfCan>
          </div>
        </button>
      </div>
    </div>
  );
}

function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
