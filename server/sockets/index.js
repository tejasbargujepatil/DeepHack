const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Users join a room with their User ID to receive personal notifications
    socket.join(`user_${socket.user.id}`);
    
    // Admins and employees join a special room for global alerts
    if (['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'].includes(socket.user.role)) {
        socket.join('admin_dashboard');
    }

    // Example feature: track order room
    socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
        logger.info(`User ${socket.user.id} joined order room: ${orderId}`);
    });

    socket.on('leave_order_room', (orderId) => {
        socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

// Notification Helpers
const notifyUser = (userId, event, data) => {
    if (io) io.to(`user_${userId}`).emit(event, data);
};

const notifyOrderUpdate = (orderId, data) => {
    if (io) io.to(`order_${orderId}`).emit('order_updated', data);
};

const notifyAdmins = (event, data) => {
    if (io) io.to('admin_dashboard').emit(event, data);
};

module.exports = { initSocket, getIo, notifyUser, notifyOrderUpdate, notifyAdmins };
