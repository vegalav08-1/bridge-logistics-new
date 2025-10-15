import type { Action, ACLContext, Resource, Role } from './types';

export type Rule = {
  res: Resource;
  act: Action;
  roles: Role[];
  when?: (ctx: ACLContext) => boolean;  // доп. условие
  soft?: boolean;                        // разрешено с предупреждением
};

export class Policy {
  private rules: Rule[] = [];
  allow(res: Resource, act: Action, roles: Role[], when?: Rule['when'], soft?: boolean) {
    this.rules.push({ res, act, roles, when, soft });
    return this;
  }
  list() { return this.rules.slice(); }
}

// --- условия (переиспользуемые helpers) ---
export const cond = {
  fsm: (ctx: ACLContext) => !!ctx.tenantFlags?.FSM_V2_ENABLED,
  files: (ctx: ACLContext) => !!ctx.tenantFlags?.FILES_V2_ENABLED,
  docs: (ctx: ACLContext) => !!ctx.tenantFlags?.DOCS_V2_ENABLED,
  owns: (ctx: ACLContext) => !!ctx.userId && !!ctx.ownerId && ctx.userId === ctx.ownerId,
};

export function buildPolicy() {
  const p = new Policy();
  // База
  p.allow('shipment','list',   ['USER','ADMIN','SUPER_ADMIN']);
  p.allow('shipment','view',   ['USER','ADMIN','SUPER_ADMIN'], (ctx)=>ctx.role!=='USER' || cond.owns(ctx));
  p.allow('request','create',  ['USER','ADMIN','SUPER_ADMIN']);

  // FSM/статусы
  p.allow('shipment','transition', ['ADMIN','SUPER_ADMIN'], cond.fsm);
  p.allow('shipment','partial',    ['ADMIN','SUPER_ADMIN'], cond.fsm);
  p.allow('shipment','merge',      ['ADMIN','SUPER_ADMIN'], cond.fsm);
  p.allow('shipment','split',      ['ADMIN','SUPER_ADMIN'], cond.fsm);

  // Финансы
  p.allow('finance','view',    ['ADMIN','SUPER_ADMIN']);
  p.allow('finance','invoice', ['ADMIN','SUPER_ADMIN']);
  p.allow('finance','pay',     ['USER','ADMIN','SUPER_ADMIN']); // окно оплаты валидирует бэк

  // Файлы/Viewer
  p.allow('file','download',       ['ADMIN','SUPER_ADMIN']); // Убираем USER из скачивания файлов
  p.allow('file','download_clean', ['ADMIN','SUPER_ADMIN'], cond.files);
  p.allow('file','ocr',            ['ADMIN','SUPER_ADMIN'], cond.files); // Убираем USER из OCR
  p.allow('file','annotate',       ['ADMIN','SUPER_ADMIN'], cond.files); // Убираем USER из аннотаций

  // Документы
  p.allow('document','esign', ['ADMIN','SUPER_ADMIN'], cond.docs); // Убираем USER из подписания документов

  // Партнёры/Админ/Аудит
  p.allow('partner','manage',  ['ADMIN','SUPER_ADMIN']);
  p.allow('admin_area','manage',['SUPER_ADMIN']); // Только SUPER_ADMIN для админ панели
  p.allow('audit','view',      ['ADMIN','SUPER_ADMIN']);

  return p.list();
}

export type PolicyRule = ReturnType<typeof buildPolicy>[number];


