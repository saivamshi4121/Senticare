const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io configuration
const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userDepartment = user.department;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected with role ${socket.userRole}`);

    // Join user to their department room
    socket.join(`department:${socket.userDepartment}`);
    
    // Join user to role-based rooms
    socket.join(`role:${socket.userRole}`);

    // Join user to their personal room for direct notifications
    socket.join(`user:${socket.userId}`);

    // Handle joining patient-specific rooms
    socket.on('joinPatientRoom', (patientId) => {
      socket.join(`patient:${patientId}`);
      console.log(`User ${socket.userId} joined patient room ${patientId}`);
    });

    // Handle leaving patient-specific rooms
    socket.on('leavePatientRoom', (patientId) => {
      socket.leave(`patient:${patientId}`);
      console.log(`User ${socket.userId} left patient room ${patientId}`);
    });

    // Handle joining alert-specific rooms
    socket.on('joinAlertRoom', (alertId) => {
      socket.join(`alert:${alertId}`);
      console.log(`User ${socket.userId} joined alert room ${alertId}`);
    });

    // Handle leaving alert-specific rooms
    socket.on('leaveAlertRoom', (alertId) => {
      socket.leave(`alert:${alertId}`);
      console.log(`User ${socket.userId} left alert room ${alertId}`);
    });

    // Handle real-time vital signs updates
    socket.on('vitalSignsUpdate', (data) => {
      const { patientId, vitalSigns } = data;
      
      // Broadcast to patient room
      socket.to(`patient:${patientId}`).emit('vitalSignsUpdated', {
        patientId,
        vitalSigns,
        timestamp: new Date(),
        updatedBy: socket.userId
      });
    });

    // Handle alert acknowledgment
    socket.on('acknowledgeAlert', (data) => {
      const { alertId, notes } = data;
      
      // Broadcast to alert room
      socket.to(`alert:${alertId}`).emit('alertAcknowledged', {
        alertId,
        acknowledgedBy: socket.userId,
        notes,
        timestamp: new Date()
      });
    });

    // Handle alert resolution
    socket.on('resolveAlert', (data) => {
      const { alertId, resolutionNotes } = data;
      
      // Broadcast to alert room
      socket.to(`alert:${alertId}`).emit('alertResolved', {
        alertId,
        resolvedBy: socket.userId,
        resolutionNotes,
        timestamp: new Date()
      });
    });

    // Handle patient status updates
    socket.on('patientStatusUpdate', (data) => {
      const { patientId, status, updatedBy } = data;
      
      // Broadcast to patient room and department
      socket.to(`patient:${patientId}`).emit('patientStatusChanged', {
        patientId,
        status,
        updatedBy: updatedBy || socket.userId,
        timestamp: new Date()
      });
    });

    // Handle staff assignment updates
    socket.on('staffAssignmentUpdate', (data) => {
      const { patientId, staffId, action } = data; // action: 'assigned' or 'removed'
      
      // Broadcast to patient room
      socket.to(`patient:${patientId}`).emit('staffAssignmentChanged', {
        patientId,
        staffId,
        action,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle emergency alerts
    socket.on('emergencyAlert', (data) => {
      const { patientId, alertType, message, priority } = data;
      
      // Broadcast to all medical staff
      socket.to('role:Doctor').emit('emergencyAlert', {
        patientId,
        alertType,
        message,
        priority,
        triggeredBy: socket.userId,
        timestamp: new Date()
      });
      
      socket.to('role:Nurse').emit('emergencyAlert', {
        patientId,
        alertType,
        message,
        priority,
        triggeredBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
    });
  });

  return io;
};

// Utility functions for emitting events
const emitNewAlert = (io, alert) => {
  if (!io) return;

  // Emit to all medical staff
  io.to('role:Doctor').emit('newAlert', alert);
  io.to('role:Nurse').emit('newAlert', alert);
  
  // Emit to patient room if alert is patient-specific
  if (alert.patient) {
    io.to(`patient:${alert.patient}`).emit('newAlert', alert);
  }
};

const emitAlertUpdate = (io, alert) => {
  if (!io) return;

  // Emit to alert room
  io.to(`alert:${alert._id}`).emit('alertUpdated', alert);
  
  // Emit to patient room
  if (alert.patient) {
    io.to(`patient:${alert.patient}`).emit('alertUpdated', alert);
  }
};

const emitAlertAcknowledged = (io, alert) => {
  if (!io) return;

  io.to(`alert:${alert._id}`).emit('alertAcknowledged', alert);
  
  if (alert.patient) {
    io.to(`patient:${alert.patient}`).emit('alertAcknowledged', alert);
  }
};

const emitAlertResolved = (io, alert) => {
  if (!io) return;

  io.to(`alert:${alert._id}`).emit('alertResolved', alert);
  
  if (alert.patient) {
    io.to(`patient:${alert.patient}`).emit('alertResolved', alert);
  }
};

const emitVitalSignsUpdate = (io, patientId, vitalSigns, updatedBy) => {
  if (!io) return;

  io.to(`patient:${patientId}`).emit('vitalSignsUpdated', {
    patientId,
    vitalSigns,
    updatedBy,
    timestamp: new Date()
  });
};

const emitPatientUpdate = (io, patient) => {
  if (!io) return;

  io.to(`patient:${patient._id}`).emit('patientUpdated', patient);
  
  // Notify assigned staff
  if (patient.assignedStaff && patient.assignedStaff.length > 0) {
    patient.assignedStaff.forEach(staffId => {
      io.to(`user:${staffId}`).emit('assignedPatientUpdated', patient);
    });
  }
};

const emitEmergencyAlert = (io, patientId, alertData) => {
  if (!io) return;

  // Emit to all medical staff
  io.to('role:Doctor').emit('emergencyAlert', {
    patientId,
    ...alertData,
    timestamp: new Date()
  });
  
  io.to('role:Nurse').emit('emergencyAlert', {
    patientId,
    ...alertData,
    timestamp: new Date()
  });
};

const emitSystemNotification = (io, notification) => {
  if (!io) return;

  // Emit to all connected users
  io.emit('systemNotification', {
    ...notification,
    timestamp: new Date()
  });
};

const emitDepartmentNotification = (io, department, notification) => {
  if (!io) return;

  io.to(`department:${department}`).emit('departmentNotification', {
    ...notification,
    timestamp: new Date()
  });
};

const emitRoleNotification = (io, role, notification) => {
  if (!io) return;

  io.to(`role:${role}`).emit('roleNotification', {
    ...notification,
    timestamp: new Date()
  });
};

// Get online users count
const getOnlineUsersCount = (io) => {
  return io.engine.clientsCount;
};

// Get online users by role
const getOnlineUsersByRole = (io, role) => {
  const sockets = Array.from(io.sockets.sockets.values());
  return sockets.filter(socket => socket.userRole === role).length;
};

// Get online users by department
const getOnlineUsersByDepartment = (io, department) => {
  const sockets = Array.from(io.sockets.sockets.values());
  return sockets.filter(socket => socket.userDepartment === department).length;
};

module.exports = {
  configureSocket,
  emitNewAlert,
  emitAlertUpdate,
  emitAlertAcknowledged,
  emitAlertResolved,
  emitVitalSignsUpdate,
  emitPatientUpdate,
  emitEmergencyAlert,
  emitSystemNotification,
  emitDepartmentNotification,
  emitRoleNotification,
  getOnlineUsersCount,
  getOnlineUsersByRole,
  getOnlineUsersByDepartment
};
