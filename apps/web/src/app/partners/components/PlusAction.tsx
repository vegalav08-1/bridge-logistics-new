'use client';
import { useState } from 'react';
import CreateLinkDialog from '@/app/partners/components/CreateLinkDialog';
import JoinByTokenDialog from '@/app/partners/components/JoinByTokenDialog';

export default function PlusAction({ 
  role 
}: { 
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' 
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  
  return (
    <>
      <button
        aria-label={isAdmin ? 'Create referral link' : 'Join by referral link'}
        className="h-11 w-11 rounded-xl border grid place-items-center"
        onClick={() => isAdmin ? setOpenCreate(true) : setOpenJoin(true)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <circle cx="9" cy="9" r="4" stroke="currentColor" fill="none"/>
          <path d="M16 19v-6m-3 3h6" stroke="currentColor"/>
        </svg>
      </button>
      <CreateLinkDialog 
        open={openCreate} 
        onClose={() => setOpenCreate(false)} 
      />
      <JoinByTokenDialog 
        open={openJoin} 
        onClose={() => setOpenJoin(false)} 
      />
    </>
  );
}
