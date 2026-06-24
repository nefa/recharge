# recharge-api

REST API for **Super Vacanta** — leave & absence management for Romanian SMEs. Built with NestJS 11, TypeORM, and PostgreSQL 16.

Frontend repo: [recharge-web](https://github.com/nefa/recharge-web)

## Tech stack

| Concern | Choice |
|---|---|
| Framework | NestJS 11, TypeScript |
| Database | PostgreSQL 16 + TypeORM |
| Auth | JWT (access + refresh) via Passport |
| Email | Resend |
| Package manager | Bun |

## Prerequisites

- [Bun](https://bun.sh) >= 1.1
- Node 20+
- Docker

## Setup

```bash
# Install dependencies
bun install

# Start PostgreSQL + pgAdmin
docker compose up -d

# Copy env (defaults work with docker-compose)
cp .env.example .env

# Seed demo data
bun run seed
```

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://recharge:recharge@localhost:5432/recharge` | Postgres connection string |
| `JWT_SECRET` | — | Access token signing secret |
| `JWT_REFRESH_SECRET` | — | Refresh token signing secret |
| `WEB_URL` | `http://localhost:3000` | Frontend URL (for CORS / emails) |
| `API_URL` | `http://localhost:3001` | API base URL |
| `RESEND_API_KEY` | — | Resend API key (optional, logs to console if unset) |

## Development

```bash
# Start the API (port 3001, watch mode)
bun run dev
```

### Services (docker-compose)

| Service | Port | Credentials |
|---|---|---|
| PostgreSQL | 5432 | `recharge` / `recharge` |
| pgAdmin | 5050 | `admin@recharge.ro` / `recharge` |

## Project structure

```
recharge-api/
├── src/
│   ├── auth/            JWT + Passport strategies
│   ├── users/
│   ├── departments/
│   ├── leave-types/
│   ├── leave-requests/
│   ├── leave-balances/
│   ├── holidays/        Romanian public holidays
│   ├── calendar/        Wallchart endpoint
│   ├── dashboard/       Aggregated dashboard data
│   ├── invites/         Team invitation flow
│   ├── notifications/   Email via Resend
│   ├── entities/        TypeORM entities
│   ├── migrations/
│   ├── database/        Seed script
│   ├── shared/          Enums & DTOs (shared with recharge-web)
│   └── main.ts
├── docker-compose.yml   PostgreSQL 16 + pgAdmin
├── nest-cli.json
├── typeorm.config.ts
└── package.json
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register company + admin |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/users/me` | Current user profile |
| `GET` | `/api/users` | List company users |
| `GET/POST/PATCH/DELETE` | `/api/departments/*` | Department CRUD |
| `GET/POST/PATCH/DELETE` | `/api/leave-types/*` | Leave type CRUD |
| `GET/PATCH` | `/api/leave-balances/*` | Leave balances |
| `GET/POST/PATCH` | `/api/leave-requests/*` | Leave requests + approve/decline/cancel |
| `GET` | `/api/holidays` | Romanian public holidays |
| `GET` | `/api/dashboard/me` | Personal dashboard |
| `GET` | `/api/dashboard/team` | Team dashboard |
| `GET` | `/api/calendar/wallchart` | Team wallchart |
| `POST/GET` | `/api/invites/*` | Team invitations |

## Demo credentials

```
Email:    admin@techro.ro
Password: password123
```
