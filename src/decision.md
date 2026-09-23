# Taleem Hub — Project Decisions & Architecture Reference

This file is the single source of truth for how Taleem Hub is built. Any AI
assistant (or developer) working on this codebase must read this file
**before making changes**, and must not contradict it without an explicit,
separate instruction from the project owner.

---

## 1. What This Project Is

Taleem Hub is a **multi-tenant School Management SaaS** platform for
Pakistani schools, with four role-based portals sharing one codebase and one
database:

| Portal | Primary User | Status |
|---|---|---|
| Super Admin | Platform owner | Core built (dashboard, schools, demo requests, finance backend, packages) |
| School Admin | School owner/principal | Layout shell only — feature modules not built |
| Teacher | Teaching staff | Layout shell only — not built |
| Parent/Student | Parent/student | Layout shell only — not built |

**Stack:** Angular 17+ (standalone components only — no NgModules),
NestJS, PostgreSQL, TypeORM.

**Repos:**
- Frontend: `Taleem-Hub_portal` (branch: `Development` / `enhance-system-flow`)
- Backend: `Taleem-Hub-api` (branch: `develop`)

---

## 2. Non-Negotiables — Do Not Break These

1. **Auth flow is production-hardened. Do not modify it** unless the task
   is explicitly about auth. Current design:
   - Login → OTP → role-based redirect (via `ROLE_REDIRECTS` in
     `roles.constants.ts` on frontend, `ROLE_DASHBOARD_PATHS` in
     `auth.constants.ts` on backend — **keep these two in sync**, they
     caused a real production bug once when they drifted).
   - Access token: short-lived (15 min), returned in the response body,
     stored in `localStorage`, attached via `Authorization: Bearer` header
     by `AuthInterceptor`.
   - Session token: long-lived (24h), set as an **httpOnly** cookie
     (`taleem_token`), never exposed to JS. Used only by
     `POST /auth/refresh-token` to silently mint a new access token.
   - `RefreshInterceptor` (frontend) catches 401s, calls refresh-token,
     queues concurrent requests during the refresh, retries the original
     request. Registered **last** in the interceptor array (innermost) so
     it sees a 401 before `ErrorInterceptor`/`AuthInterceptor` do.
   - `AuthGuard` is async: if the access token looks expired on a page
     load, it tries a silent refresh before redirecting to login (a plain
     client-side expiry check would bypass the whole refresh mechanism on
     reloads).
   - `logout()` calls the backend `/auth/logout` (clears the cookie) —
     never just clear frontend storage alone.
   - When `/auth/refresh-token` fails (cookie missing/invalid/expired),
     the backend actively clears the cookie (`clearAuthCookie()`) rather
     than leaving a dead cookie sitting in the browser.

2. **Multi-tenancy is enforced via the JWT payload's `schoolId`** — not a
   custom header. (A `TenantInterceptor` that sent an `X-Tenant-ID` header
   was removed because it was dead code — nothing on the backend ever read
   it.) Every tenant-scoped backend query must filter by the authenticated
   user's `schoolId` from the JWT, never trust a client-supplied school ID.

3. **RBAC is enforced on both ends, always**:
   - Backend: every protected controller has
     `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`.
     Never ship an endpoint that returns tenant or user data without a
     guard, "for now" or "to test quickly."
   - Frontend: every protected route has `canActivate: [AuthGuard, RoleGuard]`
     in that order. A missing guard is a security bug, not an oversight to
     fix later.

4. **Never guess a backend response shape.** Backend field naming
   convention is **snake_case** (matches DB columns:
   `school_name`, `owner_name`, `created_at`). A camelCase vs snake_case
   mismatch between a backend DTO and a frontend interface causes **silent
   UI failures** (data arrives, `.map()` fails on `undefined` fields, grid
   renders empty, no error thrown) — this has happened before. Always
   verify the actual response shape (run the endpoint or read the service
   method) before writing the frontend interface that consumes it.

5. **NestJS module import paths must exactly match folder names.**
   `demo-request` (singular folder) vs `./modules/demo-requests/...`
   (plural import) caused a real build failure. Double-check folder names
   before writing import paths, don't assume pluralization.

6. **`TransformInterceptor`** (wraps responses as `{ data, meta }`) is
   applied **per-controller** (`@UseInterceptors(TransformInterceptor)` on
   the controller class), never globally in `main.ts`. Auth endpoints
   return flat, unwrapped responses on purpose — a global interceptor would
   break the login/verify-otp flow.

7. **DB connection pool settings are tuned, don't revert them**:
   `idleTimeoutMillis: 300000`, `min: 2`, `keepAlive: true` in
   `app.module.ts`'s TypeORM config. The previous 10-second idle timeout
   caused multi-second latency on every request after a short idle period
   (managed/remote Postgres connection-establishment cost).

---

## 3. Design System — Apply to Every New Screen

- **Layout:** white, full-height sidebar (not dark) with the existing
  Taleem Hub teal graduation-cap logo — do not redesign the logo, use the
  existing asset. Light content area, background `#F6F7FB`.
- **Cards:** white, 14–16px corner radius, no heavy borders, no drop
  shadows. Generous padding.
- **Typography:** Manrope for headings (medium weight), Inter for body
  text.
- **Color system — meaningful, not decorative:**
  | Color | Meaning |
  |---|---|
  | Teal `#0F6E56` (tint `#E1F5EE`) | Schools / core / education items |
  | Blue `#185FA5` (tint `#E6F1FB`) | People (students, teachers, users) |
  | Amber `#854F0B` (tint `#FAEEDA`) | Financial (fees, subscriptions, packages) |
  | Coral `#993C1D` (tint `#FAECE7`) | Alerts, complaints, inactive/rejected status |
- Stat cards: small rounded icon badge in the category's light tint,
  outline icon in the darker shade, large number, muted label.
- Status/package badges: rounded pill, colored per the table above.
- Keep the whole system flat — no gradients, no glassmorphism.
- **Responsive is mandatory, not optional**: sidebar collapses to a
  drawer/hamburger on mobile, stat card grids go 4 → 2 → 1 columns,
  tables convert to stacked cards on mobile (never force horizontal
  scroll).
- Auth pages (login/OTP/register) currently use a **different, older**
  dark-navy/gold design — this is a known inconsistency, intentionally
  deferred. Do not "fix" it as a side effect of unrelated work; it needs
  its own dedicated pass.

---

## 4. Component Reuse — Do Not Fork a Third Pattern

Two grid systems currently exist in the frontend:

1. **`DataGridComponent` + `RowActionsCellRendererComponent`**
   (`shared/components/ag-Grid/` and `shared/components/data-grid/`) —
   the original pattern, still used by School Listing.
2. **`AgGridTableComponent` + `GridIconsComponent`**
   (`shared/components/ag-grid-table/` and `shared/components/grid-icons/`)
   — a faithful port of an established pattern from another project, more
   generic and configurable (every action is an optional callback prop).
   This is the **preferred pattern for all new listing screens** going
   forward (used by Demo Requests already).

**Rule: use #2 (`AgGridTableComponent` + `GridIconsComponent`) for every
new grid.** Do not modify #1 (it's still load-bearing for School Listing)
and do not invent a third grid wrapper. Other reusable shared components
already exist and must be reused, not recreated: `StatCardComponent`,
`StatusBadgeCellRendererComponent` (supports a custom `colorMap`),
`SidenavComponent` (slide-out panel, used for Add School), `ButtonComponent`.

Before building any new UI piece, check `shared/components/` first.

---

## 5. Backend Module Pattern — Follow the Existing Template

Use `super-admin` and `demo-requests` modules as the reference template
for every new module:

- `feature.module.ts` — `TypeOrmModule.forFeature([...entities])`,
  controller, service, exports.
- `feature.controller.ts` — thin, delegates to service. Guards +
  `@Roles()` at the controller-class level when every route needs the same
  role; per-method when it varies (e.g. a public POST + protected GET/PATCH
  in the same controller, like Demo Requests).
- `feature.service.ts` — all business logic, repository injection via
  `@InjectRepository()`.
- `dto/` folder — one DTO per input shape, `class-validator` decorators on
  every field, `@ApiProperty()`/`@ApiPropertyOptional()` for Swagger.
- Entities already exist for every core domain object (Student, Teacher,
  Class, Timetable, Fee, Exam, Result, Attendance ×2, Complaint, Leave,
  Announcement, Subscription, Expense, DemoRequest, AuditLog,
  NotificationLog) in `database/entities/` — **use them, don't redefine
  fields that already exist there.**

---

## 6. Current State — What's Built vs What's Left

### Backend
**Fully implemented:** Auth (register/login/OTP/forgot-reset/logout/refresh),
Super Admin (schools list with owner join, package assignment, finance
summary, expense CRUD), Demo Requests.

**Stubs only (route+service exist, no real logic):** Students, Teachers,
Classes, Timetable, Attendance, Fees, Exams, Results, Complaints, Leaves,
Announcements, Notifications. School block/unblock is also still a stub
(no persisted active/blocked field on the School entity yet).

### Frontend
**Fully implemented:** Auth pages, core guards/interceptors, Super Admin
dashboard, Schools listing (with package badges, block/unblock, view),
Add School, Demo Requests page.

**Not built at all:** School Admin feature pages (Students, Fees,
Attendance, Exams, etc. — only routes/layout exist), Teacher portal
(empty dashboard), Parent/Student portal (empty dashboard), Finance page
UI (backend ready, no frontend page yet), dedicated Package management UI.

---

## 7. Definition of Done for Any New Piece of Work

A module/screen is not "done" until all of the following are true:

- [ ] Backend: DTO validation on every input, guard + role check on every
      protected route, tenant-scoped queries where relevant, no raw SQL
      string concatenation.
- [ ] Frontend: uses the design system in §3, reuses components per §4,
      responsive at mobile/tablet/desktop.
- [ ] Both: `npx tsc --noEmit` clean, and (frontend) a full `ng build`
      clean, and (backend) `npx tsc --noEmit -p tsconfig.json` clean.
- [ ] No `console.log`, no commented-out dead code, no unused
      imports/variables.
- [ ] Nothing already working was modified unless the task required it —
      and if it was, the reason is stated.