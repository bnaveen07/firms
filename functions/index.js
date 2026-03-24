require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const connectDB = require('./src/config/db');
const { initFirebase } = require('./src/config/firebase-admin');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Create a plain http server first so Socket.IO can attach to it
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    methods: ['GET', 'POST'],
  },
});

// Build the Express app with io injected so all route handlers have req.io
const app = createApp(io);
server.on('request', app);

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join:incident-room', (data) => {
    if (data && data.incidentId) {
      socket.join(`incident-${data.incidentId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    initFirebase();

    server.listen(PORT, () => {
      logger.info(`FRIMS server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
