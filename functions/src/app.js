const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const { defaultLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const applicationsRoutes = require('./routes/applications.routes');
const inspectionsRoutes = require('./routes/inspections.routes');
const incidentsRoutes = require('./routes/incidents.routes');
const nocRoutes = require('./routes/noc.routes');
const analyticsRoutes = require('./routes/analytics.routes');

/**
 * Creates and configures the Express application.
 * @param {import('socket.io').Server} [io] - Optional Socket.IO server instance
 * @returns {express.Application}
 */
const createApp = (io) => {
  const app = express();

  // Trust the first proxy so express-rate-limit sees correct client IPs
  app.set('trust proxy', 1);

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
          imgSrc: ["'self'", 'data:', 'https://*.tile.openstreetmap.org', 'https://cdnjs.cloudflare.com'],
          connectSrc: ["'self'", ...allowedOrigins],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Strip $ and . from req.body/params/query to prevent NoSQL injection
  app.use(mongoSanitize());

  app.use(defaultLimiter);

  // Inject Socket.IO instance into every request so controllers can emit events
  if (io) {
    app.use((req, _res, next) => {
      req.io = io;
      next();
    });
  }

  app.get('/health', (req, res) => {
    res.json({ success: true, message: 'FRIMS API is running', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/applications', applicationsRoutes);
  app.use('/api/inspections', inspectionsRoutes);
  app.use('/api/incidents', incidentsRoutes);
  app.use('/api/noc', nocRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
