# Authentication Strategy — Recharge

## Context

Recharge (`recharge.ro`) is a leave-management SaaS targeting Romanian SMEs. Most users are company admins and their employees — typically using personal or basic company email, rarely with Google Workspace or SSO infrastructure.

---

## Chosen Approach: Email/Password + Company Invite Flow

### User Roles

| Role            | Description                                      |
| --------------- | ------------------------------------------------ |
| **Company Admin** | Creates the company workspace, manages employees |
| **Employee**      | Invited by admin, manages own leave requests     |

### Auth Flows

#### 1. Company Admin Registration

1. Admin visits `/register`
2. Fills in: company name, admin name, email, password
3. API creates `Company` + `User` (role: `ADMIN`) in a transaction
4. Returns JWT access + refresh token pair
5. Admin lands on the company dashboard

#### 2. Employee Invitation

1. Admin navigates to team settings, enters employee email(s)
2. API creates an `Invite` record per email:
   - `token` (crypto-random, URL-safe)
   - `companyId`
   - `email`
   - `expiresAt` (72 hours)
3. System sends invite email with link: `/invite/{token}`

#### 3. Employee Registration (via Invite)

1. Employee clicks invite link
2. Frontend validates token against API (`GET /invites/:token`)
3. If valid: employee sets name + password
4. API creates `User` (role: `EMPLOYEE`, `companyId` from invite), marks invite as used
5. Returns JWT pair, employee lands on dashboard

#### 4. Login

1. User visits `/login`, enters email + password
2. API validates credentials, returns JWT access + refresh token pair
3. Frontend stores tokens, redirects to dashboard

#### 5. Token Refresh

1. Frontend detects expired access token (401 response)
2. Sends refresh token to `POST /auth/refresh`
3. API validates refresh token, returns new access + refresh pair
4. If refresh token is expired/invalid, redirect to `/login`

---

## Technical Decisions

### Password Handling

- Hash with **bcrypt** (cost factor 12)
- Enforce minimum 8 characters on API side
- Never return password hashes in any response

### JWT Strategy

| Token          | Lifetime | Storage              |
| -------------- | -------- | -------------------- |
| Access token   | 15 min   | Memory (JS variable) |
| Refresh token  | 7 days   | HttpOnly cookie      |

- Signed with RS256 or HS256 (env-configured secret)
- Payload: `{ sub: userId, companyId, role, iat, exp }`
- Refresh tokens stored in DB for revocation support

### Invite Tokens

- 32-byte crypto-random, base64url-encoded
- Stored in `invites` table with `companyId`, `email`, `expiresAt`, `usedAt`
- Single-use: marked as used on registration
- Expired invites cleaned up via cron or on-read

---

## Database Schema (new tables)

```
users
  id            UUID PK
  email         VARCHAR UNIQUE
  passwordHash  VARCHAR
  name          VARCHAR
  role          ENUM('ADMIN', 'EMPLOYEE')
  companyId     UUID FK -> companies.id
  createdAt     TIMESTAMP
  updatedAt     TIMESTAMP

companies
  id            UUID PK
  name          VARCHAR
  createdAt     TIMESTAMP
  updatedAt     TIMESTAMP

invites
  id            UUID PK
  token         VARCHAR UNIQUE
  email         VARCHAR
  companyId     UUID FK -> companies.id
  expiresAt     TIMESTAMP
  usedAt        TIMESTAMP NULL
  createdAt     TIMESTAMP

refresh_tokens
  id            UUID PK
  token         VARCHAR UNIQUE
  userId        UUID FK -> users.id
  expiresAt     TIMESTAMP
  createdAt     TIMESTAMP
```

---

## API Endpoints

| Method | Path                  | Auth     | Description                        |
| ------ | --------------------- | -------- | ---------------------------------- |
| POST   | `/auth/register`      | Public   | Admin registration + company setup |
| POST   | `/auth/login`         | Public   | Email/password login               |
| POST   | `/auth/refresh`       | Cookie   | Refresh access token               |
| POST   | `/auth/logout`        | Bearer   | Revoke refresh token               |
| GET    | `/invites/:token`     | Public   | Validate invite token              |
| POST   | `/invites/:token/accept` | Public | Employee registration via invite   |
| POST   | `/invites`            | Bearer (ADMIN) | Create employee invite(s)    |

---

## NestJS Implementation Outline

### Dependencies

```
@nestjs/passport
@nestjs/jwt
passport
passport-local
passport-jwt
bcrypt
```

### Modules

```
AuthModule
  - AuthController     (register, login, refresh, logout)
  - AuthService        (credential validation, token issuance)
  - JwtStrategy        (passport-jwt, validates access tokens)
  - LocalStrategy      (passport-local, validates email/password)
  - JwtAuthGuard       (protects routes)
  - RolesGuard         (checks user role for admin-only routes)

UsersModule
  - UsersService       (CRUD, findByEmail)
  - User entity

CompaniesModule
  - CompaniesService   (create, findById)
  - Company entity

InvitesModule
  - InvitesController  (create, validate, accept)
  - InvitesService     (token generation, validation, acceptance)
  - Invite entity
```

---

## Next.js Frontend Outline

### Pages

| Route                | Description                     |
| -------------------- | ------------------------------- |
| `/login`             | Email/password form             |
| `/register`          | Admin registration form         |
| `/invite/[token]`    | Employee invite acceptance form |

### Auth State Management

- Store access token in memory (React context/state)
- Refresh token in HttpOnly cookie (set by API)
- Axios/fetch interceptor: on 401, call `/auth/refresh`, retry original request
- Auth context provides `user`, `login()`, `logout()`, `isAuthenticated`

---

## Future Enhancements (Post-MVP)

- **Google OAuth** — add as optional login method via `passport-google-oauth20`
- **Password reset** — forgot password flow with email token
- **Email verification** — confirm admin email on registration
- **Rate limiting** — throttle login attempts per IP/email
- **2FA** — TOTP-based two-factor for admin accounts
