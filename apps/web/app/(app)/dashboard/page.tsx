'use client';

import { Box, Typography, Grid, Skeleton, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Alert } from '@mui/material';
import { BeachAccess, HourglassTop, EventAvailable, Check, Close } from '@mui/icons-material';
import { StatCard, Card, StatusBadge, Avatar } from '@recharge/ui';
import { useAuth } from '@/lib/auth-context';
import { useDashboard, useTeamDashboard } from '@/lib/hooks/use-dashboard';
import { approveRequest, declineRequest } from '@/lib/hooks/use-leave-requests';
import { useState } from 'react';
import type { StatusType } from '@recharge/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useDashboard();
  const { data: teamData, loading: teamLoading, refresh: refreshTeam } = useTeamDashboard();
  const [actionError, setActionError] = useState<string | null>(null);

  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';

  const annualBalance = data?.balances?.find((b) => b.leaveTypeName.includes('odihna'));
  const pendingCount = data?.recentRequests?.filter((r) => r.status === 'pending').length ?? 0;
  const usedDays = data?.balances?.reduce((sum, b) => sum + b.usedDays, 0) ?? 0;

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      await approveRequest(id);
      refresh();
      refreshTeam();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Failed to approve');
    }
  };

  const handleDecline = async (id: string) => {
    setActionError(null);
    try {
      await declineRequest(id);
      refresh();
      refreshTeam();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Failed to decline');
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Annual Leave Balance"
            value={annualBalance ? `${annualBalance.remainingDays} / ${annualBalance.allowanceDays}` : '—'}
            icon={<BeachAccess />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Pending Requests"
            value={pendingCount}
            icon={<HourglassTop />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Days Used This Year"
            value={usedDays}
            icon={<EventAvailable />}
            color="success"
          />
        </Grid>
      </Grid>

      {isManagerOrAdmin && teamData && teamData.pendingRequests.length > 0 && (
        <Card title="Pending Approvals" sx={{ mb: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.pendingRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar name={r.userName} size="small" />
                        {r.userName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.leaveTypeName}
                        size="small"
                        sx={{ bgcolor: r.leaveTypeColor, color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell>{r.startDate} — {r.endDate}</TableCell>
                    <TableCell>{r.workingDays}</TableCell>
                    <TableCell align="right">
                      <IconButton color="success" size="small" onClick={() => handleApprove(r.id)}>
                        <Check />
                      </IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDecline(r.id)}>
                        <Close />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {isManagerOrAdmin && teamData && teamData.teamOnLeaveToday.length > 0 && (
        <Card title="Team On Leave Today" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {teamData.teamOnLeaveToday.map((t) => (
              <Chip
                key={t.userId}
                avatar={<Avatar name={t.userName} size="small" />}
                label={`${t.userName} — ${t.leaveType}`}
                variant="outlined"
              />
            ))}
          </Box>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card title="Upcoming Leave">
            {data?.upcomingRequests && data.upcomingRequests.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {data.upcomingRequests.map((r) => (
                  <Box key={r.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {r.leaveTypeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.startDate} — {r.endDate} ({r.workingDays} days)
                      </Typography>
                    </Box>
                    <StatusBadge status={r.status as StatusType} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming leave scheduled.
              </Typography>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card title="Recent Requests">
            {data?.recentRequests && data.recentRequests.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dates</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentRequests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.startDate} — {r.endDate}</TableCell>
                        <TableCell>{r.leaveTypeName}</TableCell>
                        <TableCell>{r.workingDays}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.status as StatusType} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No requests yet.
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
