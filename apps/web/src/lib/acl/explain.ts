import type { Action, ACLContext, Resource } from './types';

export function explainDeny(res: Resource, act: Action, ctx: ACLContext): string {
  const L = ctx.locale ?? 'ru';
  const t = (ru:string, en:string) => L === 'ru' ? ru : en;

  if (res==='admin_area' && act==='manage' && ctx.role==='USER')
    return t('Раздел доступен только сотрудникам','Admins only');

  if (res==='file' && act==='download_clean' && !ctx.tenantFlags?.FILES_V2_ENABLED)
    return t('Стриппинг EXIF отключён для вашего тенанта','EXIF stripping disabled for your tenant');

  if ((act==='transition'||act==='merge'||act==='split') && ctx.role==='USER')
    return t('Операция статуса доступна сотрудникам','Status operation is staff-only');

  if (res==='shipment' && act==='view' && ctx.role==='USER')
    return t('Вы можете видеть только свои отгрузки','You can only view your own shipments');

  return t('Недостаточно прав или неверный статус','Insufficient rights or invalid status');
}


