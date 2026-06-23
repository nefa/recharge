import type { Meta, StoryObj } from '@storybook/react'
import { StatusBadge } from '@recharge/ui'

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  parameters: { layout: 'centered' },
  argTypes: {
    status: { control: 'select', options: ['approved', 'pending', 'rejected', 'cancelled'] },
    size: { control: 'select', options: ['small', 'medium'] },
  },
  args: {
    status: 'approved',
    size: 'small',
  },
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const Approved: Story = {
  args: { status: 'approved' },
}

export const Pending: Story = {
  args: { status: 'pending' },
}

export const Rejected: Story = {
  args: { status: 'rejected' },
}

export const Cancelled: Story = {
  args: { status: 'cancelled' },
}

export const MediumSize: Story = {
  args: { status: 'approved', size: 'medium' },
}

export const CustomLabel: Story = {
  args: { status: 'pending', label: 'Awaiting Manager' },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <StatusBadge status="approved" />
      <StatusBadge status="pending" />
      <StatusBadge status="rejected" />
      <StatusBadge status="cancelled" />
    </div>
  ),
}
