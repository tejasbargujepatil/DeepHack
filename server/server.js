require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const prisma = require('./config/db');

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Setup Socket.io
const { initSocket } = require('./sockets');
initSocket(server);

// Start server
const startServer = async () => {
  try {
    // Check DB connection
    await prisma.$connect();
    logger.info('✅ Database connection successful');

    server.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (err) {
    logger.error('❌ Failed to connect to DB', err);
    process.exit(1);
  }
};

startServer();

// Catch unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message, err.stack);
  server.close(() => {
    prisma.$disconnect();
    process.exit(1);
  });
});
