'use client';
import { ChatMessage } from '@/lib/chat/messages';
import { ArrowRightLeft, BadgeDollarSign, QrCode, FileText } from 'lucide-react';

type Props = {
  msg: ChatMessage;                    // kind='system'
  onOpenOffer?: (payload: any) => void;
  onOpenQR?: (payload: any) => void;
};

export default function SystemCard({ msg, onOpenOffer, onOpenQR }: Props) {
  const cx = "w-full grid place-items-center my-2";
  const box = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs bg-white";
  const ts = new Date(msg.createdAtISO).toLocaleString();

  switch (msg.systemType) {
    case 'status_change': {
      const { from, to } = msg.systemPayload || {};
      return (
        <div className={cx} role="status">
          <span className={box}>
            <ArrowRightLeft className="h-4 w-4" />
            Status: <strong>{from}</strong> → <strong>{to}</strong>
            <time className="opacity-60 ml-1">{ts}</time>
          </span>
        </div>
      );
    }
    case 'finance': {
      const { amount, currency = '₽', note } = msg.systemPayload || {};
      return (
        <div className={cx}>
          <span className={box}>
            <BadgeDollarSign className="h-4 w-4" />
            Finance: {amount}{currency} {note ? `· ${note}` : ''}
            <time className="opacity-60 ml-1">{ts}</time>
          </span>
        </div>
      );
    }
    case 'offer': {
      const payload = msg.systemPayload;
      return (
        <div className={cx}>
          <button className={`${box} hover:bg-[var(--muted)]`} onClick={() => onOpenOffer?.(payload)}>
            <FileText className="h-4 w-4" />
            Open offer
            <time className="opacity-60 ml-1">{ts}</time>
          </button>
        </div>
      );
    }
    case 'qr': {
      const payload = msg.systemPayload;
      return (
        <div className={cx}>
          <button className={`${box} hover:bg-[var(--muted)]`} onClick={() => onOpenQR?.(payload)}>
            <QrCode className="h-4 w-4" />
            Show QR
            <time className="opacity-60 ml-1">{ts}</time>
          </button>
        </div>
      );
    }
    default:
      return null;
  }
}


