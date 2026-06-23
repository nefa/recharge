'use client';

import { useState, useEffect } from 'react';
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      label: 'Dashboard',
      icon: <Dashboard />,
      active: pathname === '/dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      label: 'Calendar',
      icon: <CalendarMonth />,
      active: pathname === '/calendar',
      onClick: () => router.push('/calendar'),
    },
    {
      label: 'My Requests',
      icon: <EventNote />,
      active: pathname.startsWith('/requests'),
      onClick: () => router.push('/requests'),
    },
    ...(user?.role !== 'employee'
      ? [
          {
            label: 'Team',
            icon: <Group />,
            active: pathname === '/team',
            onClick: () => router.push('/team'),
          },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          {
            label: 'Settings',
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
        userMenu={<Avatar name={user?.name ?? ''} size="small" />}
        menuItems={[
          {
            label: 'Logout',
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
