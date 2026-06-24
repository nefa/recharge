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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Button, Card } from '@recharge/ui';
import { useAuth } from '@/lib/auth-context';
import { apiClient, ApiError } from '@/lib/api-client';
import { useTranslations } from 'next-intl';
import type { LeaveTypeResponse, PublicHolidayResponse } from '@recharge/shared';

export default function SettingsPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
  const [holidays, setHolidays] = useState<PublicHolidayResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<LeaveTypeResponse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [lt, h] = await Promise.all([
        apiClient<LeaveTypeResponse[]>('/leave-types'),
        apiClient<PublicHolidayResponse[]>(`/holidays?year=${new Date().getFullYear()}`),
      ]);
      setLeaveTypes(lt);
      setHolidays(h);
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await apiClient(`/leave-types/${id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setDeleteError(data?.message ?? 'Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('settings.title')}</Typography>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
          {deleteError}
        </Alert>
      )}

      <Card title={t('settings.companyInfo')} sx={{ mb: 3 }}>
        <Typography variant="body1">{user?.companyName}</Typography>
      </Card>

      <Card title={t('settings.leaveTypes')} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Button variant="outlined" size="small" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
            {t('settings.addLeaveType')}
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('settings.color')}</TableCell>
                <TableCell>{t('table.name')}</TableCell>
                <TableCell>{t('settings.defaultDays')}</TableCell>
                <TableCell>{t('settings.requiresApproval')}</TableCell>
                <TableCell>{t('settings.isPaid')}</TableCell>
                <TableCell align="right">{t('table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaveTypes.map((lt) => (
                <TableRow key={lt.id}>
                  <TableCell>
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: lt.color }} />
                  </TableCell>
                  <TableCell>{lt.name}</TableCell>
                  <TableCell>{lt.defaultDays}</TableCell>
                  <TableCell>{lt.requiresApproval ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{lt.isPaid ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setEditingType(lt)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(lt.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Card title={`${t('settings.publicHolidays')} — ${new Date().getFullYear()}`}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {holidays.map((h) => (
            <Chip key={h.id} label={`${h.date} — ${h.name}`} variant="outlined" />
          ))}
          {holidays.length === 0 && (
            <Typography variant="body2" color="text.secondary">{t('common.noResults')}</Typography>
          )}
        </Box>
      </Card>

      <LeaveTypeDialog
        open={createOpen || !!editingType}
        leaveType={editingType}
        onClose={() => { setCreateOpen(false); setEditingType(null); }}
        onSuccess={() => { refresh(); setCreateOpen(false); setEditingType(null); }}
      />
    </Box>
  );
}

function LeaveTypeDialog({
  open,
  leaveType,
  onClose,
  onSuccess,
}: {
  open: boolean;
  leaveType: LeaveTypeResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!leaveType;
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0B7A75');
  const [defaultDays, setDefaultDays] = useState(0);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leaveType) {
      setName(leaveType.name);
      setColor(leaveType.color);
      setDefaultDays(leaveType.defaultDays);
      setRequiresApproval(leaveType.requiresApproval);
      setIsPaid(leaveType.isPaid);
    } else {
      setName('');
      setColor('#0B7A75');
      setDefaultDays(0);
      setRequiresApproval(true);
      setIsPaid(true);
    }
  }, [leaveType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body = { name, color, defaultDays, requiresApproval, isPaid };
      if (isEdit) {
        await apiClient(`/leave-types/${leaveType.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      } else {
        await apiClient('/leave-types', { method: 'POST', body: JSON.stringify(body) });
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message ?? 'Failed to save');
      } else {
        setError('Failed to save');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField label="Color" type="color" value={color} onChange={(e) => setColor(e.target.value)} sx={{ width: 120 }} />
            <TextField
              label="Default Days"
              type="number"
              value={defaultDays}
              onChange={(e) => setDefaultDays(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0 } }}
              sx={{ width: 140 }}
            />
          </Box>
          <FormControlLabel
            control={<Switch checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />}
            label="Requires Approval"
          />
          <FormControlLabel
            control={<Switch checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />}
            label="Paid Leave"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
