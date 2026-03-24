# FRIMS Setup Guide

**Fire Risk Incident Management System (FRIMS)** — Complete setup and deployment guide.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Project Structure](#2-project-structure)
3. [Backend Setup (functions/)](#3-backend-setup)
4. [Frontend Setup (client/)](#4-frontend-setup)
5. [Firebase Configuration](#5-firebase-configuration)
6. [MongoDB Atlas Setup](#6-mongodb-atlas-setup)
7. [Environment Variables](#7-environment-variables)
8. [Running Locally](#8-running-locally)
9. [Deployment](#9-deployment)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [API Reference](#11-api-reference)
12. [Architecture Overview](#12-architecture-overview)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| npm | 10.x | Package manager |
| Git | Latest | Version control |
| Firebase CLI | Latest | Deploy & emulate |
| MongoDB Atlas account | — | Cloud database |
| Firebase account | — | Hosting, Storage, FCM |

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify versions
node --version   # v20.x.x
npm --version    # 10.x.x
firebase --version
```

---

## 2. Project Structure

```
frims/
├── client/                    # React 18 frontend (Firebase Hosting)
│   ├── public/                # Static assets, PWA manifest
│   └── src/
│       ├── app/               # Redux store
│       ├── features/          # Auth, Applications, Incidents, NOC, Analytics
│       ├── components/        # Shared UI: maps, charts, layout
│       ├── hooks/             # useAuth, useSocket, useGeolocation
│       ├── services/          # API, Firebase, Socket.IO
│       └── utils/             # Formatters, validators, constants
│
├── functions/                 # Node.js + Express backend (Firebase Functions)
│   └── src/
│       ├── config/            # DB, Firebase Admin, constants
│       ├── middleware/        # Auth (JWT), RBAC, rate limiter, validator
│       ├── models/            # Mongoose: User, Application, Inspection, Incident, NOC, AuditLog
│       ├── routes/            # Express routers
│       ├── controllers/       # Business logic
│       └── services/          # PDF gen, notifications, audit, storage
│
├── .github/workflows/         # GitHub Actions CI/CD
├── firebase.json              # Firebase hosting + functions config
├── storage.rules              # Firebase Storage security rules
└── SETUP.md                   # This file
```

---

## 3. Backend Setup

### 3.1 Install Dependencies

```bash
cd functions
npm install
```

### 3.2 Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3.3 Key `.env` Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/frims
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
```

### 3.4 Firebase Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key**
3. Download and save as `functions/serviceAccountKey.json`
4. **Never commit this file** (already in `.gitignore`)

---

## 4. Frontend Setup

### 4.1 Install Dependencies

```bash
cd client
npm install
```

### 4.2 Configure Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase config
```

### 4.3 Firebase Web Config

From Firebase Console → Project Settings → Your Apps → Web App:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1234567890
REACT_APP_FIREBASE_APP_ID=1:1234567890:web:abc123
REACT_APP_FIREBASE_VAPID_KEY=BExample...
```

---

## 5. Firebase Configuration

### 5.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → Enter name (e.g., `frims-prod`)
3. Enable Google Analytics (optional)

### 5.2 Enable Firebase Services

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project root
firebase init

# Select:
# ✅ Hosting
# ✅ Functions
# ✅ Storage
```

### 5.3 Update Project ID

```bash
# Edit .firebaserc
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### 5.4 Firebase Storage Rules

Already configured in `storage.rules` — deploy with:
```bash
firebase deploy --only storage
```

### 5.5 Firebase Cloud Messaging (Push Notifications)

1. Firebase Console → Project Settings → Cloud Messaging
2. Generate VAPID key pair
3. Copy Web Push certificate (VAPID key) to `REACT_APP_FIREBASE_VAPID_KEY`

---

## 6. MongoDB Atlas Setup

### 6.1 Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a **free M0** cluster
3. Choose a cloud provider and region

### 6.2 Create Database User

1. Security → Database Access → Add New Database User
2. Username: `frims_user`, Password: (strong password)
3. Role: **Atlas admin** (or `readWrite` on `frims` database)

### 6.3 Configure Network Access

1. Security → Network Access → Add IP Address
2. For development: Add `0.0.0.0/0` (allow all)
3. For production: Add your Firebase Functions IP ranges

### 6.4 Get Connection String

1. Clusters → Connect → Connect your application
2. Copy the connection string
3. Replace `<password>` with your database user password

```env
MONGODB_URI=mongodb+srv://frims_user:<password>@cluster0.abc123.mongodb.net/frims?retryWrites=true&w=majority
```

---

## 7. Environment Variables

### Backend (`functions/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry (e.g., `7d`) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage bucket |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ✅ | Path to service account JSON |
| `EMAIL_HOST` | ⚠️ | SMTP host for notifications |
| `EMAIL_USER` | ⚠️ | SMTP username |
| `EMAIL_PASS` | ⚠️ | SMTP password/app password |
| `FRONTEND_URL` | ✅ | Frontend URL (for CORS) |

### Frontend (`client/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | ✅ | Backend API base URL |
| `REACT_APP_SOCKET_URL` | ✅ | Socket.IO server URL |
| `REACT_APP_FIREBASE_*` | ✅ | All Firebase web config values |

---

## 8. Running Locally

### 8.1 Start Backend

```bash
cd functions
npm run dev     # Uses nodemon for auto-reload
# Server runs on http://localhost:5000
```

### 8.2 Start Frontend

```bash
cd client
npm start       # React dev server on http://localhost:3000
```

### 8.3 Using Firebase Emulators (Optional)

```bash
# From project root
firebase emulators:start

# Access emulator UI at: http://localhost:4000
```

### 8.4 Seed Initial Admin User

Use an API client (e.g., Postman, Insomnia) or curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@frims.gov",
    "password": "Admin@12345",
    "role": "admin"
  }'
```

---

## 9. Deployment

### 9.1 Build Frontend

```bash
cd client
REACT_APP_API_URL=/api \
REACT_APP_SOCKET_URL=https://your-project.cloudfunctions.net \
npm run build
```

### 9.2 Deploy to Firebase

```bash
# From project root
firebase deploy
# Deploys: Hosting (frontend) + Functions (backend)

# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy storage rules
firebase deploy --only storage
```

### 9.3 Set Firebase Function Config

```bash
firebase functions:config:set \
  mongodb.uri="mongodb+srv://..." \
  jwt.secret="your_jwt_secret" \
  jwt.expires_in="7d" \
  email.host="smtp.gmail.com" \
  email.user="your@email.com" \
  email.pass="your_app_password"
```

---

## 10. CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automates:

1. **On every PR**: Runs backend tests + frontend tests & build
2. **On merge to main**: Also deploys to Firebase

### 10.1 Required GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Description |
|--------|-------------|
| `FIREBASE_TOKEN` | Firebase CI token |

### 10.2 Generate Firebase Token

```bash
firebase login:ci
# Copy the token and add as FIREBASE_TOKEN secret
```

### 10.3 Pipeline Stages

```
PR opened/updated
    │
    ├── Backend Tests (Jest, Node 20)
    │   └── Unit & integration tests
    │
    └── Frontend Tests & Build (React)
        └── Build output validated

Merged to main
    │
    └── Deploy to Firebase
        ├── Frontend → Firebase Hosting (CDN)
        └── Backend → Firebase Cloud Functions
```

---

## 11. API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login and get JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PUT | `/api/auth/profile` | JWT | Update profile |
| PUT | `/api/auth/change-password` | JWT | Change password |
| GET | `/api/auth/users` | Admin | List all users |

### Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/applications` | JWT | List applications |
| POST | `/api/applications` | JWT | Create application |
| GET | `/api/applications/:id` | JWT | Get application details |
| PUT | `/api/applications/:id` | JWT | Update application |
| POST | `/api/applications/:id/submit` | JWT | Submit for review |
| PUT | `/api/applications/:id/review` | Admin | Review/approve/reject |
| GET | `/api/applications/stats` | Admin | Application statistics |

### Inspections

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/inspections` | JWT | List inspections |
| POST | `/api/inspections` | Admin | Schedule inspection |
| GET | `/api/inspections/:id` | JWT | Get inspection details |
| PUT | `/api/inspections/:id` | Admin/Inspector | Update inspection |
| POST | `/api/inspections/:id/checkin` | Inspector | GPS check-in |
| POST | `/api/inspections/:id/checklist` | Inspector | Submit checklist |

### Incidents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/incidents` | JWT | List incidents (with geo filter) |
| POST | `/api/incidents` | JWT | Report incident |
| GET | `/api/incidents/:id` | JWT | Get incident details |
| PUT | `/api/incidents/:id` | Admin | Update incident |
| POST | `/api/incidents/:id/updates` | JWT | Add update to incident |
| GET | `/api/incidents/stats` | JWT | Incident statistics |

### NOC Certificates

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/noc/verify/:token` | None | Public certificate verification |
| GET | `/api/noc` | JWT | List certificates |
| POST | `/api/noc/issue/:applicationId` | Admin | Issue NOC certificate |
| GET | `/api/noc/:id` | JWT | Get certificate details |
| PUT | `/api/noc/:id/revoke` | Admin | Revoke certificate |

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/dashboard` | Admin | Dashboard statistics |
| GET | `/api/analytics/trends/applications` | Admin | Application trends |
| GET | `/api/analytics/heatmap/incidents` | Admin | Incident heatmap data |
| GET | `/api/analytics/metrics/inspections` | Admin | Inspection metrics |
| GET | `/api/analytics/risk-score` | Admin | Risk score by city |

---

## 12. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   React SPA (Firebase Hosting CDN)                              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │ Admin    │ │Applicant │ │Inspector │ │  Public NOC      │  │
│   │ Portal   │ │ Portal   │ │  PWA     │ │  Verification    │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
└────────┼────────────┼────────────┼─────────────────┼────────────┘
         │ Redux + RTK Query        │ Socket.IO        │
         ▼            ▼            ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│   Firebase Cloud Functions (Node.js 20 + Express 4)             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│   │ Auth     │ │ NOC API  │ │Incident  │ │  Analytics API   │  │
│   │ JWT+RBAC │ │ Routes   │ │  API     │ │  Routes          │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
└────────┼────────────┼────────────┼─────────────────┼────────────┘
         │            │            │                 │
         ▼            ▼            ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA & SERVICES LAYER                       │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐ │
│  │  MongoDB Atlas │  │ Firebase      │  │  Firebase Cloud      │ │
│  │  (Documents,  │  │ Storage       │  │  Messaging (FCM)     │ │
│  │   Audit Logs) │  │ (Photos, PDFs)│  │  + Nodemailer SMTP   │ │
│  └───────────────┘  └───────────────┘  └──────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REAL-TIME LAYER                               │
│   Socket.IO 4 (WebSocket + polling fallback)                    │
│   Events: incident:new, incident:updated, incident:update       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| MongoDB Atlas | Flexible schema for fire dept data; geospatial queries |
| JWT over sessions | Stateless; works with Firebase Functions |
| Redux Toolkit + RTK Query | Eliminates boilerplate; built-in caching |
| Socket.IO | Reliable real-time with polling fallback |
| Firebase Hosting | CDN delivery; auto SSL; seamless Functions integration |
| PDFKit for NOC | Server-side PDF generation with QR code embedding |

---

## Troubleshooting

### MongoDB Connection Issues
- Check if IP is whitelisted in Atlas Network Access
- Verify MONGODB_URI has correct username/password
- Ensure `retryWrites=true&w=majority` in connection string

### Firebase Functions Deployment Fails
- Ensure Node.js 20 is specified in `functions/package.json`
- Check `firebase functions:log` for runtime errors
- Verify `serviceAccountKey.json` is not being deployed (check `.gitignore`)

### CORS Errors in Development
- Ensure `FRONTEND_URL=http://localhost:3000` in `functions/.env`
- Check `proxy` in `client/package.json` is set to `http://localhost:5000`

### Map Not Loading
- Leaflet CSS must be imported in `index.html` or component
- Check if OpenStreetMap tiles are accessible from your network

### Push Notifications Not Working
- Ensure HTTPS is being used (required for service workers)
- Check VAPID key is correctly set in environment variables
- Verify browser notification permission is granted
