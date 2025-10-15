'use client';
import { RealtimeProvider } from '@/lib/realtime/context';

type Props = {
  wsUrl: string;
  children: React.ReactNode;
};

export default function RealtimeWrapper({ wsUrl, children }: Props) {
  const getToken = async () => {
    // В реальном приложении здесь должен быть получение JWT из auth
    return Promise.resolve('demo-token');
  };

  return (
    <RealtimeProvider wsUrl={wsUrl} getToken={getToken} log={false}>
      {children}
    </RealtimeProvider>
  );
}


