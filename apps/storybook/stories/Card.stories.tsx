import type { Meta, StoryObj } from '@storybook/react'
import { BeachAccess, HourglassTop, EventAvailable, Cancel } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { Card, StatCard } from '@recharge/ui'

const cardMeta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  args: {
    title: 'Upcoming Leave',
    children: <Typography variant="body2">You have 3 days of annual leave coming up next week.</Typography>,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
}

export default cardMeta
type CardStory = StoryObj<typeof Card>

export const Default: CardStory = {}

export const WithoutTitle: CardStory = {
  args: {
    title: undefined,
    children: <Typography variant="body2">A card without a title header.</Typography>,
  },
}

const statCardMeta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}

export const LeaveBalance: StoryObj<typeof StatCard> = {
  render: () => <StatCard label="Leave Balance" value="18 days" icon={<BeachAccess />} color="primary" />,
}

export const PendingRequests: StoryObj<typeof StatCard> = {
  render: () => <StatCard label="Pending Requests" value={3} icon={<HourglassTop />} color="warning" />,
}

export const ApprovedThisMonth: StoryObj<typeof StatCard> = {
  render: () => <StatCard label="Approved This Month" value={7} icon={<EventAvailable />} color="success" />,
}

export const AllStatCards: StoryObj<typeof StatCard> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: 580 }}>
      <StatCard label="Leave Balance" value="18 days" icon={<BeachAccess />} color="primary" />
      <StatCard label="Pending" value={3} icon={<HourglassTop />} color="warning" />
      <StatCard label="Approved" value={7} icon={<EventAvailable />} color="success" />
      <StatCard label="Rejected" value={1} icon={<Cancel />} color="error" />
    </div>
  ),
}
