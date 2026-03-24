'use strict';

// ─── Secret names stored in Firebase Secret Manager ──────────────────────────
// Values are injected as process.env.<NAME> at runtime by Cloud Functions.
// Register each secret with:  firebase functions:secrets:set <NAME>
const SECRET_NAMES = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'FRONTEND_URL',
];

// ─── Firebase Cloud Functions export (production) ────────────────────────────
// Firebase injects each secret as an environment variable before the handler
// runs, so all downstream code reads them via process.env.<NAME> as normal.
const functions = require('firebase-functions/v1');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const { initFirebase } = require('./src/config/firebase-admin');

// Lazily initialised Express app — shared across warm invocations.
let _expressApp = null;

const getExpressApp = async () => {
  if (_expressApp) return _expressApp;
  await connectDB();
  initFirebase();
  // Cloud Functions are stateless HTTP — Socket.IO real-time is handled
  // separately (Cloud Run / long-lived service).  Pass null for io here.
  _expressApp = createApp(null);
  return _expressApp;
};

exports.api = functions
  .runWith({ secrets: SECRET_NAMES })
  .https.onRequest(async (req, res) => {
    const app = await getExpressApp();
    return app(req, res);
  });

// ─── Local development server ─────────────────────────────────────────────────
// Only runs when the file is executed directly: `node index.js` or `npm run dev`
// In this mode dotenv loads values from functions/.env (local-only, git-ignored).
if (require.main === module) {
  require('dotenv').config();

  const http = require('http');
  const { Server } = require('socket.io');
  const logger = require('./src/utils/logger');

  const PORT = process.env.PORT || 5000;

  const server = http.createServer();
  const io = new Server(server, {
    cors: {
      origin: (process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
      methods: ['GET', 'POST'],
    },
  });

  const app = createApp(io);
  server.on('request', app);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    socket.on('join:incident-room', (data) => {
      if (data && data.incidentId) socket.join(`incident-${data.incidentId}`);
    });
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  const startServer = async () => {
    try {
      await connectDB();
      initFirebase();
      server.listen(PORT, () => logger.info(`FRIMS dev server running on port ${PORT}`));
    } catch (error) {
      require('./src/utils/logger').error(`Server startup error: ${error.message}`);
      process.exit(1);
    }
  };

  startServer();
}
