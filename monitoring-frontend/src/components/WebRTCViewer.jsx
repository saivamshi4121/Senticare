'use client';

import { useState, useEffect, useRef } from 'react';
import { LuEye, LuEyeOff, LuUsers, LuCopy, LuRefreshCw } from 'react-icons/lu';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const WebRTCViewer = ({ roomId: propRoomId }) => {
  const [roomId, setRoomId] = useState(propRoomId || '');
  const [isViewing, setIsViewing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState(new Map());
  const [publishers, setPublishers] = useState([]);
  
  const videoRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Join room to view stream
  const joinRoom = () => {
    if (!roomId.trim()) {
      setError('Please enter a Room ID');
      return;
    }

    if (!socket || !isConnected) {
      setError('Socket not connected. Please wait and try again.');
      return;
    }

    setError(null);
    socket.emit('join-webrtc-room', roomId.toUpperCase(), (response) => {
      if (response.success) {
        setRoomId(response.roomId);
        setParticipantCount(response.participantCount);
        setIsViewing(true);
        toast.success(`Joined room ${response.roomId}`);
      } else {
        setError('Failed to join room');
        toast.error('Failed to join room');
      }
    });
  };

  // Leave room
  const leaveRoom = () => {
    if (roomId && socket && isConnected) {
      socket.emit('leave-webrtc-room', roomId);
    }

    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());
    setPublishers([]);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsViewing(false);
    setParticipantCount(0);
    toast.success('Left room');
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  // Create peer connection for receiving stream
  const createPeerConnection = (socketId, publisherId) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    
    // Handle incoming stream
    pc.ontrack = (event) => {
      console.log('Received remote stream:', event.streams[0]);
      setStream(event.streams[0]);
      
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          roomId,
          candidate: event.candidate,
          target: socketId
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Remove failed connection
        setPeerConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(socketId);
          return newMap;
        });
        
        // Remove publisher from list
        setPublishers(prev => prev.filter(p => p.socketId !== socketId));
      }
    };

    return pc;
  };

  // Handle incoming WebRTC events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserJoined = (data) => {
      console.log('Publisher joined:', data);
      setParticipantCount(prev => prev + 1);
      setPublishers(prev => [...prev, data]);
    };

    const handleUserLeft = (data) => {
      console.log('User left:', data);
      setParticipantCount(prev => Math.max(0, prev - 1));
      
      // Close peer connection
      const pc = peerConnections.get(data.socketId);
      if (pc) {
        pc.close();
        setPeerConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(data.socketId);
          return newMap;
        });
      }
      
      // Remove publisher from list
      setPublishers(prev => prev.filter(p => p.socketId !== data.socketId));
    };

    const handleOffer = async (data) => {
      console.log('Received offer from:', data.fromUserId);
      
      const pc = createPeerConnection(data.from, data.fromUserId);
      setPeerConnections(prev => new Map(prev).set(data.from, pc));

      try {
        await pc.setRemoteDescription(data.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
          roomId,
          answer,
          target: data.from
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        setError('Failed to establish connection');
      }
    };

    const handleIceCandidate = (data) => {
      const pc = peerConnections.get(data.from);
      if (pc) {
        pc.addIceCandidate(data.candidate).catch(err => 
          console.error('Error adding ICE candidate:', err)
        );
      }
    };

    socket.on('webrtc-user-joined', handleUserJoined);
    socket.on('webrtc-user-left', handleUserLeft);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    return () => {
      if (socket) {
        socket.off('webrtc-user-joined', handleUserJoined);
        socket.off('webrtc-user-left', handleUserLeft);
        socket.off('webrtc-offer', handleOffer);
        socket.off('webrtc-ice-candidate', handleIceCandidate);
      }
    };
  }, [socket, isConnected, roomId, peerConnections]);

  // Auto-join if roomId is provided as prop
  useEffect(() => {
    if (propRoomId && !isViewing && socket && isConnected) {
      setRoomId(propRoomId);
      setTimeout(() => joinRoom(), 1000); // Small delay to ensure socket is ready
    }
  }, [propRoomId, socket, isConnected]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <LuEye className="h-5 w-5 mr-2" />
            View Camera Stream
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Watch live camera feeds from medical staff
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <LuUsers className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Room Input */}
      {!isViewing && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter Room ID"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={joinRoom}
              disabled={!socket || !isConnected}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuEye className="h-4 w-4 mr-2" />
              {!socket || !isConnected ? 'Connecting...' : 'Join'}
            </button>
          </div>
        </div>
      )}

      {/* Video Display */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-64 object-cover"
        />
        {!isViewing && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center text-white">
              <LuEyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Stream will appear here when joined</p>
            </div>
          </div>
        )}
        {isViewing && !stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center text-white">
              <LuRefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Connecting to stream...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Room Info */}
      {isViewing && roomId && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Connected to Room</p>
              <p className="text-lg font-mono text-green-700">{roomId}</p>
            </div>
            <button
              onClick={copyRoomId}
              className="flex items-center px-2 py-1 text-sm text-green-600 hover:text-green-800"
            >
              <LuCopy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Publishers List */}
      {publishers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-2">Active Publishers:</p>
          <div className="space-y-1">
            {publishers.map((publisher, index) => (
              <div key={publisher.socketId} className="text-sm text-blue-700">
                {index + 1}. {publisher.userRole} (ID: {publisher.userId.slice(-8)})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-3">
        {!isViewing ? (
          <button
            onClick={joinRoom}
            disabled={!roomId.trim() || !socket || !isConnected}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuEye className="h-4 w-4 mr-2" />
            {!socket || !isConnected ? 'Connecting...' : 'Join Room'}
          </button>
        ) : (
          <button
            onClick={leaveRoom}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <LuEyeOff className="h-4 w-4 mr-2" />
            Leave Room
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Get a Room ID from a publisher</li>
          <li>2. Enter the Room ID and click "Join Room"</li>
          <li>3. Wait for the stream to connect</li>
          <li>4. Multiple publishers can share the same room</li>
        </ol>
      </div>
    </div>
  );
};

export default WebRTCViewer;
