# FRIMS Production Setup Guide

**Fire Risk Incident Management System (FRIMS)** — Step-by-step production deployment guide.

> **Scope:** This document covers **production deployment only**.  
> Every credential, URL, and setting is explained with the exact location in each service's console where you can find or generate it.

---

## Table of Contents
1. [Prerequisites & Accounts](#1-prerequisites--accounts)
2. [Project Structure](#2-project-structure)
3. [Firebase Project Setup](#3-firebase-project-setup)
4. [MongoDB Atlas Production Setup](#4-mongodb-atlas-production-setup)
5. [Gmail SMTP App Password](#5-gmail-smtp-app-password)
6. [Backend Environment Variables](#6-backend-environment-variables)
7. [Frontend Environment Variables](#7-frontend-environment-variables)
8. [Production Build](#8-production-build)
9. [Deploy to Firebase](#9-deploy-to-firebase)
10. [Create the First Admin Account](#10-create-the-first-admin-account)
11. [GitHub Actions CI/CD Secrets](#11-github-actions-cicd-secrets)
12. [Post-Deployment Verification](#12-post-deployment-verification)
13. [API Reference](#13-api-reference)
14. [Production Security Checklist](#14-production-security-checklist)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Prerequisites & Accounts

### 1.1 Software to Install Locally

| Tool | Minimum Version | Install Command / Link |
|------|-----------------|------------------------|
| Node.js | 20.x LTS | https://nodejs.org/en/download — choose "LTS" |
| npm | 10.x (bundled with Node 20) | Included with Node.js |
| Git | Latest | https://git-scm.com/downloads |
| Firebase CLI | Latest | `npm install -g firebase-tools` |

```bash
# Verify all tools are installed correctly
node --version      # Must print v20.x.x
npm --version       # Must print 10.x.x
git --version
firebase --version
```

### 1.2 External Service Accounts to Create

You need accounts on **three** external services before you begin:

| Service | URL | What It Provides |
|---------|-----|-----------------|
| Firebase (Google) | https://console.firebase.google.com | Hosting (frontend CDN), Cloud Functions (backend API runtime), Firebase Storage (PDF & photo storage), Firebase Cloud Messaging (push notifications) |
| MongoDB Atlas | https://cloud.mongodb.com | Managed MongoDB cloud database |
| Google Account (Gmail) | https://accounts.google.com | SMTP relay for transactional emails |

> **All three services have free tiers** sufficient to get started. For production traffic see the
> "Scaling" notes in each section.

---

## 2. Project Structure

```
firms/
├── client/                          # React 18 SPA — deployed to Firebase Hosting
│   ├── public/
│   │   ├── index.html               # HTML shell; Leaflet CSS linked here
│   │   ├── manifest.json            # PWA manifest (name, icons, theme colour)
│   │   └── firebase-messaging-sw.js # FCM background service worker
│   └── src/
│       ├── app/
│       │   └── store.js             # Redux store (all slice reducers + RTK Query APIs)
│       ├── features/
│       │   ├── auth/                # Login, Register pages + authSlice (JWT in localStorage)
│       │   ├── dashboard/           # Dashboard with stat cards + live incident map
│       │   ├── applications/        # NOC application list / form / detail + RTK Query API
│       │   ├── inspections/         # Inspection list + RTK Query API
│       │   ├── incidents/           # Incident table / detail + RTK Query API
│       │   ├── noc/                 # NOC viewer, public QR verification page + API
│       │   └── analytics/           # Charts, heatmap, report builder
│       ├── components/
│       │   ├── common/
│       │   │   ├── ErrorBoundary.jsx # Catches React render errors; shows fallback UI
│       │   │   └── StatusBadge/      # Coloured pill for application/incident status
│       │   ├── layout/
│       │   │   ├── Sidebar/          # Navigation sidebar (role-aware links)
│       │   │   ├── Header/           # Top bar with user menu + logout
│       │   │   └── PageWrapper/      # Wraps every protected page inside Sidebar + Header
│       │   └── maps/
│       │       └── IncidentMap/      # Leaflet map; reads live Socket.IO incident events
│       ├── hooks/
│       │   ├── useAuth.js           # Reads Redux auth state; exposes isAuthenticated, isAdmin, user, token
│       │   ├── useSocket.js         # Manages Socket.IO connection lifecycle; memoised on/off/emit
│       │   └── useGeolocation.js    # Browser Geolocation API wrapper; used by inspector check-in
│       ├── services/
│       │   ├── api.js               # Axios instance pre-configured with baseURL and JWT header injection
│       │   ├── firebase.js          # Firebase JS SDK initialisation (Storage, Messaging)
│       │   └── socket.js            # Socket.IO client singleton factory
│       └── utils/
│           ├── constants.js         # API base URL, role names, status colours
│           ├── formatters.js        # Date, currency, number formatters
│           └── validators.js        # Email, password, phone, ObjectId validators
│
├── functions/                       # Node.js 20 + Express — deployed as Firebase Cloud Function "api"
│   ├── index.js                     # Entry point: creates HTTP server, attaches Socket.IO, starts DB
│   └── src/
│       ├── app.js                   # createApp(io) factory — configures all Express middleware + routes
│       ├── config/
│       │   ├── db.js                # Mongoose connection to MongoDB Atlas
│       │   ├── firebase-admin.js    # Firebase Admin SDK init (Storage bucket access)
│       │   └── constants.js        # ROLES, APPLICATION_STATUS, INCIDENT_SEVERITY, etc.
│       ├── middleware/
│       │   ├── auth.js              # authenticate (JWT required) + optionalAuth (JWT optional)
│       │   ├── rbac.js              # authorize(...roles) + authorizeOwnerOrAdmin()
│       │   ├── rateLimiter.js       # defaultLimiter (100 req/15 min), authLimiter (20 req/15 min), uploadLimiter
│       │   ├── validateObjectId.js  # Validates :id params are valid MongoDB ObjectIds
│       │   ├── errorHandler.js      # Central error handler + 404 handler
│       │   └── validator.js         # Runs express-validator results; returns 400 on failure
│       ├── models/
│       │   ├── User.js              # bcrypt password hashing pre-save; select: false on password field
│       │   ├── Application.js       # NOC application; auto-generates NOC-YYYY-NNNNNN number
│       │   ├── Inspection.js        # GPS check-in, photo uploads, checklist, score
│       │   ├── Incident.js          # 2dsphere geo index; real-time via Socket.IO
│       │   ├── NOCCertificate.js    # UUID verification token; PDF URL; QR code data URL
│       │   └── AuditLog.js          # Immutable log of all create/update/approve/login actions
│       ├── routes/                  # Thin Express routers (validation + auth + controller)
│       ├── controllers/             # Business logic; reads req.*, calls models & services, sends res
│       └── services/
│           ├── nocGenerator.js      # PDFKit PDF creation + Firebase Storage upload
│           ├── notificationService.js # Nodemailer SMTP (status updates, inspection scheduled)
│           ├── auditService.js      # Writes to AuditLog collection; never throws (fire-and-forget)
│           └── storageService.js    # Firebase Storage helper (upload, signed URL, delete)
│
├── .github/workflows/deploy.yml    # GitHub Actions: test → build → deploy on push to main
├── firebase.json                    # Firebase Hosting rewrites (/api/** → function "api") + cache headers
├── .firebaserc                      # Maps "default" alias to your Firebase project ID
├── firestore.rules                  # Firestore security rules (if Firestore is used for real-time features)
├── storage.rules                    # Firebase Storage rules (NOC certs public-read; uploads auth-only + size limit)
└── SETUP.md                         # This file
```

---

## 3. Firebase Project Setup

Firebase provides four services used by FRIMS: **Hosting**, **Cloud Functions**, **Storage**, and **Cloud Messaging**.

### 3.1 Create a Firebase Project

1. Open https://console.firebase.google.com and sign in with your Google account.
2. Click **"Add project"**.
3. Enter a project name, e.g. `frims-prod`. The console will suggest a Project ID such as `frims-prod-abc12`. **Note this Project ID** — you will need it in several places.
4. Choose whether to enable Google Analytics (recommended for production; you can use it with Firebase Performance Monitoring).
5. Click **"Create project"** and wait ~30 seconds for provisioning.

### 3.2 Register a Web App & Get the Firebase Config

The frontend React app uses the Firebase JS SDK. To get the SDK config values:

1. In the Firebase Console, click the ⚙️ gear icon next to "Project Overview" → **Project settings**.
2. Scroll to the **"Your apps"** section.
3. Click the **`</>`** (Web) icon to register a new web app.
4. Enter a nickname (e.g., `frims-web`) and tick **"Also set up Firebase Hosting"**.
5. Click **"Register app"**.
6. Firebase will display a config object like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "frims-prod-abc12.firebaseapp.com",
  projectId: "frims-prod-abc12",
  storageBucket: "frims-prod-abc12.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy every value** — each maps to a `REACT_APP_FIREBASE_*` environment variable.

### 3.3 Enable Firebase Storage

1. In the Firebase Console left sidebar → **"Build"** → **"Storage"**.
2. Click **"Get started"**.
3. When prompted about security rules, choose **"Start in production mode"** (rules are already defined in `storage.rules`).
4. Choose a storage bucket location (pick a region close to your users, e.g., `us-central1` or `asia-south1`).
5. Click **"Done"**.

The storage bucket URL will be `frims-prod-abc12.appspot.com` — this is your `FIREBASE_STORAGE_BUCKET` value.

### 3.4 Get the Firebase Service Account Key (for backend)

The Node.js backend uses the Firebase Admin SDK to upload PDF certificates to Firebase Storage. It authenticates with a service account key.

1. Firebase Console → ⚙️ **Project settings** → **"Service accounts"** tab.
2. Select **"Node.js"** as the admin SDK.
3. Click **"Generate new private key"** → **"Generate key"**.
4. A JSON file downloads automatically (e.g., `frims-prod-firebase-adminsdk-xxxxx.json`).
5. Rename it to `serviceAccountKey.json` and place it in the `functions/` directory.
6. **Critical:** This file contains a private key. It is listed in `.gitignore` and must **never** be committed to version control or shared publicly.

> **What this file contains:** A private RSA key + service account email. The Admin SDK uses it to authenticate as a privileged service account that can write to Firebase Storage, send FCM messages, etc.

### 3.5 Get the VAPID Key for Push Notifications

The frontend uses a VAPID (Voluntary Application Server Identity) key to subscribe browsers to push notifications via Firebase Cloud Messaging.

1. Firebase Console → ⚙️ **Project settings** → **"Cloud Messaging"** tab.
2. Scroll to **"Web configuration"** section.
3. Under **"Web Push certificates"**, click **"Generate key pair"** (only do this once — do not regenerate or existing subscriptions will break).
4. Copy the **Key pair** value shown in the table. This is your `REACT_APP_FIREBASE_VAPID_KEY`.

### 3.6 Associate the Firebase CLI with Your Project

```bash
# Log in to Firebase using your Google account
firebase login

# From the repository root, initialise Firebase
cd /path/to/firms
firebase use frims-prod-abc12    # Replace with your actual Project ID

# Verify the association
cat .firebaserc
# Should show: { "projects": { "default": "frims-prod-abc12" } }
```

If `.firebaserc` already exists (it does in this repo), just update the project ID:

```json
{
  "projects": {
    "default": "frims-prod-abc12"
  }
}
```

---

## 4. MongoDB Atlas Production Setup

### 4.1 Create an Atlas Organization and Project

1. Go to https://cloud.mongodb.com and sign in (or create an account).
2. If this is your first time, Atlas will prompt you to create an **Organization**. Name it (e.g., `FRIMS Org`).
3. Click **"New Project"** → name it `frims-prod` → click **"Create project"**.

### 4.2 Create a Production Cluster

For production, use at least an **M10** dedicated cluster (not the free M0, which has performance and connection limits unsuitable for production).

1. Inside the `frims-prod` project, click **"Build a Cluster"** or **"Create"**.
2. Choose **Dedicated** tier.
3. Select **M10** (the minimum production tier — $0.08/hr).
4. Choose a **Cloud Provider & Region** closest to where you will deploy Firebase Functions. Firebase Functions default region is `us-central1`, so choose **AWS us-east-1** or **GCP us-central1** to minimise latency.
5. Keep the default **3-node replica set** for high availability.
6. Click **"Create Cluster"** and wait ~5 minutes for provisioning.

> **Production scaling:** If you expect > 500 concurrent users, upgrade to M20 or M30. Atlas allows live cluster tier upgrades with zero downtime.

### 4.3 Create a Database User

The application connects to MongoDB with a dedicated database user (not your Atlas console login).

1. In the Atlas left sidebar → **"Security"** → **"Database Access"**.
2. Click **"Add New Database User"**.
3. Choose **"Password"** authentication method.
4. Enter:
   - **Username:** `frims_api` (or any username you choose)
   - **Password:** Generate a strong random password (click "Autogenerate Secure Password") — **copy this password now**, you cannot view it again.
5. Under **"Database User Privileges"**, choose **"Built-in Role"** → **"Read and write to any database"** (this is the `readWriteAnyDatabase` role).
6. Click **"Add User"**.

### 4.4 Configure Network Access (IP Allowlist)

MongoDB Atlas blocks all connections by default. You must allow the IP addresses of your Firebase Cloud Functions.

**Option A — Allow Firebase Functions IP ranges (recommended for production):**

Firebase Cloud Functions run in Google Cloud. The outbound IP ranges are published at:
https://www.gstatic.com/ipranges/cloud.json

Add each IP range that belongs to your Firebase Functions region. For `us-central1`, as of this writing, the relevant ranges include `34.102.x.x`, `35.192.x.x`, etc. Check the published JSON for the current authoritative list.

This is tedious but most secure — only Firebase can reach your database.

**Option B — Allow all IPs (easier, less secure):**

1. Atlas sidebar → **"Security"** → **"Network Access"**.
2. Click **"Add IP Address"**.
3. Click **"Allow Access from Anywhere"** → this adds `0.0.0.0/0`.
4. Click **"Confirm"**.

> Use Option B only if you accept that anyone with valid credentials can attempt to connect. Combined with a strong password and TLS (Atlas enforces TLS by default), this is acceptable for many production scenarios.

### 4.5 Get the Connection String

1. Atlas left sidebar → **"Deployment"** → **"Database"** → click **"Connect"** on your cluster.
2. Choose **"Drivers"**.
3. Select **Driver: Node.js**, **Version: 5.5 or later**.
4. Copy the connection string. It will look like:

```
mongodb+srv://frims_api:<password>@frims-prod-cluster.abc12.mongodb.net/?retryWrites=true&w=majority&appName=frims-prod
```

5. Replace `<password>` with the database user password you saved in step 4.3.
6. Append the database name before `?` so Atlas creates it automatically:

```
mongodb+srv://frims_api:YOUR_PASSWORD@frims-prod-cluster.abc12.mongodb.net/frims?retryWrites=true&w=majority&appName=frims-prod
```

This full string is your `MONGODB_URI` value.

### 4.6 Create Required Database Indexes

The application creates indexes automatically via Mongoose schema definitions. The following indexes are created on first startup:

| Collection | Index | Purpose |
|------------|-------|---------|
| `users` | `{ email: 1 }` unique | Fast login lookups |
| `applications` | `{ status: 1, applicant: 1 }` | List filtering |
| `applications` | `{ "address.city": 1 }` | City-based reporting |
| `incidents` | `{ "location.coordinates": "2dsphere" }` | Geo-proximity queries |
| `incidents` | `{ status: 1, severity: 1 }` | Dashboard filters |
| `incidents` | `{ createdAt: -1 }` | Time-sorted listings |

No manual index creation is required — they are created automatically by Mongoose `schema.index()` calls on first connection.

---

## 5. Gmail SMTP App Password

FRIMS uses Nodemailer to send transactional emails (application status updates, inspection schedules). You need a **Gmail App Password** — this is a 16-character one-time token that lets a non-browser app send email through your Gmail account without using your real password.

> **Why App Password instead of your Gmail password?** Google blocks sign-in from apps that don't support OAuth 2.0 unless you create an App Password. Your real Gmail password should never be stored in a server config file.

### 5.1 Enable 2-Step Verification on your Google Account

App Passwords require 2-Step Verification to be active.

1. Go to https://myaccount.google.com/security.
2. Under **"How you sign in to Google"**, click **"2-Step Verification"**.
3. Follow the prompts to enable it (SMS or Google Authenticator).

### 5.2 Generate an App Password

1. Go to https://myaccount.google.com/apppasswords (this link only appears after 2-Step Verification is enabled).
2. In the **"App name"** field, type a label, e.g. `FRIMS Production`.
3. Click **"Create"**.
4. Google shows a 16-character password in a yellow box. **Copy it immediately** — it is shown only once.
5. Remove the spaces when saving it (e.g., `abcd efgh ijkl mnop` → `abcdefghijklmnop`).

This 16-character value is your `EMAIL_PASS` environment variable.

Your `EMAIL_USER` is the full Gmail address you used (e.g., `frims.notifications@gmail.com`).

---

## 6. Backend Environment Variables

Copy the example file and fill in every value:

```bash
cd functions
cp .env.example .env
```

Edit `functions/.env`:

```env
# ─── Server ───────────────────────────────────────────────────────────────────
PORT=5000
NODE_ENV=production

# ─── MongoDB Atlas ────────────────────────────────────────────────────────────
# Full connection string from Section 4.5 (include /frims database name)
MONGODB_URI=mongodb+srv://frims_api:YOUR_PASSWORD@frims-prod-cluster.abc12.mongodb.net/frims?retryWrites=true&w=majority&appName=frims-prod

# ─── JWT Authentication ───────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Must be at least 32 characters. Store this securely — changing it invalidates all sessions.
JWT_SECRET=REPLACE_WITH_96_CHAR_RANDOM_HEX_STRING

# Token lifetime. "7d" means users stay logged in for 7 days.
JWT_EXPIRES_IN=7d

# ─── Firebase Admin SDK ───────────────────────────────────────────────────────
# Your Firebase Project ID — found in Firebase Console > Project settings > General > "Project ID"
FIREBASE_PROJECT_ID=frims-prod-abc12

# Firebase Storage bucket name — found in Firebase Console > Storage > "gs://..." URL (omit "gs://")
FIREBASE_STORAGE_BUCKET=frims-prod-abc12.appspot.com

# Path to the service account key JSON file downloaded in Section 3.4
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json

# ─── Email (Nodemailer via Gmail SMTP) ────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Your Gmail address used to generate the App Password in Section 5
EMAIL_USER=frims.notifications@gmail.com

# The 16-character App Password from Section 5.2 (no spaces)
EMAIL_PASS=abcdefghijklmnop

# ─── CORS ─────────────────────────────────────────────────────────────────────
# The live URL where your React app is hosted (Firebase Hosting URL).
# Format: https://frims-prod-abc12.web.app
# You can also use a custom domain if configured in Firebase Hosting, e.g. https://frims.gov.in
# For multiple origins (e.g., custom domain + .web.app domain), separate with a comma:
# FRONTEND_URL=https://frims.gov.in,https://frims-prod-abc12.web.app
FRONTEND_URL=https://frims-prod-abc12.web.app
```

### 6.1 How to Generate a Secure JWT_SECRET

```bash
# Run this in any terminal with Node.js installed
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
# Example output: a3f7...  (96 hex characters = 384-bit secret)
```

Copy the output into `JWT_SECRET`. Never reuse secrets across environments.

### 6.2 Setting Firebase Functions Environment Variables

For production, Firebase Functions read environment variables from the runtime config, not from a `.env` file. Set them before deploying:

```bash
firebase functions:secrets:set MONGODB_URI
# Firebase will prompt you to enter the value securely (it won't appear on screen)

firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set JWT_EXPIRES_IN
firebase functions:secrets:set FIREBASE_PROJECT_ID
firebase functions:secrets:set FIREBASE_STORAGE_BUCKET
firebase functions:secrets:set EMAIL_HOST
firebase functions:secrets:set EMAIL_PORT
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASS
firebase functions:secrets:set FRONTEND_URL
```

> **Firebase Secrets** (via Cloud Secret Manager) are the recommended way to store sensitive values for Cloud Functions in production. They are encrypted at rest and only injected at runtime. This replaces the older `firebase functions:config:set` approach.

Alternatively, if you use `firebase functions:config:set`:

```bash
firebase functions:config:set \
  mongodb.uri="mongodb+srv://frims_api:..." \
  jwt.secret="YOUR_JWT_SECRET" \
  jwt.expires_in="7d" \
  email.host="smtp.gmail.com" \
  email.port="587" \
  email.user="frims.notifications@gmail.com" \
  email.pass="YOUR_APP_PASSWORD" \
  app.frontend_url="https://frims-prod-abc12.web.app"
```

---

## 7. Frontend Environment Variables

The React build is a **static bundle** — environment variables are baked in at build time. They are **not secrets** (they end up in the browser), but they must be set correctly for each environment.

Copy the example and fill in values:

```bash
cd client
cp .env.local.example .env.production
```

Edit `client/.env.production`:

```env
# ─── API & Socket ─────────────────────────────────────────────────────────────
# In production, the React app is served from Firebase Hosting.
# firebase.json rewrites /api/** to the Cloud Function, so use a relative URL.
REACT_APP_API_URL=/api

# The Socket.IO server URL — your Firebase Cloud Functions base URL
# Found in Firebase Console > Functions > Dashboard > URL column of the "api" function
# Format: https://us-central1-frims-prod-abc12.cloudfunctions.net
REACT_APP_SOCKET_URL=https://us-central1-frims-prod-abc12.cloudfunctions.net

# ─── Firebase Web SDK Config ──────────────────────────────────────────────────
# All values from the firebaseConfig object in Section 3.2

# Firebase Console > Project settings > Your apps > Web app > SDK setup > apiKey
REACT_APP_FIREBASE_API_KEY=AIzaSy...

# Firebase Console > Project settings > Your apps > Web app > authDomain
REACT_APP_FIREBASE_AUTH_DOMAIN=frims-prod-abc12.firebaseapp.com

# Firebase Console > Project settings > General > Project ID
REACT_APP_FIREBASE_PROJECT_ID=frims-prod-abc12

# Firebase Console > Project settings > Your apps > Web app > storageBucket
REACT_APP_FIREBASE_STORAGE_BUCKET=frims-prod-abc12.appspot.com

# Firebase Console > Project settings > Your apps > Web app > messagingSenderId
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012

# Firebase Console > Project settings > Your apps > Web app > appId
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# VAPID key from Section 3.5
# Firebase Console > Project settings > Cloud Messaging > Web configuration > Web Push certificates > Key pair
REACT_APP_FIREBASE_VAPID_KEY=BExample_VAPID_Key_Here...
```

### 7.1 Where Each Value Comes From — Quick Reference

| Variable | Location in Firebase Console |
|----------|------------------------------|
| `REACT_APP_FIREBASE_API_KEY` | Project settings → Your apps → Web app → `apiKey` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Project settings → Your apps → Web app → `authDomain` |
| `REACT_APP_FIREBASE_PROJECT_ID` | Project settings → General → **Project ID** |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Project settings → Your apps → Web app → `storageBucket` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Project settings → Your apps → Web app → `messagingSenderId` |
| `REACT_APP_FIREBASE_APP_ID` | Project settings → Your apps → Web app → `appId` |
| `REACT_APP_FIREBASE_VAPID_KEY` | Project settings → Cloud Messaging → Web Push certificates → Key pair |
| `REACT_APP_API_URL` | Use `/api` (relative URL; rewrites handled by `firebase.json`) |
| `REACT_APP_SOCKET_URL` | Firebase Console → Functions → Dashboard → URL of the `api` function |

---

## 8. Production Build

### 8.1 Install Dependencies

```bash
# Backend
cd functions
npm ci    # Uses package-lock.json for deterministic installs

# Frontend
cd ../client
npm ci
```

### 8.2 Build the React Frontend

```bash
cd client
npm run build
```

This creates a `client/build/` directory containing the optimised static bundle.  
`firebase.json` points `"public": "client/build"`, so Firebase Hosting will serve from this directory.

> The build command uses `client/.env.production` automatically when `NODE_ENV=production`.

### 8.3 Verify the Build

```bash
# Check that the build output exists
ls client/build/index.html
ls client/build/static/js/main.*.js
```

---

## 9. Deploy to Firebase

### 9.1 One-Command Full Deployment

```bash
# From the repository root
firebase deploy
```

This command deploys everything in one shot:
- **Firebase Hosting** — uploads `client/build/` to the global CDN
- **Firebase Cloud Functions** — deploys the `api` function (Node.js backend)
- **Firebase Storage rules** — applies `storage.rules`

### 9.2 Targeted Deployments

Use targeted deployments to speed up iterations when only part of the system changed:

```bash
# Deploy only the frontend (e.g., UI-only changes)
firebase deploy --only hosting

# Deploy only the backend function (e.g., API-only changes)
firebase deploy --only functions

# Deploy only Firebase Storage security rules
firebase deploy --only storage

# Deploy hosting and functions together (skip storage rules)
firebase deploy --only hosting,functions
```

### 9.3 Verify the Deployment URLs

After a successful deploy, Firebase prints the URLs:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/frims-prod-abc12/overview
Hosting URL: https://frims-prod-abc12.web.app
```

Open the Hosting URL in a browser — you should see the FRIMS login page.

### 9.4 Check Function Deployment

1. Firebase Console → **"Functions"** → **"Dashboard"**.
2. You should see a function named `api` with status **"✅ Active"**.
3. The function URL will be: `https://us-central1-frims-prod-abc12.cloudfunctions.net/api`
4. Test the health endpoint:

```bash
curl https://us-central1-frims-prod-abc12.cloudfunctions.net/api/health
# Expected: {"success":true,"message":"FRIMS API is running","version":"1.0.0"}
```

### 9.5 Configure a Custom Domain (Optional)

1. Firebase Console → **"Hosting"** → **"Add custom domain"**.
2. Enter your domain (e.g., `frims.gov.in`).
3. Firebase will provide DNS TXT records to verify ownership, then A records to point your domain to Firebase's CDN.
4. SSL certificate is provisioned automatically (free, via Let's Encrypt).
5. Update `FRONTEND_URL` in your backend environment variables to include the custom domain.

---

## 10. Create the First Admin Account

> **Security note:** The `/api/auth/register` endpoint only allows `applicant` and `inspector` roles to self-register. `admin` and `viewer` roles **cannot** be assigned via the public registration endpoint — this prevents privilege escalation. The first admin must be created directly in the database.

### 10.1 Connect to MongoDB Atlas via the Data Explorer

1. MongoDB Atlas Console → **"Deployment"** → **"Database"** → click **"Browse Collections"** on your cluster.
2. You should see the `frims` database with a `users` collection (it may be empty on first visit).
3. Click **"INSERT DOCUMENT"**.

### 10.2 Insert the Admin User Document

Insert the following document. **Replace the password hash** with a bcrypt hash of your chosen admin password:

First, generate the bcrypt hash:

```bash
# Run this in the functions directory to use the same bcryptjs version
cd functions
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('YourAdminPassword@123', 12).then(h => console.log(h));
"
# Example output: \$2a\$12\$abc123...  (60-character bcrypt hash)
```

Then insert this document into the `users` collection in Atlas:

```json
{
  "name": "System Administrator",
  "email": "admin@frims.gov",
  "password": "$2a$12$PASTE_YOUR_BCRYPT_HASH_HERE",
  "role": "admin",
  "isActive": true,
  "emailVerified": true,
  "createdAt": { "$date": "2025-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-01-01T00:00:00.000Z" }
}
```

### 10.3 Verify Admin Login

```bash
curl -X POST https://frims-prod-abc12.web.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@frims.gov", "password": "YourAdminPassword@123"}'

# Expected response:
# {"success":true,"token":"eyJhb...","user":{"_id":"...","name":"System Administrator","role":"admin",...}}
```

Save the `token` value — you will need it to call admin-protected endpoints.

### 10.4 Create Additional Admin Users via the API

Once you have the admin token, you can create additional admins by directly inserting documents in Atlas (as above) or by adding a separate admin-user-creation endpoint protected by the admin role.

---

## 11. GitHub Actions CI/CD Secrets

The CI/CD pipeline (`.github/workflows/deploy.yml`) automatically runs tests on every pull request and deploys to Firebase on every push to `main`. It needs one secret: the Firebase CI token.

### 11.1 Generate the Firebase CI Token

```bash
firebase login:ci
```

This opens a browser, prompts you to log in with your Google account, and prints a long token starting with `1//`. Copy the entire token.

### 11.2 Add the Secret to GitHub

1. Go to your GitHub repository → **Settings** tab.
2. In the left sidebar → **"Secrets and variables"** → **"Actions"**.
3. Click **"New repository secret"**.
4. Enter:
   - **Name:** `FIREBASE_TOKEN`
   - **Secret:** Paste the token from step 11.1
5. Click **"Add secret"**.

### 11.3 How the CI/CD Pipeline Works

```
Pull Request opened or updated
  │
  ├── Job: Backend Tests (Node 20)
  │   ├── npm ci  (installs with lockfile)
  │   └── npm test  (Jest — runs src/__tests__/**/*.test.js)
  │       Tests run with JWT_SECRET and MONGODB_URI set as test env vars
  │
  └── Job: Frontend Tests & Build (Node 20)
      ├── npm ci
      ├── npm test  (react-scripts test --watchAll=false)
      └── npm run build  (validates the production bundle builds without errors)

Push to main branch (after PR is merged)
  │
  └── Job: Deploy to Firebase (requires both test jobs to pass)
      ├── npm ci  (frontend)
      ├── npm run build  (frontend production bundle)
      ├── npm ci  (functions)
      └── firebase deploy --only hosting,functions
          Uses FIREBASE_TOKEN secret for authentication
```

The pipeline ensures that broken code can never reach production — deploy only runs if all tests pass and the build succeeds.

---

## 12. Post-Deployment Verification

Run each check after every deployment to verify end-to-end functionality:

### 12.1 Health Check

```bash
curl https://YOUR_PROJECT.web.app/api/health
# Expected: {"success":true,"message":"FRIMS API is running","version":"1.0.0"}
```

### 12.2 Authentication Flow

```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST https://YOUR_PROJECT.web.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@frims.gov","password":"YourAdminPassword@123"}' \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); console.log(JSON.parse(d).token)")

# 2. Verify token works
curl -H "Authorization: Bearer $TOKEN" https://YOUR_PROJECT.web.app/api/auth/me
# Expected: {"success":true,"user":{"role":"admin",...}}
```

### 12.3 Public NOC Verification Endpoint

This endpoint is unauthenticated and must work for QR code verification:

```bash
curl https://YOUR_PROJECT.web.app/api/noc/verify/SOME_VERIFICATION_TOKEN
# If token does not exist: {"success":false,"message":"Certificate not found or invalid"}
# That 404 response is correct — it means the endpoint is reachable
```

### 12.4 Frontend Application Routes

Open these URLs in a browser and verify each loads correctly:

| URL | Expected Behaviour |
|-----|--------------------|
| `https://YOUR_PROJECT.web.app/` | Redirects to `/dashboard` |
| `https://YOUR_PROJECT.web.app/login` | Shows login form |
| `https://YOUR_PROJECT.web.app/register` | Shows registration form |
| `https://YOUR_PROJECT.web.app/verify-noc/test` | Shows "Certificate not found" (correct) |
| `https://YOUR_PROJECT.web.app/dashboard` | Redirects to `/login` (not authenticated) |

### 12.5 Dashboard After Login

1. Open the app, log in with the admin account.
2. Verify the dashboard loads with the stat cards (Total Applications, Active Incidents, etc.).
3. Verify the Leaflet map renders (OpenStreetMap tiles should load).
4. Verify the sidebar navigation links all work.

---

## 13. API Reference

All API endpoints are prefixed with `/api`. The base URL in production is `https://YOUR_PROJECT.web.app/api`.

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/register` | None | Register as `applicant` or `inspector`. `admin`/`viewer` roles are rejected. |
| `POST` | `/auth/login` | None | Returns JWT token + user object. |
| `GET` | `/auth/me` | JWT | Returns the authenticated user's profile (password field excluded). |
| `PUT` | `/auth/profile` | JWT | Update name, phone, address, organization. |
| `PUT` | `/auth/change-password` | JWT | Requires `currentPassword` + `newPassword` (min 8 chars). |
| `GET` | `/auth/users` | Admin JWT | List all users. Supports `?role=inspector&page=1&limit=20`. |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "applicant",
  "phone": "+91-9876543210",
  "organization": "ABC Pvt Ltd"
}
```

**Login request body:**
```json
{ "email": "john@example.com", "password": "SecurePass@123" }
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "John Doe", "email": "...", "role": "applicant" }
}
```

### Application Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/applications` | JWT | List applications. Applicants see only their own; admins/inspectors see all. Supports `?status=submitted&page=1&limit=20`. |
| `POST` | `/applications` | JWT | Create a new NOC application (status starts as `draft`). |
| `GET` | `/applications/:id` | JWT | Get full application details. Applicants can only access their own. |
| `PUT` | `/applications/:id` | JWT | Update application fields (allowed when in `draft` status). |
| `POST` | `/applications/:id/submit` | JWT (owner) | Move application from `draft` → `submitted`. Triggers status email. |
| `PUT` | `/applications/:id/review` | Admin JWT | Set status to `under_review`, `inspection_scheduled`, `approved`, or `rejected`. |
| `GET` | `/applications/stats` | Admin JWT | Returns count of applications grouped by status. |

**Create application request body:**
```json
{
  "propertyName": "City Mall",
  "propertyType": "commercial",
  "address": {
    "street": "MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  },
  "floorArea": 5000,
  "numberOfFloors": 4,
  "occupancyType": "retail"
}
```

**Application status flow:**
```
draft → submitted → under_review → inspection_scheduled → inspection_in_progress → approved → certificate_issued
                                                                                 ↘ rejected
```

### Inspection Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/inspections` | JWT | List inspections. Inspectors see only assigned ones. |
| `POST` | `/inspections` | Admin JWT | Schedule a new inspection (assigns inspector + date). |
| `GET` | `/inspections/:id` | JWT | Get inspection details including checklist and photos. |
| `PUT` | `/inspections/:id` | Admin/Inspector JWT | Update inspection details or result. |
| `POST` | `/inspections/:id/checkin` | Inspector JWT | Record GPS coordinates + timestamp of field arrival. |
| `POST` | `/inspections/:id/checklist` | Inspector JWT | Submit completed checklist + overall result + score. |

**GPS check-in body:**
```json
{ "lat": 12.9716, "lng": 77.5946 }
```

**Checklist submission body:**
```json
{
  "overallResult": "pass",
  "score": 87,
  "summary": "All fire exits accessible. Extinguishers in date.",
  "checklist": [
    { "category": "Fire Exits", "item": "Exit doors unlocked", "status": "pass" },
    { "category": "Extinguishers", "item": "Within service date", "status": "pass" },
    { "category": "Sprinklers", "item": "System pressure correct", "status": "fail", "remarks": "Pressure low in Zone 3" }
  ]
}
```

### Incident Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/incidents` | JWT | List incidents. Supports geo filter: `?lat=12.97&lng=77.59&radius=10` (radius in km). |
| `POST` | `/incidents` | JWT | Report a new incident. Emits `incident:new` Socket.IO event. |
| `GET` | `/incidents/:id` | JWT | Get incident with all updates. |
| `PUT` | `/incidents/:id` | Admin JWT | Update incident status/details. Emits `incident:updated`. |
| `POST` | `/incidents/:id/updates` | JWT | Add a text update to an incident. Emits `incident:update`. |
| `GET` | `/incidents/stats` | JWT | Aggregated counts by severity, status, and type. |

**Report incident body:**
```json
{
  "title": "Kitchen Fire — 4th Floor",
  "description": "Grease fire in commercial kitchen, spreading to ventilation duct",
  "type": "fire",
  "severity": "high",
  "location": {
    "address": "123 MG Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "coordinates": { "lat": 12.9716, "lng": 77.5946 }
  }
}
```

### NOC Certificate Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/noc/verify/:token` | **None** | Public certificate verification. Used by QR code scan. |
| `GET` | `/noc` | JWT | List certificates. Applicants see only their own. |
| `POST` | `/noc/issue/:applicationId` | Admin JWT | Issue certificate for an approved application. Generates PDF + QR. |
| `GET` | `/noc/:id` | JWT | Get full certificate including PDF URL and QR data URL. |
| `PUT` | `/noc/:id/revoke` | Admin JWT | Revoke a certificate. Requires `{ "reason": "..." }` in body. |

**Issue certificate body:**
```json
{
  "conditions": [
    "Annual fire extinguisher servicing required",
    "Emergency exit lighting must remain operational at all times"
  ]
}
```

**Public verification response:**
```json
{
  "success": true,
  "isValid": true,
  "certificate": {
    "certificateNumber": "NOC-CERT-2025-000001",
    "propertyDetails": { "name": "City Mall", "address": "MG Road, Bangalore", "type": "commercial" },
    "validFrom": "2025-01-01T00:00:00.000Z",
    "validUntil": "2026-01-01T00:00:00.000Z",
    "status": "issued",
    "issuedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Analytics Endpoints (Admin Only)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/analytics/dashboard` | Admin JWT | Total applications, pending, active incidents, certificates issued, inspector count. |
| `GET` | `/analytics/trends/applications` | Admin JWT | Monthly application counts for the last N months. `?months=6` |
| `GET` | `/analytics/heatmap/incidents` | Admin JWT | Array of `{lat, lng, weight}` objects for Leaflet heatmap. |
| `GET` | `/analytics/metrics/inspections` | Admin JWT | Pass rate %, average score, total completed, breakdown by result. |
| `GET` | `/analytics/risk-score` | Admin JWT | Risk score (0–100) based on recent incident severity. `?city=Bangalore` |

---

## 14. Production Security Checklist

Complete this checklist before going live:

### Secrets & Credentials
- [ ] `JWT_SECRET` is a random 48+ byte value, not a human-readable string
- [ ] `serviceAccountKey.json` is in `.gitignore` and has **never** been committed
- [ ] MongoDB password contains uppercase, lowercase, numbers, and symbols
- [ ] Gmail App Password is stored only in environment variables, not in source code
- [ ] Firebase project has **not** enabled Email/Password auth (FRIMS uses its own JWT auth)
- [ ] No sensitive data is stored in `client/.env.production` (it becomes public in the browser bundle)

### MongoDB Atlas
- [ ] Using M10+ dedicated cluster (not free M0 tier)
- [ ] Cluster has TLS/SSL enforced (Atlas default — do not disable)
- [ ] IP allowlist is restricted to Firebase Functions IP ranges (or `0.0.0.0/0` if you accept broader access)
- [ ] Database user has **only** `readWriteAnyDatabase` — not `atlasAdmin`
- [ ] Atlas alerts configured for high connection count and slow queries

### Firebase
- [ ] Firebase Hosting only serves from `client/build/` — no server-side code exposed
- [ ] Storage rules deployed (`firebase deploy --only storage`) — verify in Firebase Console > Storage > Rules
- [ ] Service account key file is NOT deployed with the function (it's loaded from filesystem via `FIREBASE_SERVICE_ACCOUNT_KEY` path)
- [ ] Firebase project billing alerts configured

### Express Backend
- [ ] `NODE_ENV=production` (disables verbose error messages in API responses)
- [ ] Helmet CSP headers are active (configured in `app.js`)
- [ ] Rate limiting active: 100 req/15 min global; 20 req/15 min on auth endpoints
- [ ] `express-mongo-sanitize` strips `$` and `.` from all request inputs
- [ ] CORS `FRONTEND_URL` is set to the exact production domain(s) only — not `*`
- [ ] All `:id` route parameters validated against MongoDB ObjectId format

### Passwords & Access
- [ ] Admin user's password is at least 16 characters with mixed character classes
- [ ] Admin email is a controlled organisation email (not a public Gmail)
- [ ] No `role: "admin"` users should exist in the database that you did not create intentionally

---

## 15. Monitoring & Observability

### 15.1 Firebase Functions Logs

View real-time backend logs:

```bash
firebase functions:log
# Stream logs continuously:
firebase functions:log --follow
```

Or in the Firebase Console: **Functions → Logs**.

### 15.2 MongoDB Atlas Monitoring

Atlas provides built-in monitoring at **"Deployment" → "Database" → your cluster → "Metrics"**:

| Metric | Alert Threshold (suggested) |
|--------|-----------------------------|
| Connections | > 80% of max (M10 = 1500 connections) |
| Query execution time | > 100ms average |
| Disk IOPS | > 80% of provisioned |
| Replication lag | > 10 seconds |

Set up Atlas alerts: **"Alerts"** in the left sidebar → **"Add Alert"**.

### 15.3 Uptime Monitoring

Use a free external uptime monitor to alert you if the API goes down:

- **UptimeRobot** (https://uptimerobot.com) — free tier supports 50 monitors, 5-minute intervals
- Add a monitor pointing to: `https://YOUR_PROJECT.web.app/api/health`
- Configure email/SMS alerts

### 15.4 Firebase Performance Monitoring

The frontend has Firebase Performance Monitoring enabled via the Firebase JS SDK. View metrics at:
Firebase Console → **"Release & Monitor"** → **"Performance"**.

It automatically captures:
- Page load times
- API request durations (Axios requests via `firebase/performance`)
- Firebase Storage operation times

### 15.5 Error Tracking (Sentry — Optional)

For production error tracking with stack traces:

```bash
# Backend
cd functions
npm install @sentry/node

# Frontend
cd client
npm install @sentry/react
```

Sentry DSN is obtained at https://sentry.io → New Project → Node.js / React.  
Add `SENTRY_DSN` to your environment variables and initialise it in `functions/index.js` and `client/src/index.js`.

---

## 16. Troubleshooting

### MongoDB Connection Issues

**Error:** `MongooseServerSelectionError: connection timed out`

**Causes and fixes:**
1. **IP not whitelisted** — Atlas Network Access → verify your Firebase Functions region IP ranges are listed, or temporarily add `0.0.0.0/0` to confirm connectivity.
2. **Wrong connection string** — Ensure the string includes `/frims` database name and `?retryWrites=true&w=majority`.
3. **Wrong password** — Database user passwords cannot contain `@`, `#`, or `/` without URL-encoding. If your password contains special characters, URL-encode them or choose a password with only alphanumeric characters.
4. **Cluster paused** — Free M0 clusters pause after 60 days of inactivity. Atlas Console → your cluster → **"Resume"**.

---

### Firebase Functions Deployment Fails

**Error:** `Error: HTTP Error: 400, The request has errors`

**Fixes:**
1. Ensure `functions/package.json` has `"engines": { "node": "20" }`.
2. Run `npm ci` in `functions/` to ensure `package-lock.json` is in sync with `package.json`.
3. Check that `serviceAccountKey.json` is NOT in `functions/.gitignore` exceptions — it should not be deployed.
4. Check function logs: `firebase functions:log` for runtime startup errors.

---

### CORS Errors in Browser

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Fixes:**
1. Confirm `FRONTEND_URL` in your backend environment exactly matches the `Origin` header the browser sends (e.g., `https://frims-prod-abc12.web.app`, not `http://...` and not with a trailing slash).
2. For custom domains, add them to `FRONTEND_URL` as a comma-separated list:
   ```
   FRONTEND_URL=https://frims.gov.in,https://frims-prod-abc12.web.app
   ```
3. In production with Firebase Hosting, the rewrite rules in `firebase.json` route `/api/**` to the Cloud Function, so the browser makes same-origin requests — CORS may not even be triggered.

---

### Map Not Loading (Blank Map Tiles)

**Fixes:**
1. Leaflet CSS must be loaded. Verify `index.html` links `leaflet/dist/leaflet.css`.
2. The `IncidentMap` component uses `react-leaflet` — ensure `@react-leaflet/core` is installed.
3. OpenStreetMap tile server requires internet access from the browser. If running in a restricted network, configure Leaflet to use a self-hosted tile server.

---

### Push Notifications Not Arriving

**Fixes:**
1. Push notifications require **HTTPS** — they will not work on `http://localhost`.
2. Verify `REACT_APP_FIREBASE_VAPID_KEY` exactly matches the key in Firebase Console → Cloud Messaging → Web Push certificates.
3. Verify the browser has granted notification permission (browser settings → site permissions → notifications → allow).
4. The FCM service worker (`public/firebase-messaging-sw.js`) must be served from the root of the domain.
5. Check the browser console for `FirebaseError: Messaging: ...` errors.

---

### Emails Not Sending

**Error:** `Error: Invalid login: 534-5.7.9 Application-specific password required`

**Fixes:**
1. Confirm 2-Step Verification is enabled on the Google account.
2. Confirm `EMAIL_PASS` is the 16-character App Password, not the account password.
3. Ensure `EMAIL_PASS` has no spaces (remove the spaces Google shows in groups of 4).
4. If using a Google Workspace account, the domain admin must enable "Less secure app access" or App Passwords.

---

### Rate Limit Errors (429)

**Error:** `{"success":false,"message":"Too many requests, please try again later."}`

The default rate limits are:
- **Global:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 20 requests per 15 minutes per IP

**Fixes:**
1. If you are running automated tests against production, add the test IP to an allowlist or reduce test frequency.
2. If legitimate users hit the limit, increase the `max` value in `functions/src/middleware/rateLimiter.js` (e.g., `max: 300`).

---

### 404 on Page Refresh (Deep Links)

**Cause:** Firebase Hosting must serve `index.html` for all non-file routes so React Router handles them client-side.

**Fix:** Verify `firebase.json` has this rewrite rule:
```json
{ "source": "**", "destination": "/index.html" }
```
This is already present in the project's `firebase.json`. If it is missing, add it as the **last** entry in the `"rewrites"` array.
