'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Skeleton,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { Button, Card, Avatar } from '@recharge/ui';
import { useAuth } from '@/lib/auth-context';
import { apiClient, ApiError } from '@/lib/api-client';
import { useTranslations } from 'next-intl';
import type { DepartmentResponse } from '@recharge/shared';

interface CompanyUser {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
}

interface InviteRecord {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  usedAt: string | null;
}

export default function TeamPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([
        apiClient<CompanyUser[]>('/users'),
        apiClient<DepartmentResponse[]>('/departments'),
      ]);
      setUsers(u);
      setDepartments(d);
      if (isAdmin) {
        const inv = await apiClient<InviteRecord[]>('/invites');
        setInvites(inv);
      }
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  const pendingInvites = invites.filter((i) => !i.usedAt && new Date(i.expiresAt) > new Date());

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('team.title')}</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setInviteOpen(true)}>
            {t('team.inviteEmployee')}
          </Button>
        )}
      </Box>

      {departments.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {departments.map((dept) => {
            const members = users.filter((u) => u.departmentId === dept.id);
            return (
              <Grid key={dept.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card title={dept.name}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t('team.manager')}: {dept.managerName ?? '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {dept.memberCount} {t('team.members').toLowerCase()}
                  </Typography>
                  {members.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {members.map((m) => (
                        <Chip key={m.id} avatar={<Avatar name={m.name} size="small" />} label={m.name} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Card title={t('team.allEmployees')}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('table.name')}</TableCell>
                <TableCell>{t('table.email')}</TableCell>
                <TableCell>{t('team.role')}</TableCell>
                <TableCell>{t('team.department')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar name={u.name} size="small" />
                      {u.name}
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" color={u.role === 'admin' ? 'primary' : u.role === 'manager' ? 'secondary' : 'default'} />
                  </TableCell>
                  <TableCell>{u.departmentName ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {isAdmin && pendingInvites.length > 0 && (
        <Card title={t('invite.pendingInvites')} sx={{ mt: 3 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('table.email')}</TableCell>
                  <TableCell>{t('team.role')}</TableCell>
                  <TableCell>{t('invite.expires')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingInvites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.email}</TableCell>
                    <TableCell><Chip label={inv.role} size="small" /></TableCell>
                    <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={refresh} />
    </Box>
  );
}

function InviteDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient('/invites', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      setEmail('');
      setRole('employee');
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message ?? 'Failed to send invite');
      } else {
        setError('Failed to send invite');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{t('team.inviteEmployee')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
          <TextField select label={t('team.role')} value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
            <MenuItem value="employee">{t('team.employee')}</MenuItem>
            <MenuItem value="manager">{t('team.manager_role')}</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? t('invite.sending') : t('invite.sendInvite')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
