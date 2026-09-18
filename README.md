# 🎓 TaleemHub

> Multi-tenant School & Academy Management SaaS for Pakistan

TaleemHub is a cloud-based multi-tenant SaaS platform built for private schools, coaching centers, and academies in Pakistan. It provides 4 separate portals covering the full school management lifecycle.

---

## 🏫 Portals

| Portal | Who Uses It | URL |
|--------|-------------|-----|
| Super Admin | TaleemHub Owner | `taleemhub.pk/super-admin` |
| School Admin | Principal / School Owner | `schoolname.taleemhub.pk/admin` |
| Teacher | Teachers | `schoolname.taleemhub.pk/teacher` |
| Parent / Student | Parents | `schoolname.taleemhub.pk/parent` |

---

## ✨ Key Features

- 🏢 **Multi-tenant Architecture** — One platform, hundreds of schools
- 📲 **Real-time Notifications** — WhatsApp, Email & SMS across all events
- 📊 **AG Grid + SSR** — Handles large data efficiently across all portals
- 💳 **Local Payments** — JazzCash & EasyPaisa support
- 📍 **GPS Attendance** — Teacher attendance with location tracking
- 📄 **PDF Generation** — Result cards, fee receipts, reports
- 🎓 **Full Exam Lifecycle** — Datesheet → Marks → Result → Parent delivery

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 22 & Tailwind CSS |
| Backend | NestJS (Node.js) |
| Database | PostgreSQL |
| Data Grid | AG Grid (Server Side Rendering) |
| Authentication | JWT + Role-based Guards |
| File Storage | AWS S3 / Cloudflare R2 |
| Maps | Google Maps API |

---
## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Angular CLI v17+
- NestJS CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/Moazali302/TaleemHub.git
cd TaleemHub

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

```bash
# Backend — copy and fill in your values
cp backend/.env.example backend/.env

# Frontend — update environment files
# frontend/src/environments/environment.ts
```

### Run Development Servers

```bash
# Frontend (Angular)
cd frontend
ng serve

# Backend (NestJS)
cd backend
npm run start:dev
```

---

## 📦 Modules

- ✅ Auth & Multi-tenant Setup
- ✅ School Settings & Onboarding Wizard
- ✅ Student Management
- ✅ Teacher Management
- ✅ Class & Timetable Management
- ✅ Attendance (Student + Teacher with GPS)
- ✅ Fee Management & Auto Reminders
- ✅ Exam, Marks & Results
- ✅ Complaint System
- ✅ Leave Request System
- ✅ Announcements
- ✅ Super Admin Panel


---

## 📄 License

Private & Proprietary — TaleemHub © 2026

---

<p align="center">Built with ❤️ for Pakistan's Education System</p>