'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCViewer from '@/components/WebRTCViewer';
import Navbar from '@/components/Navbar';

function ViewPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const room = searchParams.get('room');
    if (room) {
      setRoomId(room);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              View Camera Stream
            </h1>
            <p className="mt-2 text-gray-600">
              Watch live camera feeds from medical staff
            </p>
          </div>

          <WebRTCViewer roomId={roomId} />

          {/* Stream Quality Info */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-900 mb-3">
              Stream Quality Tips
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Ensure stable internet connection for best quality</li>
              <li>• Close unnecessary browser tabs to free up bandwidth</li>
              <li>• Use Chrome or Firefox for optimal WebRTC performance</li>
              <li>• Refresh the page if connection issues persist</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Troubleshooting
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>No stream appearing?</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Check if the Room ID is correct</li>
                  <li>• Ensure someone is actively publishing</li>
                  <li>• Wait a few seconds for connection to establish</li>
                </ul>
              </div>
              <div>
                <strong>Poor video quality?</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Check your internet connection speed</li>
                  <li>• Try refreshing the page</li>
                  <li>• Close other bandwidth-heavy applications</li>
                </ul>
              </div>
              <div>
                <strong>Connection keeps dropping?</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Check firewall settings</li>
                  <li>• Try using a different browser</li>
                  <li>• Ensure you&apos;re on a stable network</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-3">
              Security Notice
            </h3>
            <p className="text-sm text-red-800">
              Only join camera streams from trusted medical staff. Do not share 
              Room IDs with unauthorized personnel. All camera access is logged 
              for security and compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ViewPageContent />
    </Suspense>
  );
}
