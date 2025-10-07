import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event handlers
export const setupSocketListeners = (socket, callbacks = {}) => {
  if (!socket) return;

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    callbacks.onConnect?.();
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    callbacks.onDisconnect?.(reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    callbacks.onConnectError?.(error);
  });

  // Alert events
  socket.on('newAlert', (alert) => {
    console.log('New alert received:', alert);
    callbacks.onNewAlert?.(alert);
  });

  socket.on('alertUpdated', (alert) => {
    console.log('Alert updated:', alert);
    callbacks.onAlertUpdated?.(alert);
  });

  socket.on('alertAcknowledged', (alert) => {
    console.log('Alert acknowledged:', alert);
    callbacks.onAlertAcknowledged?.(alert);
  });

  socket.on('alertResolved', (alert) => {
    console.log('Alert resolved:', alert);
    callbacks.onAlertResolved?.(alert);
  });

  socket.on('alertEscalated', (alert) => {
    console.log('Alert escalated:', alert);
    callbacks.onAlertEscalated?.(alert);
  });

  // Patient events
  socket.on('vitalSignsUpdated', (data) => {
    console.log('Vital signs updated:', data);
    callbacks.onVitalSignsUpdated?.(data);
  });

  socket.on('patientUpdated', (patient) => {
    console.log('Patient updated:', patient);
    callbacks.onPatientUpdated?.(patient);
  });

  socket.on('patientStatusChanged', (data) => {
    console.log('Patient status changed:', data);
    callbacks.onPatientStatusChanged?.(data);
  });

  socket.on('staffAssignmentChanged', (data) => {
    console.log('Staff assignment changed:', data);
    callbacks.onStaffAssignmentChanged?.(data);
  });

  // Emergency events
  socket.on('emergencyAlert', (data) => {
    console.log('Emergency alert:', data);
    callbacks.onEmergencyAlert?.(data);
  });

  // System events
  socket.on('systemNotification', (notification) => {
    console.log('System notification:', notification);
    callbacks.onSystemNotification?.(notification);
  });

  socket.on('departmentNotification', (notification) => {
    console.log('Department notification:', notification);
    callbacks.onDepartmentNotification?.(notification);
  });

  socket.on('roleNotification', (notification) => {
    console.log('Role notification:', notification);
    callbacks.onRoleNotification?.(notification);
  });
};

// Socket utility functions
export const joinPatientRoom = (socket, patientId) => {
  if (socket) {
    socket.emit('joinPatientRoom', patientId);
  }
};

export const leavePatientRoom = (socket, patientId) => {
  if (socket) {
    socket.emit('leavePatientRoom', patientId);
  }
};

export const joinAlertRoom = (socket, alertId) => {
  if (socket) {
    socket.emit('joinAlertRoom', alertId);
  }
};

export const leaveAlertRoom = (socket, alertId) => {
  if (socket) {
    socket.emit('leaveAlertRoom', alertId);
  }
};

export const emitVitalSignsUpdate = (socket, patientId, vitalSigns) => {
  if (socket) {
    socket.emit('vitalSignsUpdate', { patientId, vitalSigns });
  }
};

export const emitAlertAcknowledge = (socket, alertId, notes) => {
  if (socket) {
    socket.emit('acknowledgeAlert', { alertId, notes });
  }
};

export const emitAlertResolve = (socket, alertId, resolutionNotes) => {
  if (socket) {
    socket.emit('resolveAlert', { alertId, resolutionNotes });
  }
};

export const emitEmergencyAlert = (socket, patientId, alertType, message, priority) => {
  if (socket) {
    socket.emit('emergencyAlert', {
      patientId,
      alertType,
      message,
      priority
    });
  }
};

