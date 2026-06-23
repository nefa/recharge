# App Shell

## Overview
The authenticated app layout wrapping all dashboard routes. Provides persistent navigation via AppBar (top) and Sidebar (left). Role-aware — shows different nav items based on user role.

## Layout Structure
```
┌─────────────────────────────────────────────┐
│ AppBar [Company Name]      [Avatar ▼]       │
│                            └─ Logout        │
├────────────┬────────────────────────────────┤
│ Sidebar    │ Main Content                   │
│            │                                │
│ Dashboard  │   (page content rendered here) │
│ Calendar   │                                │
│ My Requests│                                │
│ Team *     │                                │
│ Settings * │                                │
│            │                                │
│ * = role   │                                │
│   gated    │                                │
└────────────┴────────────────────────────────┘
```

## Navigation Items by Role
| Item | Admin | Manager | Employee |
|------|-------|---------|----------|
| Dashboard | Yes | Yes | Yes |
| Calendar | Yes | Yes | Yes |
| My Requests | Yes | Yes | Yes |
| Team | Yes | Yes | No |
| Settings | Yes | No | No |

## Auth Guard (client-side)
```
AppLayout mounts
  → useAuth() checks user state
  → If loading: show spinner
  → If no user: redirect to /login
  → If user: render AppBar + Sidebar + children
```

## UI Components Reused (from @recharge/ui)
- **AppBar** — company name, user avatar, dropdown menu (Logout)
- **Sidebar** — responsive drawer, items with icons, active state from pathname
- **Avatar** — user initials in the AppBar menu

## Frontend Files
- `apps/web/app/(app)/layout.tsx` — app shell with auth guard
- `apps/web/app/(app)/dashboard/page.tsx` — placeholder with StatCards
- `apps/web/app/providers.tsx` — ThemeProvider + AuthProvider

## Route Groups
```
apps/web/app/
├── (auth)/          — centered layout, no shell (login, register)
│   ├── layout.tsx
│   ├── login/
│   └── register/
├── (app)/           — app shell layout (AppBar + Sidebar)
│   ├── layout.tsx
│   └── dashboard/
└── page.tsx         — redirects to /dashboard
```
