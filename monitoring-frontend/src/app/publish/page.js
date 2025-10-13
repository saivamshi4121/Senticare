'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import WebRTCPublisher from '@/components/WebRTCPublisher';
import Navbar from '@/components/Navbar';

export default function PublishPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
              Publish Camera Feed
            </h1>
            <p className="mt-2 text-gray-600">
              Share your camera with medical staff for remote monitoring
            </p>
          </div>

          <WebRTCPublisher />

          {/* Additional Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Camera access requires HTTPS in production</li>
              <li>• Share the Room ID or link with authorized viewers only</li>
              <li>• Multiple viewers can watch the same stream</li>
              <li>• Ensure good lighting and stable internet connection</li>
              <li>• Stop streaming when not needed to preserve bandwidth</li>
            </ul>
          </div>

          {/* Technical Requirements */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-900 mb-3">
              Browser Requirements
            </h3>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>• Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)</li>
              <li>• Camera and microphone permissions granted</li>
              <li>• Stable internet connection (minimum 1 Mbps upload)</li>
              <li>• HTTPS connection required for camera access</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
