'use client'

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { type ReactNode } from 'react'

export interface SidebarItem {
  label: string
  icon?: ReactNode
  active?: boolean
  onClick?: () => void
}

export interface SidebarProps {
  items: SidebarItem[]
  open: boolean
  onClose?: () => void
  width?: number
}

const SIDEBAR_WIDTH = 240

export function Sidebar({ items, open, onClose, width = SIDEBAR_WIDTH }: SidebarProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const content = (
    <Box sx={{ width, pt: 1 }}>
      <List disablePadding>
        {items.map((item) => (
          <ListItemButton
            key={item.label}
            selected={item.active}
            onClick={item.onClick}
            sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}
          >
            {item.icon && <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>}
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onClose={onClose} variant="temporary" ModalProps={{ keepMounted: true }}>
        {content}
      </Drawer>
    )
  }

  return (
    <Drawer
      open={open}
      variant="persistent"
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, position: 'relative', border: 'none', borderRight: 1, borderColor: 'divider' },
      }}
    >
      {content}
    </Drawer>
  )
}

export default Sidebar
