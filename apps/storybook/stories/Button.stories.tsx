import type { Meta, StoryObj } from '@storybook/react'
import { Send, Add, Check } from '@mui/icons-material'
import { Button } from '@recharge/ui'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'success', 'inherit'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { color: 'secondary' },
}

export const Outlined: Story = {
  args: { variant: 'outlined' },
}

export const OutlinedSecondary: Story = {
  args: { variant: 'outlined', color: 'secondary' },
}

export const Text: Story = {
  args: { variant: 'text' },
}

export const Small: Story = {
  args: { size: 'small' },
}

export const Large: Story = {
  args: { size: 'large' },
}

export const Loading: Story = {
  args: { loading: true, children: 'Saving…' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const WithStartIcon: Story = {
  args: { startIcon: <Add /> },
}

export const WithEndIcon: Story = {
  args: { endIcon: <Send /> },
}

export const Destructive: Story = {
  args: { color: 'error', children: 'Delete request', startIcon: <Check /> },
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: 'padded' },
}

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button {...args} variant="contained">Contained</Button>
      <Button {...args} variant="outlined">Outlined</Button>
      <Button {...args} variant="text">Text</Button>
    </div>
  ),
}

export const AllColors: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button {...args} color="primary">Primary</Button>
      <Button {...args} color="secondary">Secondary</Button>
      <Button {...args} color="error">Error</Button>
      <Button {...args} color="warning">Warning</Button>
      <Button {...args} color="success">Success</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="small">Small</Button>
      <Button {...args} size="medium">Medium</Button>
      <Button {...args} size="large">Large</Button>
    </div>
  ),
}
