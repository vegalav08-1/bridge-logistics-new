/**
 * Actions matrix for Chat UI3 - declarative mapping of role/status to available actions
 */

import { Role, ShipmentStatus, ActionsVM } from './types';

type Matrix = Record<Role, Partial<Record<ShipmentStatus, ActionsVM>>>;

export const ACTIONS_MATRIX: Matrix = {
  USER: {
    REQUEST: { primary: [] }, // пользователь создаёт запросы на /requests/new, в чате — чтение
    NEW: { primary: [] },
    RECEIVE: { 
      primary: [{ 
        key: 'confirm_reconcile', 
        label: 'Подтвердить осмотр', 
        variant: 'primary', 
        opens: 'modal'
      }] 
    },
    PACK: { primary: [] },
    MERGE: { primary: [] },
    IN_TRANSIT: { primary: [] },
    ON_DELIVERY: { 
      primary: [{ 
        key: 'confirm_pickup', 
        label: 'Подтвердить получение', 
        variant: 'primary', 
        opens: 'modal'
      }] 
    },
    DELIVERED: { primary: [] },
    ARCHIVED: { primary: [] },
    CANCELLED: { primary: [] }
  },
  ADMIN: {
    REQUEST: {
      primary: [{ 
        key: 'create_offer', 
        label: 'Создать предложение', 
        variant: 'primary', 
        opens: 'drawer'
      }],
      secondary: [{ 
        key: 'archive_request', 
        label: 'Архивировать', 
        variant: 'secondary', 
        opens: 'modal'
      }]
    },
    NEW: {
      primary: [],
      secondary: [{ 
        key: 'show_qr', 
        label: 'QR', 
        opens: 'none'
      }]
    },
    RECEIVE: {
      primary: [{ 
        key: 'finish_reconcile', 
        label: 'Завершить приемку и сверку', 
        variant: 'primary', 
        opens: 'modal'
      }],
      secondary: [{ 
        key: 'delete_shipment', 
        label: 'Удалить отгрузку', 
        variant: 'danger', 
        opens: 'modal',
        tooltip: 'Возврат товара поставщику в полном объеме'
      }]
    },
    PACK: {
      primary: [{ 
        key: 'open_packing', 
        label: 'Конфигуратор упаковки', 
        variant: 'primary', 
        opens: 'drawer'
      }]
    },
    MERGE: {
      primary: [
        { 
          key: 'attach_merge', 
          label: 'Присоединить', 
          variant: 'secondary', 
          opens: 'drawer'
        },
        { 
          key: 'detach_merge', 
          label: 'Отсоединить', 
          variant: 'secondary', 
          opens: 'modal'
        },
        { 
          key: 'finish_merge', 
          label: 'Завершить совмещение', 
          variant: 'primary', 
          opens: 'modal'
        }
      ]
    },
    IN_TRANSIT: {
      primary: [{ 
        key: 'arrive_to_city', 
        label: 'Прибыло в город выдачи', 
        variant: 'primary', 
        opens: 'modal'
      }]
    },
    ON_DELIVERY: {
      primary: [{ 
        key: 'deliver', 
        label: 'Выдать груз', 
        variant: 'primary', 
        opens: 'modal'
      }]
    },
    DELIVERED: { primary: [] },
    ARCHIVED: { primary: [] },
    CANCELLED: { primary: [] }
  },
  SUPER: {
    // Наследует ADMIN, плюс спец-кнопки по флагам
    REQUEST: {
      primary: [{ 
        key: 'create_offer', 
        label: 'Создать предложение', 
        variant: 'primary', 
        opens: 'drawer'
      }],
      secondary: [{ 
        key: 'archive_request', 
        label: 'Архивировать', 
        variant: 'secondary', 
        opens: 'modal'
      }, { 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    NEW: {
      primary: [],
      secondary: [{ 
        key: 'show_qr', 
        label: 'QR', 
        opens: 'none'
      }, { 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    RECEIVE: {
      primary: [{ 
        key: 'finish_reconcile', 
        label: 'Завершить приемку и сверку', 
        variant: 'primary', 
        opens: 'modal'
      }],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    PACK: {
      primary: [{ 
        key: 'open_packing', 
        label: 'Конфигуратор упаковки', 
        variant: 'primary', 
        opens: 'drawer'
      }],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    MERGE: {
      primary: [
        { 
          key: 'attach_merge', 
          label: 'Присоединить', 
          variant: 'secondary', 
          opens: 'drawer'
        },
        { 
          key: 'detach_merge', 
          label: 'Отсоединить', 
          variant: 'secondary', 
          opens: 'modal'
        },
        { 
          key: 'finish_merge', 
          label: 'Завершить совмещение', 
          variant: 'primary', 
          opens: 'modal'
        }
      ],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    IN_TRANSIT: {
      primary: [{ 
        key: 'arrive_to_city', 
        label: 'Прибыло в город выдачи', 
        variant: 'primary', 
        opens: 'modal'
      }],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    ON_DELIVERY: {
      primary: [{ 
        key: 'deliver', 
        label: 'Выдать груз', 
        variant: 'primary', 
        opens: 'modal'
      }],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    DELIVERED: { 
      primary: [],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    ARCHIVED: { 
      primary: [],
      secondary: [{ 
        key: 'cancel_shipment', 
        label: 'Отменить', 
        variant: 'danger', 
        opens: 'modal'
      }]
    },
    CANCELLED: { primary: [] }
  }
};

/**
 * Get available actions for a role and status
 */
export function getActionsForRoleAndStatus(role: Role, status: ShipmentStatus): ActionsVM | null {
  const roleActions = ACTIONS_MATRIX[role];
  return roleActions[status] || null;
}