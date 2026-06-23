import type { Meta, StoryObj } from '@storybook/react'
import { Spa } from '@mui/icons-material'
import { AppBar, Avatar } from '@recharge/ui'

const meta: Meta<typeof AppBar> = {
  title: 'UI/AppBar',
  component: AppBar,
  parameters: { layout: 'fullscreen' },
  args: {
    companyName: 'Acme SRL',
  },
}

export default meta
type Story = StoryObj<typeof AppBar>

export const Default: Story = {}

export const WithLogo: Story = {
  args: {
    logo: <Spa sx={{ color: 'primary.main', fontSize: 28 }} />,
  },
}

export const WithUserMenu: Story = {
  args: {
    logo: <Spa sx={{ color: 'primary.main', fontSize: 28 }} />,
    userMenu: <Avatar name="Stefan Camarasu" size="small" />,
    menuItems: [
      { label: 'Profile', onClick: () => console.log('Profile') },
      { label: 'Settings', onClick: () => console.log('Settings') },
      { label: 'Logout', onClick: () => console.log('Logout') },
    ],
  },
}

export const WithHamburger: Story = {
  args: {
    logo: <Spa sx={{ color: 'primary.main', fontSize: 28 }} />,
    userMenu: <Avatar name="Maria Ionescu" size="small" color="secondary" />,
    onMenuClick: () => console.log('Toggle sidebar'),
    menuItems: [
      { label: 'Profile', onClick: () => console.log('Profile') },
      { label: 'Logout', onClick: () => console.log('Logout') },
    ],
  },
}
