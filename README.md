# 🔥 FRIMS — Fire Risk Incident Management System

A production-ready full-stack web platform for fire departments to manage NOC applications, track incidents in real-time, and issue QR-verified certificates.

## Key Features

- **Real-Time Incident Map** — Live fire incident tracking with severity levels on an interactive Leaflet map
- **Digital NOC Pipeline** — Application → Review → Inspection → Approval → PDF Certificate with QR verification
- **Inspector Mobile Module** — PWA-ready with GPS check-in, photo upload, and offline support
- **Admin Operations Center** — Unified dashboard with analytics, heatmaps, and team management
- **Analytics Engine** — Throughput metrics, inspection pass rates, risk scoring
- **QR-Verified Certificates** — Tamper-evident PDFs with public `/verify-noc/:token` endpoint

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Redux Toolkit + RTK Query + Leaflet.js |
| Backend | Node.js 20 + Express.js 4 + Socket.IO 4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + RBAC (admin / applicant / inspector) |
| Storage | Firebase Storage (photos, PDFs) |
| Hosting | Firebase Hosting (CDN) |
| Functions | Firebase Cloud Functions |
| Notifications | Firebase FCM + Nodemailer |
| CI/CD | GitHub Actions |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/bnaveen07/firms.git
cd firms

# 2. Setup backend
cd functions
cp .env.example .env    # Edit with your values
npm install
npm run dev

# 3. Setup frontend (new terminal)
cd client
cp .env.local.example .env.local    # Edit with your Firebase config
npm install
npm start
```

See **[SETUP.md](./SETUP.md)** for the complete setup guide.

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full access: review applications, assign inspectors, issue NOC, view analytics |
| **Applicant** | Submit & track their own applications, download certificates |
| **Inspector** | View assigned inspections, GPS check-in, submit checklists & photos |

## License

MIT
