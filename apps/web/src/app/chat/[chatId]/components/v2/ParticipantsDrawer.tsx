'use client';
import React from 'react';
import type { Participant, Role } from '@/lib/chat2/types';

export default function ParticipantsDrawer({
  open, onClose, list, onInvite, onToggleMute, canManage
}:{
  open:boolean; onClose:()=>void;
  list: Participant[];
  onInvite: (userId:string, role:Role)=>Promise<void>;
  onToggleMute: (userId:string, muted:boolean)=>Promise<void>;
  canManage:boolean;
}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose}/>
      <div className="w-[420px] max-w-[90vw] bg-white h-full p-4 space-y-3">
        <div className="text-lg font-semibold">Участники</div>
        <div className="space-y-2">
          {list.map(p=>(
            <div key={p.userId} className="rounded-xl border p-2 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">{p.displayName || p.userId}</div>
                <div className="text-xs text-gray-600">{p.role} · {p.muted ? 'muted' : 'active'}</div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center gap-1">
                  <input type="checkbox" checked={!!p.muted} onChange={(e)=>onToggleMute(p.userId, e.target.checked)}/>
                  mute
                </label>
              </div>
            </div>
          ))}
        </div>
        {canManage && (
          <div className="pt-2">
            <InviteForm onInvite={onInvite}/>
          </div>
        )}
      </div>
    </div>
  );
}

function InviteForm({ onInvite }:{ onInvite:(userId:string, role:Role)=>Promise<void> }){
  const [id,setId]=React.useState(''); 
  const [role,setRole]=React.useState<Role>('USER');
  return (
    <div className="rounded-xl border p-2 space-y-2">
      <div className="text-sm font-medium">Добавить участника</div>
      <input className="h-9 rounded-lg border px-2 w-full" placeholder="userId" value={id} onChange={e=>setId(e.target.value)}/>
      <select className="h-9 rounded-lg border px-2 w-full" value={role} onChange={e=>setRole(e.target.value as Role)}>
        <option value="USER">USER</option><option value="ADMIN">ADMIN</option><option value="SUPER_ADMIN">SUPER_ADMIN</option>
      </select>
      <button className="h-9 px-3 rounded-xl bg-[var(--brand)] text-white" onClick={()=>onInvite(id, role)} disabled={!id}>Пригласить</button>
    </div>
  );
}

