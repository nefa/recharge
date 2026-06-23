'use client'

import { Chip, type ChipProps } from '@mui/material'

export type StatusType = 'approved' | 'pending' | 'rejected' | 'declined' | 'cancelled'

export interface StatusBadgeProps extends Omit<ChipProps, 'color' | 'label'> {
  status: StatusType
  label?: string
}

const statusConfig: Record<StatusType, { label: string; color: ChipProps['color'] }> = {
  approved: { label: 'Approved', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
  declined: { label: 'Declined', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' },
}

export function StatusBadge({ status, label, size = 'small', ...props }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Chip
      label={label ?? config.label}
      color={config.color}
      size={size}
      {...props}
    />
  )
}

export default StatusBadge
