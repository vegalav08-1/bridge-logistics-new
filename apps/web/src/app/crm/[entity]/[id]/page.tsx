'use client';
import { useMemo } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { useCRM } from '@/lib/crm/useCRM';
import { useSegments } from '@/lib/crm/useSegments';
import { asRow } from '@/lib/crm/timeline';
import HeaderCard from './components/HeaderCard';
import QuickActions from './components/QuickActions';
import StatsKpis from './components/StatsKpis';
import Timeline from './components/Timeline';
import TasksWidget from './components/TasksWidget';
import { useTasks } from '@/lib/crm/useTasks';

export default function CRM360({ params }: { params: { entity: 'user' | 'partner'; id: string } }) {
  const kind = params.entity === 'partner' ? 'PARTNER' : 'USER';
  const { profile, kpi, timeline, loading, setTimeline } = useCRM(params.id, kind);
  const segments = useSegments(profile).segments;
  const tasks = useTasks(params.id);

  const rows = useMemo(() => (timeline ?? []).map(asRow), [timeline]);

  if (loading || !profile) return <div className="p-3">Loading…</div>;

  return (
    <div className="container mx-auto p-3 space-y-3">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-4">
        <BackButton />
        <h1 className="text-lg font-semibold">Профиль {profile.displayName}</h1>
      </div>

      <HeaderCard name={profile.displayName} id={profile.id} kind={kind} segments={segments} />
      <QuickActions onNewShipment={() => { /* router.push('/shipments/new?user=...') */ }} onNewTask={() => { /* open modal */ }} onTag={() => { /* open tags */ }} />
      <StatsKpis kpi={kpi} />
      {/* TODO: ContactsCard / AddressesCard / TagsCard / SegmentsCard */}
      <Timeline items={rows} />
      <TasksWidget list={tasks.list} onToggle={tasks.toggle} onAdd={() => { /* modal add */ }} />
    </div>
  );
}

