# Taleem Hub

### A role-based school management portal built for the education community

Taleem Hub is an Angular web application for managing school operations through purpose-built portals. The current frontend brings authentication, school administration, and platform-level management together in a responsive, modular interface, backed by configurable API endpoints.

> **Project status:** Active development. School-admin and super-admin workflows are under development; teacher and parent dashboards are currently placeholders.

---

## At a glance

| | |
|---|---|
| **Application** | Role-based school management frontend |
| **Framework** | Angular 21 |
| **Language** | TypeScript |
| **UI** | Angular Material, Tailwind CSS, AG Grid |
| **API** | REST API, configured through Angular environments |

## Portal experience

- **Authentication** — Login, registration, OTP verification, and password recovery flows.
- **School administration** — Dashboard, teacher directory, and teacher creation.
- **Platform administration** — School directory and details, school creation, subscriptions, announcements, complaints, demo requests, analytics, and dashboard.
- **Teacher and parent areas** — Role-protected dashboard routes are present; their dashboards are not yet implemented.

Authenticated routes use role-aware guards. The application also centralizes API concerns such as authentication, token refresh, loading indicators, and error handling through HTTP interceptors.

## Built with

- **Angular 21** — Standalone components, feature-based routing, and lazy-loaded route groups.
- **TypeScript** — Typed application models and services.
- **Angular Material** and **Tailwind CSS** — UI components and utility-first styling.
- **AG Grid** — Data-grid capabilities.
- **RxJS** — Asynchronous data and API workflows.
- **ngx-toastr** — Application notifications.

## Getting started

### Prerequisites

- Node.js compatible with Angular 21 (Node.js 20.19 or later is recommended)
- npm 10 or later
- Access to a Taleem Hub API for workflows that load server data

### Install and run

```bash
git clone https://github.com/Moazali302/Taleem-Hub_portal.git
cd Taleem-Hub_portal
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### API configuration

The development API base URL is configured in `src/environments/environment.ts` and defaults to `http://localhost:3000/v1`. The production environment uses the deployed API URL in `src/environments/environment.prod.ts`.

Update the appropriate environment file when connecting to another API. Do not commit credentials, private tokens, or other secrets to environment files.

## Available scripts

| Command | Description |
|---|---|
| `npm start` | Start the Angular development server |
| `npm run build` | Create a production build |
| `npm test` | Run the configured unit tests |
| `npm run watch` | Rebuild on changes using the development configuration |

## Project structure

```text
src/
├── app/
│   ├── core/          # Authentication, guards, interceptors, models, and services
│   ├── features/      # Auth, admin, super-admin, teacher, and parent features
│   └── shared/        # Reusable layouts and UI components
├── environments/      # Development and production API configuration
├── main.ts            # Application bootstrap
└── styles.css         # Global styles
```

## Development notes

- Feature routes are organized by portal and loaded through Angular routing.
- Access to admin, teacher, parent, and super-admin route groups is protected by authentication and role guards.
- The frontend expects a compatible API for server-backed data. This repository contains the Angular client; it does not include the backend service.
- Production builds use environment replacement and configured bundle/style budgets.

## License

No license is currently included in this repository. Please contact the project owner for usage and distribution permissions.

---

<p align="center"><strong>Taleem Hub</strong> · Building better tools for school communities</p>
