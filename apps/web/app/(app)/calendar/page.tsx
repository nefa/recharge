'use client';

import { useState, useMemo, Fragment } from 'react';
import {
  Box,
  Typography,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Card, Avatar } from '@recharge/ui';
import { useWallchart, useDepartments } from '@/lib/hooks/use-wallchart';
import { useAuth } from '@/lib/auth-context';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [departmentId, setDepartmentId] = useState<string>('');

  const isManagerOrAdmin = user?.role === 'admin' || user?.role === 'manager';
  const { departments } = useDepartments();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startStr = format(monthStart, 'yyyy-MM-dd');
  const endStr = format(monthEnd, 'yyyy-MM-dd');

  const { entries, loading } = useWallchart(startStr, endStr, departmentId || undefined);

  const daysInMonth = useMemo(() => {
    const days: { date: string; dayNum: number; dayOfWeek: number }[] = [];
    const d = new Date(monthStart);
    while (d <= monthEnd) {
      days.push({
        date: format(d, 'yyyy-MM-dd'),
        dayNum: d.getDate(),
        dayOfWeek: getDay(d),
      });
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [monthStart.getTime(), monthEnd.getTime()]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Calendar</Typography>

        {isManagerOrAdmin && departments.length > 0 && (
          <TextField
            select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      <Card>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>
          <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight />
          </IconButton>
        </Box>

        {loading ? (
          <Box>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: `160px repeat(${daysInMonth.length}, 28px)`,
                gap: '1px',
                minWidth: 160 + daysInMonth.length * 29,
              }}
            >
              {/* Header row */}
              <Box sx={{ p: 0.5, fontWeight: 600, fontSize: 12 }} />
              {daysInMonth.map((d) => (
                <Box
                  key={d.date}
                  sx={{
                    p: 0.25,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: d.dayOfWeek === 0 || d.dayOfWeek === 6 ? 'text.disabled' : 'text.primary',
                  }}
                >
                  {d.dayNum}
                </Box>
              ))}

              {/* Employee rows */}
              {entries.map((entry) => (
                <Fragment key={entry.userId}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 0.5,
                      py: 0.25,
                      fontSize: 12,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Avatar name={entry.userName} size="small" />
                    <Typography variant="body2" noWrap sx={{ fontSize: 12 }}>
                      {entry.userName}
                    </Typography>
                  </Box>
                  {entry.days.map((day) => (
                    <Tooltip
                      key={`${entry.userId}-${day.date}`}
                      title={
                        day.type === 'leave'
                          ? `${day.leaveType}`
                          : day.type === 'holiday'
                            ? 'Public Holiday'
                            : day.type === 'weekend'
                              ? 'Weekend'
                              : ''
                      }
                      arrow
                      disableHoverListener={!day.type}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 0.5,
                          bgcolor:
                            day.type === 'leave'
                              ? day.leaveColor ?? '#0B7A75'
                              : day.type === 'holiday'
                                ? '#FFF3E0'
                                : day.type === 'weekend'
                                  ? '#F5F5F5'
                                  : 'transparent',
                          border: day.type === 'holiday' ? '1px solid #FFB74D' : '1px solid #eee',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Fragment>
              ))}
            </Box>

            {entries.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No employees to display.
              </Typography>
            )}
          </Box>
        )}

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <LegendItem color="#0B7A75" label="Leave" />
          <LegendItem color="#FFF3E0" border="#FFB74D" label="Holiday" />
          <LegendItem color="#F5F5F5" label="Weekend" />
        </Box>
      </Card>
    </Box>
  );
}

function LegendItem({ color, border, label }: { color: string; border?: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: color, border: border ? `1px solid ${border}` : '1px solid #eee' }} />
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}
