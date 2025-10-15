'use client';
import { useFSM } from '@/lib/fsm/useFSM';
import ReceivePartialDialog from '../ActionModals/ReceivePartialDialog';
import SplitDialog from '../ActionModals/SplitDialog';
import { useState, useEffect } from 'react';
import IfCan from '@/lib/acl/IfCan';

export default function StatusActionsV2({ chatId, role, initialStatus }:{
  chatId:string; role:'USER'|'ADMIN'|'SUPER_ADMIN'; initialStatus:any;
}) {
  const fsm = useFSM(chatId, initialStatus);
  const [openReceive, setOpenReceive] = useState(false);
  const [openSplit, setOpenSplit] = useState(false);

  useEffect(()=>{ if (!fsm.lines) fsm.loadLines(); }, [fsm]);

  const lines = (fsm.lines?.items ?? []).map(i=>({ id:i.id, name:i.name, qty:i.qty }));

  return (
    <div className="p-3 space-y-2">
      <IfCan resource="shipment" action="transition" mode="disable">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button className="h-11 rounded-xl bg-[var(--brand)] text-white" onClick={()=>setOpenReceive(true)} disabled={fsm.busy}>
            Частичный приём
          </button>
          <button className="h-11 rounded-xl border" onClick={()=>fsm.run('arrive_to_city')} disabled={fsm.busy}>
            Прибыло в город выдачи
          </button>
          <button className="h-11 rounded-xl border" onClick={()=>fsm.run('deliver_full')} disabled={fsm.busy}>
            Выдать (полностью)
          </button>
        </div>
      </IfCan>

      <IfCan resource="shipment" action="split" mode="disable">
        <button className="h-11 rounded-xl border w-full" onClick={()=>setOpenSplit(true)} disabled={fsm.busy}>
          Отделить часть (Split)
        </button>
      </IfCan>

      {/* Диалоги */}
      <ReceivePartialDialog
        open={openReceive}
        onClose={()=>setOpenReceive(false)}
        lines={lines}
        onSubmit={(payload)=>{ setOpenReceive(false); fsm.run('receive_partial', payload); }}
      />
      <SplitDialog
        open={openSplit}
        onClose={()=>setOpenSplit(false)}
        lines={lines}
        onSubmit={async (payload)=>{ setOpenSplit(false); const newId = await fsm.split(payload); if (newId) location.assign(`/chat/${newId}`); }}
      />
      {fsm.error && <div className="text-sm text-red-600">{fsm.error}</div>}
    </div>
  );
}


