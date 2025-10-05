export const FLAGS = {
  AUTH_V2_ENABLED: false,
  ENFORCE_PARENT_ADMIN: false,
  AUTO_ADD_CHAT_MEMBERS: false,
  CHAT_SUMMARY_ON_CREATE: false,
  WS_ENABLED: false,
  NEW_FEED_UI: false,
  STRICT_STATE_MACHINE: false,
} as const;

export type FlagKey = keyof typeof FLAGS;
