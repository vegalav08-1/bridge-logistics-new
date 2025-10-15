import '../styles/globals.css';
import type { Metadata } from 'next';
import * as React from 'react';
import { PWAProvider } from '@/components/PWAProvider';
import { FLAGS } from '@yp/shared';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Container } from '@/components/layout/Container';
import { Page } from '@/components/layout/Page';
import { UI_V2_ENABLED, BOTTOM_NAV_ENABLED, APP_HEADER_ENABLED, VIEWER_V2_ENABLED, INBOX_V2_ENABLED, REALTIME_V2_ENABLED, ACL_V2_ENABLED, NOTIFICATIONS_V2_ENABLED } from '@/lib/flags';
import ViewerProvider from '@/components/viewer/ViewerProvider';
import { InboxProvider } from '@/lib/inbox/context';
import RealtimeWrapper from '@/components/realtime/RealtimeWrapper';
import ToasterBridge from '@/components/toast/ToasterBridge';
import { ACLProvider } from '@/lib/acl/context';
import ACLDevtools from '@/lib/acl/devtools';
import { initTestNotifications } from '@/lib/notifications/seed';
import { initDevHelpers } from '@/lib/partners/dev-helpers';
import { 
  Package, 
  Search, 
  PlusSquare, 
  Users,
  User,
  Home,
  ArrowLeft,
  Bell,
  Menu,
  UserCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bridge Logistics',
  description: 'Система управления логистикой и отгрузками',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://example.com/ws';
  
  // Инициализация тестовых данных для уведомлений в development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && NOTIFICATIONS_V2_ENABLED) {
    React.useEffect(() => {
      initTestNotifications();
    }, []);
  }
  
  // Инициализация dev helpers для партнеров
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    React.useEffect(() => {
      initDevHelpers();
    }, []);
  }
  
  // Получаем информацию о пользователе из сессии
  // В реальном приложении это будет получаться из cookies/headers
  const getServerSession = async () => {
    // Для SSR получаем сессию из cookies
    const { getServerSession } = await import('@/lib/auth/session');
    return getServerSession(undefined); // В реальном приложении передавать cookie header
  };

  // Пока используем mock данные, но структура готова для реальных сессий
  const mockUserId = process.env.NEXT_PUBLIC_USER_ID || 'user-1';
  const mockUserRole = process.env.NEXT_PUBLIC_USER_ROLE as 'SUPER_ADMIN' | 'ADMIN' | 'USER' | undefined;
  
  let userRole: 'SUPER_ADMIN' | 'ADMIN' | 'USER' = 'SUPER_ADMIN';
  if (mockUserRole) {
    userRole = mockUserRole;
  } else {
    if (mockUserId === 'user-1') userRole = 'SUPER_ADMIN';
    else if (mockUserId === 'user-2') userRole = 'ADMIN';
    else if (mockUserId === 'user-3') userRole = 'USER';
  }
  
  const aclContext = {
    role: userRole,
    userId: mockUserId,
    email: mockUserId === 'user-1' ? 'vegalav0202@gmail.com' : mockUserId === 'user-2' ? 'admin@example.com' : 'user@example.com',
    tenantFlags: {
      FSM_V2_ENABLED: true,
      FILES_V2_ENABLED: true,
      DOCS_V2_ENABLED: true,
    },
    locale: 'ru' as const,
  };

  const content = (
    <>
      {VIEWER_V2_ENABLED ? (
        <ViewerProvider>
          <ThemeProvider>
            {FLAGS.PWA_ENABLED ? (
              <PWAProvider>
                {UI_V2_ENABLED ? (
                  <Page
                    withHeader={APP_HEADER_ENABLED}
                    withBottomNav={BOTTOM_NAV_ENABLED}
                    header={
                      APP_HEADER_ENABLED ? (
                        <AppHeader
                          title="Bridge Logistics"
                          right={
                            <a 
                              href="/" 
                              className="h-10 w-10 rounded-xl border grid place-items-center hover:bg-[var(--muted)] transition-colors"
                              aria-label="Главная страница"
                            >
                              <Home className="h-5 w-5" />
                            </a>
                          }
                        />
                      ) : null
                    }
                    footer={
                      BOTTOM_NAV_ENABLED ? (
                        <BottomNav
                          items={[
                            {
                              href: '/shipments',
                              label: 'Отгрузки',
                              icon: <Package className="h-5 w-5" />,
                            },
                            {
                              href: '/search',
                              label: 'Поиск',
                              icon: <Search className="h-5 w-5" />,
                            },
                            {
                              href: '/shipments/new',
                              label: 'Создать',
                              icon: <PlusSquare className="h-5 w-5" />,
                            },
                            {
                              href: '/partners',
                              label: 'Партнеры',
                              icon: <Users className="h-5 w-5" />,
                            },
                            {
                              href: '/account',
                              label: 'Аккаунт',
                              icon: <User className="h-5 w-5" />,
                            },
                          ]}
                        />
                      ) : null
                    }
                  >
                    <Container>
                      {children}
                    </Container>
                  </Page>
                ) : (
                  children
                )}
              </PWAProvider>
            ) : (
              UI_V2_ENABLED ? (
                <Page
                  withHeader={APP_HEADER_ENABLED}
                  withBottomNav={BOTTOM_NAV_ENABLED}
                  header={
                    APP_HEADER_ENABLED ? (
                      <AppHeader
                        title="Bridge Logistics"
                        left={<ArrowLeft className="h-5 w-5" />}
                        right={
                          <>
                            <Bell className="h-5 w-5" />
                            <Menu className="h-5 w-5" />
                          </>
                        }
                      />
                    ) : null
                  }
                  footer={
                    BOTTOM_NAV_ENABLED ? (
                      <BottomNav
                        items={[
                          {
                            href: '/shipments',
                            label: 'Отгрузки',
                            icon: <Package className="h-5 w-5" />,
                          },
                          {
                            href: '/search',
                            label: 'Поиск',
                            icon: <Search className="h-5 w-5" />,
                          },
                          {
                            href: '/shipments/new',
                            label: 'Создать',
                            icon: <PlusSquare className="h-5 w-5" />,
                          },
                          {
                            href: '/partners',
                            label: 'Партнеры',
                            icon: <Users className="h-5 w-5" />,
                          },
                          {
                            href: '/account',
                            label: 'Аккаунт',
                            icon: <User className="h-5 w-5" />,
                          },
                        ]}
                      />
                    ) : null
                  }
                >
                  <Container>
                    {children}
                  </Container>
                </Page>
              ) : (
                children
              )
            )}
          </ThemeProvider>
        </ViewerProvider>
      ) : (
        <ThemeProvider>
          {FLAGS.PWA_ENABLED ? (
            <PWAProvider>
              {UI_V2_ENABLED ? (
                <Page
                  withHeader={APP_HEADER_ENABLED}
                  withBottomNav={BOTTOM_NAV_ENABLED}
                  header={
                    APP_HEADER_ENABLED ? (
                      <AppHeader
                        title="Bridge Logistics"
                        left={<ArrowLeft className="h-5 w-5" />}
                        right={
                          <>
                            <Bell className="h-5 w-5" />
                            <Menu className="h-5 w-5" />
                          </>
                        }
                      />
                    ) : null
                  }
                  footer={
                    BOTTOM_NAV_ENABLED ? (
                      <BottomNav
                        items={[
                          {
                            href: '/shipments',
                            label: 'Отгрузки',
                            icon: <Package className="h-5 w-5" />,
                          },
                          {
                            href: '/search',
                            label: 'Поиск',
                            icon: <Search className="h-5 w-5" />,
                          },
                          {
                            href: '/shipments/new',
                            label: 'Создать',
                            icon: <PlusSquare className="h-5 w-5" />,
                          },
                          {
                            href: '/partners',
                            label: 'Партнеры',
                            icon: <Users className="h-5 w-5" />,
                          },
                          {
                            href: '/account',
                            label: 'Аккаунт',
                            icon: <User className="h-5 w-5" />,
                          },
                        ]}
                      />
                    ) : null
                  }
                >
                  <Container>
                    {children}
                  </Container>
                </Page>
              ) : (
                children
              )}
            </PWAProvider>
          ) : (
            UI_V2_ENABLED ? (
              <Page
                withHeader={APP_HEADER_ENABLED}
                withBottomNav={BOTTOM_NAV_ENABLED}
                header={
                  APP_HEADER_ENABLED ? (
                    <AppHeader
                      title="Bridge Logistics"
                      left={<ArrowLeft className="h-5 w-5" />}
                      right={
                        <>
                          <Bell className="h-5 w-5" />
                          <Menu className="h-5 w-5" />
                        </>
                      }
                    />
                  ) : null
                }
                footer={
                  BOTTOM_NAV_ENABLED ? (
                    <BottomNav
                      items={[
                        {
                          href: '/shipments',
                          label: 'Отгрузки',
                          icon: <Package className="h-5 w-5" />,
                        },
                        {
                          href: '/search',
                          label: 'Поиск',
                          icon: <Search className="h-5 w-5" />,
                        },
                        {
                          href: '/shipments/new',
                          label: 'Создать',
                          icon: <PlusSquare className="h-5 w-5" />,
                        },
                        {
                          href: '/partners',
                          label: 'Партнеры',
                          icon: <Users className="h-5 w-5" />,
                        },
                        {
                          href: '/account',
                          label: 'Аккаунт',
                          icon: <User className="h-5 w-5" />,
                        },
                      ]}
                    />
                  ) : null
                }
              >
                <Container maxWidth="6xl">
                  {children}
                </Container>
              </Page>
            ) : (
              children
            )
          )}
        </ThemeProvider>
      )}
    </>
  );

  return (
    <html lang="ru">
      <head>
        {FLAGS.PWA_ENABLED && (
          <>
            <link rel="manifest" href="/manifest.webmanifest" />
            <meta name="theme-color" content="#00A86B" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Bridge Logistics" />
            <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          </>
        )}
      </head>
      <body>
        {ACL_V2_ENABLED ? (
          <ACLProvider ctx={aclContext}>
            {REALTIME_V2_ENABLED ? (
              <RealtimeWrapper wsUrl={wsUrl}>
                {INBOX_V2_ENABLED ? (
                  <InboxProvider>
                    {content}
                    <ToasterBridge />
                    <ACLDevtools />
                  </InboxProvider>
                ) : (
                  <>
                    {content}
                    <ToasterBridge />
                    <ACLDevtools />
                  </>
                )}
              </RealtimeWrapper>
            ) : (
              INBOX_V2_ENABLED ? (
                <InboxProvider>
                  {content}
                  <ACLDevtools />
                </InboxProvider>
              ) : (
                <>
                  {content}
                  <ACLDevtools />
                </>
              )
            )}
          </ACLProvider>
        ) : (
          REALTIME_V2_ENABLED ? (
            <RealtimeWrapper wsUrl={wsUrl}>
              {INBOX_V2_ENABLED ? (
                <InboxProvider>
                  {content}
                  <ToasterBridge />
                </InboxProvider>
              ) : (
                <>
                  {content}
                  <ToasterBridge />
                </>
              )}
            </RealtimeWrapper>
          ) : (
            INBOX_V2_ENABLED ? (
              <InboxProvider>
                {content}
              </InboxProvider>
            ) : (
              content
            )
          )
        )}
      </body>
    </html>
  );
}