const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { defaultLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const applicationsRoutes = require('./routes/applications.routes');
const inspectionsRoutes = require('./routes/inspections.routes');
const incidentsRoutes = require('./routes/incidents.routes');
const nocRoutes = require('./routes/noc.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(defaultLimiter);

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

module.exports = app;
