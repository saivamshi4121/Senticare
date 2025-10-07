'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinPatientRoom = (patientId) => {
    if (socket) {
      socket.emit('joinPatientRoom', patientId);
    }
  };

  const leavePatientRoom = (patientId) => {
    if (socket) {
      socket.emit('leavePatientRoom', patientId);
    }
  };

  const joinAlertRoom = (alertId) => {
    if (socket) {
      socket.emit('joinAlertRoom', alertId);
    }
  };

  const leaveAlertRoom = (alertId) => {
    if (socket) {
      socket.emit('leaveAlertRoom', alertId);
    }
  };

  const emitVitalSignsUpdate = (patientId, vitalSigns) => {
    if (socket) {
      socket.emit('vitalSignsUpdate', { patientId, vitalSigns });
    }
  };

  const emitAlertAcknowledge = (alertId, notes) => {
    if (socket) {
      socket.emit('acknowledgeAlert', { alertId, notes });
    }
  };

  const emitAlertResolve = (alertId, resolutionNotes) => {
    if (socket) {
      socket.emit('resolveAlert', { alertId, resolutionNotes });
    }
  };

  const emitEmergencyAlert = (patientId, alertType, message, priority) => {
    if (socket) {
      socket.emit('emergencyAlert', {
        patientId,
        alertType,
        message,
        priority
      });
    }
  };

  const value = {
    socket,
    isConnected,
    joinPatientRoom,
    leavePatientRoom,
    joinAlertRoom,
    leaveAlertRoom,
    emitVitalSignsUpdate,
    emitAlertAcknowledge,
    emitAlertResolve,
    emitEmergencyAlert
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

