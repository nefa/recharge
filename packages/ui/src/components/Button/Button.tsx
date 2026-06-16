'use client'

import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material'

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'inherit'
  loading?: boolean
}

export function Button({
  children,
  loading = false,
  disabled,
  startIcon,
  ...props
}: ButtonProps) {
  return (
    <MuiButton
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </MuiButton>
  )
}

export default Button
