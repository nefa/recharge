'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { LeaveBalanceResponse } from '@recharge/shared';

export function useLeaveBalances(year?: number) {
  const [balances, setBalances] = useState<LeaveBalanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const currentYear = year ?? new Date().getFullYear();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<LeaveBalanceResponse[]>(
        `/leave-balances/me?year=${currentYear}`,
      );
      setBalances(res);
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balances, loading, refresh };
}
