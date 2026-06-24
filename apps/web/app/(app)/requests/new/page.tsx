'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { Button, Card } from '@recharge/ui';
import { useLeaveTypes, createLeaveRequest } from '@/lib/hooks/use-leave-requests';
import { useLeaveBalances } from '@/lib/hooks/use-leave-balances';
import { ApiError } from '@/lib/api-client';

export default function NewRequestPage() {
  const router = useRouter();
  const { leaveTypes, loading: ltLoading, error: ltError } = useLeaveTypes();
  const { balances } = useLeaveBalances();

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedType = leaveTypes.find((lt) => lt.id === leaveTypeId);
  const selectedBalance = balances.find((b) => b.leaveTypeId === leaveTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await createLeaveRequest({
        leaveTypeId,
        startDate,
        endDate,
        note: note || undefined,
      });
      router.push('/requests');
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message ?? 'Failed to create request');
      } else {
        setError('Failed to create request');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        New Leave Request
      </Typography>

      {(error || ltError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error || ltError}
        </Alert>
      )}

      <Card>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            label="Leave Type"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            required
            disabled={ltLoading || leaveTypes.length === 0}
            helperText={ltLoading ? 'Loading leave types...' : undefined}
          >
            {leaveTypes.length === 0 ? (
              <MenuItem disabled value="">
                {ltLoading ? 'Loading...' : 'No leave types available'}
              </MenuItem>
            ) : (
              leaveTypes.map((lt) => (
                <MenuItem key={lt.id} value={lt.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: lt.color }} />
                    {lt.name}
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>

          {selectedBalance && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Balance:
              </Typography>
              <Chip
                label={`${selectedBalance.remainingDays} days remaining`}
                size="small"
                color={selectedBalance.remainingDays > 0 ? 'success' : 'error'}
              />
              {selectedType && !selectedType.requiresApproval && (
                <Chip label="Auto-approved" size="small" color="info" />
              )}
            </Box>
          )}

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !leaveTypeId || !startDate || !endDate}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push('/requests')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
