export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type Partner = { 
  id: string; 
  name: string; 
  role: Role; 
  phone?: string; 
  email?: string; 
  joinedAtISO: string; 
};
export type ReferralLink = { 
  token: string; 
  inviterId: string; 
  inviterRole: Role; 
  createdAtISO: string; 
};

export type PartnersView = {
  myAdmins: Partner[];    // для роли USER — администраторы, к которым он привязан
  myReferrals: Partner[]; // для роли ADMIN — пользователи, присоединившиеся по его ссылке
  pendingInvites: { token: string; createdAtISO: string; note?: string }[];
};

