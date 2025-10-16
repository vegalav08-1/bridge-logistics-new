import { NextResponse } from 'next/server';
import { FLAGS } from '@yp/shared';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      pwa: FLAGS.PWA_ENABLED,
      offline: FLAGS.OFFLINE_ENABLED,
      backgroundSync: FLAGS.BACKGROUND_SYNC_ENABLED,
      chunkUploads: FLAGS.CHUNK_UPLOADS_ENABLED,
      cameraQR: FLAGS.CAMERA_QR_ENABLED,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  return NextResponse.json(health);
}







