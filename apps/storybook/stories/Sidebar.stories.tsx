import type { Meta, StoryObj } from '@storybook/react'
import {
  Dashboard,
  Group,
  CalendarMonth,
  Settings,
  BeachAccess,
} from '@mui/icons-material'
import { Sidebar } from '@recharge/ui'

const defaultItems = [
  { label: 'Dashboard', icon: <Dashboard />, active: true },
  { label: 'Team', icon: <Group /> },
  { label: 'Calendar', icon: <CalendarMonth /> },
  { label: 'Leave Types', icon: <BeachAccess /> },
  { label: 'Settings', icon: <Settings /> },
]

const meta: Meta<typeof Sidebar> = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: 400 }}>
        <Story />
        <div style={{ flex: 1, padding: 24, background: '#fafafa' }}>
          Page content
        </div>
      </div>
    ),
  ],
  args: {
    items: defaultItems,
    open: true,
  },
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Open: Story = {}

export const Closed: Story = {
  args: { open: false },
}

export const WithoutIcons: Story = {
  args: {
    items: defaultItems.map(({ label, active }) => ({ label, active })),
  },
}

export const CustomWidth: Story = {
  args: { width: 280 },
}
