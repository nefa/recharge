'use client'

import { Avatar as MuiAvatar, type AvatarProps as MuiAvatarProps } from '@mui/material'

export interface AvatarProps extends Omit<MuiAvatarProps, 'children'> {
  name: string
  src?: string
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success'
}

const sizeMap = { small: 32, medium: 40, large: 56 } as const
const fontSizeMap = { small: '0.75rem', medium: '1rem', large: '1.25rem' } as const

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function Avatar({ name, src, size = 'medium', color = 'primary', sx, ...props }: AvatarProps) {
  const dim = sizeMap[size]

  return (
    <MuiAvatar
      src={src}
      alt={name}
      sx={{
        width: dim,
        height: dim,
        fontSize: fontSizeMap[size],
        bgcolor: `${color}.main`,
        color: `${color}.contrastText`,
        ...sx,
      }}
      {...props}
    >
      {!src && getInitials(name)}
    </MuiAvatar>
  )
}

export default Avatar
