import type { PartnersView, ReferralLink } from './types';

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function getPartnersView(): Promise<PartnersView> { 
  await wait(120); 
  return { 
    myAdmins: [], 
    myReferrals: [], 
    pendingInvites: [] 
  }; 
}

export async function createReferralLink(note?: string): Promise<ReferralLink> { 
  await wait(80); 
  return { 
    token: Math.random().toString(36).slice(2), 
    inviterId: 'me', 
    inviterRole: 'ADMIN', 
    createdAtISO: new Date().toISOString() 
  }; 
}

export async function resolveToken(token: string): Promise<{ inviter: { id: string; role: 'ADMIN' | 'USER'; name: string } | null }> { 
  await wait(120); 
  return { 
    inviter: { 
      id: 'adm_1', 
      role: 'ADMIN', 
      name: 'Admin Name'
    } 
  }; 
}

export async function acceptReferral(token: string): Promise<{ ok: true }> { 
  await wait(120); 
  return { ok: true }; 
}

export async function detachPartner(partnerId: string): Promise<{ ok: true }> { 
  await wait(80); 
  return { ok: true }; 
}

