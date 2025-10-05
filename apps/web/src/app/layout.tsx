import '../styles/globals.css';
import type { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'YP ERP',
  description: 'ERP with chat-journals (skeleton)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
