export const FLAGS = {
  AUTH_V2_ENABLED: true,
  ENFORCE_PARENT_ADMIN: false,
  AUTO_ADD_CHAT_MEMBERS: false,
  CHAT_SUMMARY_ON_CREATE: true,
  WS_ENABLED: true,
  NEW_FEED_UI: true,
  // S3 флаги
  REFERRALS_ENABLED: true,
  ADMIN_PARTNERS_ENABLED: true,
  // S5 флаги
  UNIFIED_FEED_ENABLED: true,
  // S6 флаги
  REQUEST_OFFER_FLOW_ENABLED: true,
  QR_LABELS_ENABLED: true,
  // S7 флаги
  FILES_ENABLED: true,
  PRESIGNED_UPLOADS_ENABLED: true,
  AV_SCAN_ENABLED: false,          // ClamAV, включаем на staging/prod
  PDF_THUMBS_ENABLED: true,
  IMAGE_THUMBS_ENABLED: true,
  VIDEO_UPLOADS_ENABLED: true,     // можно выкатывать по канарейке
  // S8 флаги
  WS_SSE_FALLBACK: true,
  READ_RECEIPTS_ENABLED: true,
  DELIVERED_RECEIPTS_ENABLED: true,
  TYPING_INDICATORS_ENABLED: true,
  // S9 флаги
  STRICT_STATE_MACHINE: true,
  LOGISTICS_OPS_ENABLED: true,
  AUDIT_TRAIL_ENABLED: true,
  // S11 флаги
  SEARCH_ENABLED: true,
  SEARCH_ATTACHMENTS_ENABLED: true,
  SEARCH_SUGGEST_ENABLED: true,
  DASHBOARDS_ENABLED: true,
  // S13 флаги
  NOTIFICATIONS_V2_ENABLED: true,
  // S14 флаги - PWA + Offline + Мобильные возможности
  PWA_ENABLED: true,
  OFFLINE_ENABLED: true,
  BACKGROUND_SYNC_ENABLED: true,
  CHUNK_UPLOADS_ENABLED: true,
  CAMERA_QR_ENABLED: true,

  // S15 флаги - Files 2.0 (превью, OCR, версии, аннотации)
  FILES_PREVIEW_ENABLED: true,
  FILES_OCR_ENABLED: true,
  FILES_ANNOTATIONS_ENABLED: true,
  FILES_VERSIONING_ENABLED: true,
  FILES_ANTIVIRUS_ENABLED: false, // Пока отключен, нужен ClamAV
  
  // S16 флаги - Конфигуратор упаковки Pro
  PACK_PRO_ENABLED: true,
  PACK_LABELS_ENABLED: true,
  PACK_PRESETS_ENABLED: true,
  PACK_3D_ENABLED: true,
} as const;

export type FlagKey = keyof typeof FLAGS;
