'use client';

import { useState, useEffect, useRef } from 'react';
import { LuCamera, LuCameraOff, LuUsers, LuCopy, LuShare2 } from 'react-icons/lu';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const WebRTCPublisher = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [stream, setStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState(new Map());
  
  const videoRef = useRef(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  // Generate unique room ID
  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
    return id;
  };

  // Get available media devices
  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error getting media devices:', error);
      setError('Failed to get camera devices');
    }
  };

  // Start camera stream
  const startStream = async () => {
    try {
      setError(null);
      
      if (!socket || !isConnected) {
        setError('Socket not connected. Please wait and try again.');
        return;
      }
      
      const constraints = {
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Join WebRTC room
      const currentRoomId = roomId || generateRoomId();
      socket.emit('join-webrtc-room', currentRoomId, (response) => {
        if (response.success) {
          setRoomId(response.roomId);
          setParticipantCount(response.participantCount);
          setIsStreaming(true);
          toast.success(`Started streaming to room ${response.roomId}`);
        } else {
          setError('Failed to join room');
        }
      });

    } catch (error) {
      console.error('Error starting stream:', error);
      setError('Failed to access camera. Please check permissions.');
      toast.error('Failed to start camera');
    }
  };

  // Stop camera stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections(new Map());

    // Leave WebRTC room
    if (roomId && socket && isConnected) {
      socket.emit('leave-webrtc-room', roomId);
    }

    setIsStreaming(false);
    setParticipantCount(0);
    toast.success('Streaming stopped');
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard');
  };

  // Share room link
  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/view?room=${roomId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
  };

  // WebRTC peer connection setup
  const createPeerConnection = (socketId) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    
    // Add local stream tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    }

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

    return pc;
  };

  // Handle incoming WebRTC events
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserJoined = (data) => {
      setParticipantCount(prev => prev + 1);
      
      // Create offer for new user
      const pc = createPeerConnection(data.socketId);
      setPeerConnections(prev => new Map(prev).set(data.socketId, pc));

      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', {
          roomId,
          offer,
          target: data.socketId
        });
      });
    };

    const handleUserLeft = (data) => {
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
    };

    const handleAnswer = (data) => {
      const pc = peerConnections.get(data.from);
      if (pc) {
        pc.setRemoteDescription(data.answer);
      }
    };

    const handleIceCandidate = (data) => {
      const pc = peerConnections.get(data.from);
      if (pc) {
        pc.addIceCandidate(data.candidate);
      }
    };

    socket.on('webrtc-user-joined', handleUserJoined);
    socket.on('webrtc-user-left', handleUserLeft);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    return () => {
      if (socket) {
        socket.off('webrtc-user-joined', handleUserJoined);
        socket.off('webrtc-user-left', handleUserLeft);
        socket.off('webrtc-answer', handleAnswer);
        socket.off('webrtc-ice-candidate', handleIceCandidate);
      }
    };
  }, [socket, isConnected, roomId, stream, peerConnections]);

  // Load devices on mount
  useEffect(() => {
    getMediaDevices();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <LuCamera className="h-5 w-5 mr-2" />
            Publish Camera
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Share your camera feed with medical staff
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
              {participantCount} viewer{participantCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Camera Selection */}
      {!isStreaming && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Camera Device
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {devices.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Video Preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-64 object-cover"
        />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center text-white">
              <LuCameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Camera preview will appear here</p>
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

      {/* Room ID Display */}
      {roomId && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Room ID</p>
              <p className="text-lg font-mono text-blue-700">{roomId}</p>
            </div>
            <button
              onClick={copyRoomId}
              className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <LuCopy className="h-4 w-4 mr-1" />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-3">
        {!isStreaming ? (
          <button
            onClick={startStream}
            disabled={!socket || !isConnected}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuCamera className="h-4 w-4 mr-2" />
            {!socket || !isConnected ? 'Connecting...' : 'Start Publishing'}
          </button>
        ) : (
          <>
            <button
              onClick={stopStream}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LuCameraOff className="h-4 w-4 mr-2" />
              Stop Publishing
            </button>
            <button
              onClick={shareRoom}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <LuShare2 className="h-4 w-4 mr-2" />
              Share Link
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-900 mb-2">How to use:</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Select your camera device</li>
          <li>2. Click "Start Publishing" to begin streaming</li>
          <li>3. Share the Room ID or link with viewers</li>
          <li>4. Viewers can join using the Room ID at /view?room={roomId || 'ROOM_ID'}</li>
        </ol>
      </div>
    </div>
  );
};

export default WebRTCPublisher;
