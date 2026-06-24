'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import {
  Dashboard,
  CalendarMonth,
  EventNote,
  Group,
  Settings,
} from '@mui/icons-material';
import { AppBar, Sidebar, Avatar } from '@recharge/ui';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/lib/components/locale-switcher';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = useTranslations('nav');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const sidebarItems = [
    {
      label: t('dashboard'),
      icon: <Dashboard />,
      active: pathname === '/dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      label: t('calendar'),
      icon: <CalendarMonth />,
      active: pathname === '/calendar',
      onClick: () => router.push('/calendar'),
    },
    {
      label: t('requests'),
      icon: <EventNote />,
      active: pathname.startsWith('/requests'),
      onClick: () => router.push('/requests'),
    },
    ...(user?.role !== 'employee'
      ? [
          {
            label: t('team'),
            icon: <Group />,
            active: pathname === '/team',
            onClick: () => router.push('/team'),
          },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          {
            label: t('settings'),
            icon: <Settings />,
            active: pathname === '/settings',
            onClick: () => router.push('/settings'),
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        companyName={user?.companyName ?? 'Recharge'}
        userMenu={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocaleSwitcher />
            <Avatar name={user?.name ?? ''} size="small" />
          </Box>
        }
        menuItems={[
          {
            label: t('logout'),
            onClick: async () => {
              await logout();
              router.push('/login');
            },
          },
        ]}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar
          items={sidebarItems}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            bgcolor: 'grey.50',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
