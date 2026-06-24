'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { DashboardMyResponse, DashboardTeamResponse } from '@recharge/shared';

export function useDashboard() {
  const [data, setData] = useState<DashboardMyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<DashboardMyResponse>('/dashboard/me');
      setData(res);
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}

export function useTeamDashboard() {
  const [data, setData] = useState<DashboardTeamResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<DashboardTeamResponse>('/dashboard/team');
      setData(res);
    } catch {
      // may fail for employees (403)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
