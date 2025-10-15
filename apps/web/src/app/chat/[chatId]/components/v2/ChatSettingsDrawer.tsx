'use client';
import { useState } from 'react';
import type { ChatSettings } from '@/lib/chat2/types';
import { chatSettingsSchema } from '@/lib/chat2/schema';

export default function ChatSettingsDrawer({
  open, onClose, initial, onSave, canEdit
}:{
  open:boolean; onClose:()=>void; initial:ChatSettings; onSave:(p:Partial<ChatSettings>)=>Promise<void>; canEdit:boolean;
}){
  const [v,setV]=useState<ChatSettings>(initial);
  const save=async()=>{
    if (!canEdit) return;
    const parsed = chatSettingsSchema.safeParse(v); if (!parsed.success) return;
    await onSave(parsed.data);
    onClose();
  };
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose}/>
      <div className="w-[380px] max-w-[85vw] bg-white h-full p-4 space-y-3">
        <div className="text-lg font-semibold">Настройки чата</div>
        <label className="flex items-center justify-between">
          <span>Бесшумный режим (muteAll)</span>
          <input type="checkbox" checked={!!v.muteAll} onChange={e=>setV({...v, muteAll:e.target.checked})}/>
        </label>
        <label className="flex items-center justify-between">
          <span>@Упоминания пробивают mute</span>
          <input type="checkbox" checked={!!v.allowMentionsOverride} onChange={e=>setV({...v, allowMentionsOverride:e.target.checked})}/>
        </label>
        <label className="flex items-center justify-between">
          <span>Внешние приглашения (QR/ссылка)</span>
          <input type="checkbox" checked={!!v.allowExternalInvite} onChange={e=>setV({...v, allowExternalInvite:e.target.checked})}/>
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button className="h-9 px-3 rounded-xl border" onClick={onClose}>Отмена</button>
          <button className="h-9 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={save} disabled={!canEdit}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

