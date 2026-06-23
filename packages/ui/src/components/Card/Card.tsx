'use client'

import {
  Card as MuiCard,
  CardContent,
  Typography,
  Box,
  type CardProps as MuiCardProps,
} from '@mui/material'
import { type ReactNode } from 'react'

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: string
  children: ReactNode
}

export function Card({ title, children, ...props }: CardProps) {
  return (
    <MuiCard variant="outlined" {...props}>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </MuiCard>
  )
}

export interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success'
}

export function StatCard({ label, value, icon, color = 'primary' }: StatCardProps) {
  return (
    <MuiCard variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.contrastText`,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </MuiCard>
  )
}

export default Card
