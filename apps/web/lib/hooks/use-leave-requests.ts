'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { LeaveRequestResponse, LeaveTypeResponse } from '@recharge/shared';

export function useMyRequests() {
  const [requests, setRequests] = useState<LeaveRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<LeaveRequestResponse[]>('/leave-requests/me');
      setRequests(res);
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requests, loading, refresh };
}

export function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient<LeaveTypeResponse[]>('/leave-types')
      .then((data) => {
        setLeaveTypes(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load leave types:', err);
        setError('Failed to load leave types');
      })
      .finally(() => setLoading(false));
  }, []);

  return { leaveTypes, loading, error };
}

export async function createLeaveRequest(dto: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  note?: string;
}) {
  return apiClient<LeaveRequestResponse>('/leave-requests', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function approveRequest(id: string) {
  return apiClient<LeaveRequestResponse>(`/leave-requests/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function declineRequest(id: string) {
  return apiClient<LeaveRequestResponse>(`/leave-requests/${id}/decline`, {
    method: 'PATCH',
  });
}

export async function cancelRequest(id: string) {
  return apiClient<LeaveRequestResponse>(`/leave-requests/${id}/cancel`, {
    method: 'PATCH',
  });
}
