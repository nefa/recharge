import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from '@recharge/ui'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    color: { control: 'select', options: ['primary', 'secondary', 'error', 'warning', 'success'] },
  },
  args: {
    name: 'Stefan Camarasu',
    size: 'medium',
    color: 'primary',
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 'small' },
}

export const Large: Story = {
  args: { size: 'large' },
}

export const Secondary: Story = {
  args: { color: 'secondary', name: 'Maria Ionescu' },
}

export const SingleName: Story = {
  args: { name: 'Admin' },
}

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Avatar {...args} size="small" />
      <Avatar {...args} size="medium" />
      <Avatar {...args} size="large" />
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar name="Primary User" color="primary" />
      <Avatar name="Secondary User" color="secondary" />
      <Avatar name="Error User" color="error" />
      <Avatar name="Warning User" color="warning" />
      <Avatar name="Success User" color="success" />
    </div>
  ),
}
