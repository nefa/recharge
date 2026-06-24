# Notifications

## Overview
Transactional email notifications via Resend for leave request lifecycle events and employee invites. Gracefully degrades to console logging if `RESEND_API_KEY` is not configured.

## Notification Types
| Event | Recipient | Trigger |
|-------|-----------|---------|
| Request submitted | Department manager | Employee creates a leave request requiring approval |
| Request approved | Employee | Manager/admin approves a request |
| Request declined | Employee | Manager/admin declines a request |
| Invite sent | Invited email | Admin creates an employee invite |

## Configuration
- `RESEND_API_KEY` — Resend API key (optional — logs to console if not set)
- `EMAIL_FROM` — sender address (default: `Recharge <noreply@recharge.ro>`)
- `WEB_URL` — base URL for invite links (default: `http://localhost:3000`)

## Backend Files
- `apps/api/src/notifications/notifications.module.ts`
- `apps/api/src/notifications/notifications.service.ts`

## Integration Points
- `leave-requests.service.ts` — calls on create (to manager), approve, decline (to employee)
- `invites.service.ts` — calls on invite creation (to invited email)
