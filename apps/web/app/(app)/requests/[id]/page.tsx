'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Skeleton,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { Button, Card, StatusBadge, Avatar } from '@recharge/ui';
import { apiClient, ApiError } from '@/lib/api-client';
import { approveRequest, declineRequest, cancelRequest } from '@/lib/hooks/use-leave-requests';
import { useAuth } from '@/lib/auth-context';
import type { LeaveRequestResponse } from '@recharge/shared';
import type { StatusType } from '@recharge/ui';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [request, setRequest] = useState<LeaveRequestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    apiClient<LeaveRequestResponse>(`/leave-requests/${id}`)
      .then(setRequest)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: 'approve' | 'decline' | 'cancel') => {
    setActing(true);
    setActionError(null);
    try {
      const fns = { approve: approveRequest, decline: declineRequest, cancel: cancelRequest };
      const updated = await fns[action](id);
      setRequest(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setActionError(data?.message ?? `Failed to ${action}`);
      } else {
        setActionError(`Failed to ${action}`);
      }
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, maxWidth: 600 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Request not found.</Alert>
      </Box>
    );
  }

  const isOwner = user?.id === request.userId;
  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';
  const canApprove = isManagerOrAdmin && request.status === 'pending';
  const canCancel = isOwner && (request.status === 'pending' || request.status === 'approved');

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Leave Request
      </Typography>

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Card>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar name={request.userName} size="small" />
              <Typography variant="h6">{request.userName}</Typography>
            </Box>
            <StatusBadge status={request.status as StatusType} />
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <DetailRow label="Leave Type">
              <Chip
                label={request.leaveTypeName}
                size="small"
                sx={{ bgcolor: request.leaveTypeColor, color: '#fff' }}
              />
            </DetailRow>
            <DetailRow label="Dates">
              {request.startDate} — {request.endDate}
            </DetailRow>
            <DetailRow label="Working Days">{request.workingDays}</DetailRow>
            {request.note && <DetailRow label="Note">{request.note}</DetailRow>}
            {request.approverName && (
              <DetailRow label="Decided By">{request.approverName}</DetailRow>
            )}
            {request.decidedAt && (
              <DetailRow label="Decided At">
                {new Date(request.decidedAt).toLocaleDateString()}
              </DetailRow>
            )}
            <DetailRow label="Submitted">
              {new Date(request.createdAt).toLocaleDateString()}
            </DetailRow>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', gap: 2 }}>
            {canApprove && (
              <>
                <Button variant="contained" color="success" onClick={() => handleAction('approve')} disabled={acting}>
                  Approve
                </Button>
                <Button variant="contained" color="error" onClick={() => handleAction('decline')} disabled={acting}>
                  Decline
                </Button>
              </>
            )}
            {canCancel && (
              <Button variant="outlined" color="error" onClick={() => handleAction('cancel')} disabled={acting}>
                Cancel Request
              </Button>
            )}
            <Button variant="outlined" onClick={() => router.push('/requests')}>
              Back
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}
