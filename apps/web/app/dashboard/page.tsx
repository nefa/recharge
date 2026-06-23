'use client';

import { Box, Typography, Grid } from '@mui/material';
import {
  BeachAccess,
  HourglassTop,
  EventAvailable,
} from '@mui/icons-material';
import { StatCard, Card } from '@recharge/ui';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Leave Balance"
            value="18 / 21 days"
            icon={<BeachAccess />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Pending Requests"
            value={2}
            icon={<HourglassTop />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            label="Approved This Month"
            value={5}
            icon={<EventAvailable />}
            color="success"
          />
        </Grid>
      </Grid>

      <Card title="Recent Requests">
        <Typography variant="body2" color="text.secondary">
          No recent requests yet.
        </Typography>
      </Card>
    </Box>
  );
}
