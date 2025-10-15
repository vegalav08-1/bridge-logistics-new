'use client';
import { useEffect, useState } from 'react';
import { resolveToken, acceptReferral } from '@/lib/referrals/api';
import { useRouter } from 'next/navigation';
import { REFERRALS_V2_ENABLED } from '@/lib/flags';

export default function ReferralJoin({ 
  params: { token } 
}: { 
  params: { token: string } 
}) {
  const [state, setState] = useState<'loading' | 'ready' | 'done' | 'error'>('loading');
  const [inviter, setInviter] = useState<any>(null);
  const r = useRouter();

  useEffect(() => {
    (async () => {
      if (!REFERRALS_V2_ENABLED) {
        setState('error');
        return;
      }

      const res = await resolveToken(token);
      if (!res?.inviter) { 
        setState('error'); 
        return; 
      }
      setInviter(res.inviter); 
      setState('ready');
    })();
  }, [token]);

  const accept = async () => {
    setState('loading');
    await acceptReferral(token);
    setState('done');
    r.push('/partners');  // после присоединения → в раздел партнёров
  };

  if (!REFERRALS_V2_ENABLED) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-500">Referrals feature is disabled</div>
      </div>
    );
  }

  if (state === 'loading') return <div className="p-6">Checking invite…</div>;
  if (state === 'error') return <div className="p-6 text-red-600">Invalid or expired token</div>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-lg font-semibold">Join by referral</h1>
      <div className="rounded-2xl border p-3">
        Вы присоединяетесь к <b>{inviter.name}</b> ({inviter.role})
      </div>
      <div className="flex gap-2">
        <button 
          className="h-11 px-4 rounded-xl border" 
          onClick={() => history.back()}
        >
          Cancel
        </button>
        <button 
          className="h-11 px-4 rounded-xl bg-[var(--brand)] text-white" 
          onClick={accept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}