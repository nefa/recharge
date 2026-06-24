'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Button, StatusBadge, Card } from '@recharge/ui';
import { useMyRequests } from '@/lib/hooks/use-leave-requests';
import { useTranslations } from 'next-intl';
import type { StatusType } from '@recharge/ui';

const STATUS_TABS = ['all', 'pending', 'approved', 'declined', 'cancelled'] as const;

export default function RequestsPage() {
  const router = useRouter();
  const { requests, loading } = useMyRequests();
  const [tab, setTab] = useState(0);
  const t = useTranslations();

  const tabLabels: Record<string, string> = {
    all: t('requests.all'),
    pending: t('status.pending'),
    approved: t('status.approved'),
    declined: t('status.declined'),
    cancelled: t('status.cancelled'),
  };

  const filtered =
    tab === 0
      ? requests
      : requests.filter((r) => r.status === STATUS_TABS[tab]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('nav.requests')}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/requests/new')}
        >
          {t('requests.newRequest')}
        </Button>
      </Box>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          {STATUS_TABS.map((s) => (
            <Tab key={s} label={tabLabels[s]} />
          ))}
        </Tabs>

        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={40} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {t('table.noData')}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.dates')}</TableCell>
                  <TableCell>{t('table.type')}</TableCell>
                  <TableCell>{t('requests.workingDays')}</TableCell>
                  <TableCell>{t('table.status')}</TableCell>
                  <TableCell>{t('requests.note')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/requests/${r.id}`)}
                  >
                    <TableCell>
                      {r.startDate} — {r.endDate}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.leaveTypeName}
                        size="small"
                        sx={{ bgcolor: r.leaveTypeColor, color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell>{r.workingDays}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.status as StatusType} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {r.note || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}
