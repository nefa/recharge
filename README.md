# Recharge

Leave & absence management for Romanian SMEs — a [Timetastic](https://timetastic.co.uk)-inspired app built with Next.js, NestJS, and PostgreSQL.

---

## Monorepo structure

```
recharge/
├── apps/
│   ├── web/          Next.js 16 (App Router) — frontend
│   ├── api/          NestJS 11 — REST API
│   └── storybook/    Storybook 10 — design system browser
├── packages/
│   ├── ui/           @recharge/ui — MUI-based component library + theme
│   └── shared/       @recharge/shared — enums & types shared by web and api
├── docker-compose.yml  PostgreSQL 16
└── tsconfig.base.json
```

## Tech stack

| Concern | Choice |
|---|---|
| Frontend | Next.js 16, App Router, TypeScript |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| UI library | Material UI v9 + Emotion |
| Design system | Storybook 10 |
| Auth | JWT (access + refresh) via NestJS Passport |
| Email | Resend |
| Monorepo | npm workspaces |

## Getting started

**Prerequisites:** Node 20+, Docker

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL
docker compose up -d

# 3. Run apps
npm run dev:web        # http://localhost:3000
npm run dev:api        # http://localhost:3001
npm run dev:storybook  # http://localhost:6006
```

## Design system

Components and theme tokens live in `packages/ui`. To change the visual style of the whole app, edit `packages/ui/src/theme/tokens.ts` — colors, typography, and shape are all defined there and flow through MUI's `createTheme`.

```
packages/ui/src/
├── theme/
│   ├── tokens.ts   ← edit here to restyle everything
│   └── index.ts    ← MUI theme built from tokens
└── components/
    └── Button/
```

## Deployment

| App | Target |
|---|---|
| `apps/web` | Vercel |
| `apps/api` + PostgreSQL | Railway / Render / Fly.io |
| `apps/storybook` | Chromatic / Vercel |
