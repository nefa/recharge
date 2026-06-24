'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api-client';
import type { WallchartEntry, DepartmentResponse } from '@recharge/shared';

export function useWallchart(start: string, end: string, departmentId?: string) {
  const [entries, setEntries] = useState<WallchartEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/calendar/wallchart?start=${start}&end=${end}`;
      if (departmentId) url += `&departmentId=${departmentId}`;
      const res = await apiClient<WallchartEntry[]>(url);
      setEntries(res);
    } catch {
      // handled by api-client
    } finally {
      setLoading(false);
    }
  }, [start, end, departmentId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, loading, refresh };
}

export function useDepartments() {
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<DepartmentResponse[]>('/departments')
      .then(setDepartments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading };
}
