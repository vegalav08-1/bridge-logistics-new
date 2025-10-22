/**
 * Feature flags for UI2 system
 * Allows gradual rollout without breaking existing UI
 */

export const UI_V2_ENABLED = true;          // общий флаг новой UI-системы
export const BOTTOM_NAV_ENABLED = true;     // нижняя навигация (мобайл)
export const TOASTS_ENABLED = true;         // глобальные тосты
export const MODALS_V2_ENABLED = true;      // новые модалки/дроуэры

// Component-specific flags for granular control
export const APP_HEADER_ENABLED = true;     // новый AppHeader
export const CONTAINER_V2_ENABLED = true;   // новый Container
export const BUTTON_V2_ENABLED = true;      // новые Button компоненты
export const CARD_V2_ENABLED = true;        // новые Card компоненты

// Navigation flags
export const SHIPMENTS_NAV_ENABLED = true;
export const SEARCH_NAV_ENABLED = true;
export const NEW_NAV_ENABLED = true;
export const PARTNERS_NAV_ENABLED = true;
export const ACCOUNT_NAV_ENABLED = true;

// Shipments V2 flags
export const SHIPMENTS_V2_ENABLED = true;   // включение нового списка
export const SHIPMENTS_V2_VIRTUAL = true;   // виртуализация длинных списков

// Chat UI3 flags
export const CHAT_HEADER_V2_ENABLED = true;   // новый хедер чата
export const STATUS_ACTIONS_V2_ENABLED = true; // панель действий по статусу

// Chat UI4 flags
export const CHAT_LIST_V2_ENABLED = true;     // новая лента сообщений

// Chat UI5 flags
export const COMPOSER_V2_ENABLED = true;
export const REAL_CHAT_ENABLED = true;      // новый composer + outbox

// Chat UI6 flags
export const VIEWER_V2_ENABLED = true;        // новый просмотрщик вложений

// Chat Media flags (CH-01 to CH-13)
export const CHAT_MEDIA_V1          = true;  // хранилище и метаданные медиа
export const CHAT_UPLOAD_V1         = true;  // загрузка: чанки/резюм/ретраи
export const CHAT_IMAGES_V1         = true;  // ресайзы, миниатюры, webp/avif
export const CHAT_VIDEO_V1          = true;  // транскод/HLS постер/ограничение
export const CHAT_DOCS_V1           = true;  // PDF viewer и браузер доков
export const CHAT_LIGHTBOX_V1       = true;  // удобный просмотрщик в чате
export const CHAT_MANAGERS_V1       = true;  // вкладки Media/Docs/Links в чате
export const CHAT_MSG_EXT_V1        = true;  // reply/forward/edit/delete/captions
export const CHAT_REALTIME_V1       = true;  // WS, доставлено/прочитано, typing
export const CHAT_SEARCH_V1         = true;  // индекс фуллтекста и метаданных
export const CHAT_PERF_CDN_V1       = true;  // CDN, prefetch, lazy, virtualize
export const CHAT_SECURITY_V1       = true;  // antivirus, signedURL, ACL, retention

// Forms UI7 flags
export const FORMS_V2_ENABLED = true;         // новые формы requests/new и shipments/new

// Inbox UI8 flags
export const INBOX_V2_ENABLED = true;         // новый модуль уведомлений (Inbox)
export const REALTIME_V2_ENABLED = true;      // WebSocket-шлюз и push-уведомления

// ACL S10 flags
export const ACL_V2_ENABLED = true;           // глобальный флаг ACL UI

// FSM S11 flags
export const FSM_V2_ENABLED = true;           // включает FSM, частичные операции, split/merge
export const LINEAGE_V2_ENABLED = true;       // включает панель истории происхождения

// Search S12 flags
export const SEARCH_V2_ENABLED = true;       // глобальный поиск
export const SCANNER_V2_ENABLED = true;       // камера-сканер
export const OCR_V2_ENABLED = true;           // клиентский OCR

// Finance S13 flags
export const OFFERS_V2_ENABLED = true;       // офферы и калькуляция
export const FINANCE_V2_ENABLED = true;      // инвойсы/оплаты/баланс
export const FX_V2_ENABLED = true;           // курсы валют

// Inventory S14 flags
export const INVENTORY_V2_ENABLED = true;    // склад / остатки
export const PACKING_V2_ENABLED = true;      // упаковка
export const LABELS_V2_ENABLED = true;       // генерация этикеток (QR/ШК)

// Home & Settings flags
export const HOME_V1_ENABLED = true;         // главная страница-плитки
export const SETTINGS_V1_ENABLED = true;     // базовое меню настроек

// Notifications & Referrals flags
export const NOTIFICATIONS_V2_ENABLED = true;    // страница + шторка + синхронизация
export const REFERRALS_V2_ENABLED = true;        // реферальная модель /r/[token]
export const PARTNERS_V2_ENABLED = true;         // новый раздел партнёров
export const ADMIN_CLIENTS_V2_ENABLED = true;     // страница клиента

// Partners V3 flags
export const PARTNERS_V3_ENABLED = true;         // новая страница /partners (по макету)
export const REFERRALS_V3_ENABLED = true;        // создание/принятие реферальных ссылок
export const CHAT_BADGES_ENABLED = true;         // зелёный bubble непрочитанных
export const PARTNER_SHIPMENTS_V1_ENABLED = true; // страница партнёра с отгрузками

// Order Lifecycle Pro flags
export const ORDER_FSM_V1_ENABLED = true;  // включает валидатор переходов, журнал
export const ORDER_RACI_V1_ENABLED = true;  // ответственность по состояниям
export const ORDER_SLA_V1_ENABLED = true;  // таймеры, дедлайны, эскалации

// Change Requests & Versioning flags
export const CRV_V1_ENABLED = true;         // CR-процесс и версии заказа
export const CRV_UI_V1_ENABLED = true;      // UI-модалки, системные карточки

// WMS Core flags
export const WMS_V1_ENABLED = true;          // Весь складской контур
export const WMS_SCAN_V1_ENABLED = true;     // Сканер (QR/штрихкоды)
export const WMS_PHOTO_V1_ENABLED = true;    // Фотофиксация
export const WMS_RETURNS_V1_ENABLED = true;  // Возвраты

// CRM 360 flags
export const CRM_V1_ENABLED = true;          // включает CRM 360
export const CRM_SEGMENTS_V1 = true;         // сегментация и правила
export const CRM_TASKS_V1 = true;            // простые задачи/напоминания
export const CRM_TIMELINE_V1 = true;         // единая лента активности
export const CRM_REFERRALS_V1 = true;        // привязка к /partners, /r/[token]

// Chat V2 фиче-флаги
export const CHAT_V2_ENABLED = false;          // отключаем Chat V2 для переключения на реальные данные
export const CHAT_V2_SETTINGS_ENABLED = true;   // настройки чата (mute / mentions override / invites)
export const CHAT_V2_MENTIONS_ENABLED = true;   // @упоминания с автокомплитом и нотификациями
export const CHAT_V2_PARTICIPANTS_ENABLED = true; // управление участниками, роли, персональный mute
