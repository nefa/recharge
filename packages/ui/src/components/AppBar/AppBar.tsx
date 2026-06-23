'use client'

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { type ReactNode, useState, type MouseEvent } from 'react'

export interface AppBarProps {
  companyName: string
  logo?: ReactNode
  userMenu?: ReactNode
  onMenuClick?: () => void
  menuItems?: { label: string; onClick: () => void }[]
}

export function AppBar({
  companyName,
  logo,
  userMenu,
  onMenuClick,
  menuItems = [],
}: AppBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  return (
    <MuiAppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        {onMenuClick && (
          <IconButton edge="start" sx={{ mr: 1 }} onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        )}
        {logo && <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>{logo}</Box>}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          {companyName}
        </Typography>
        {userMenu && (
          <Box>
            <Box onClick={handleMenuOpen} sx={{ cursor: 'pointer' }}>
              {userMenu}
            </Box>
            {menuItems.length > 0 && (
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.label}
                    onClick={() => {
                      item.onClick()
                      handleMenuClose()
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </Box>
        )}
      </Toolbar>
    </MuiAppBar>
  )
}

export default AppBar
