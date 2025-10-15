'use client';
import { useEffect, useState } from 'react';
import * as api from './api';
import type { PartnersView, ReferralLink } from './types';

export function useReferrals() {
  const [view, setView] = useState<PartnersView | null>(null);
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(false);
  
  const load = async () => { 
    setLoading(true); 
    const v = await api.getPartnersView(); 
    setView(v); 
    setLoading(false); 
  };
  
  const createLink = async (note?: string) => { 
    const l = await api.createReferralLink(note); 
    setLinks(prev => [l, ...prev]); 
    return l; 
  };
  
  const remove = async (id: string) => { 
    await api.detachPartner(id); 
    await load(); 
  };
  
  useEffect(() => { load(); }, []);
  
  return { view, links, loading, load, createLink, remove };
}

