'use client';

import { LuCamera, LuEye, LuArrowRight, LuMonitor, LuSmartphone } from 'react-icons/lu';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import LocalCamera from '@/components/LocalCamera';
import Link from 'next/link';

export default function CamerasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Live Camera Feeds</h1>
            <p className="text-gray-600 mt-2">Share and view live camera streams for remote monitoring and consultations.</p>
          </div>

          {/* Main WebRTC Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Link 
              href="/publish" 
              className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-8 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-400 bg-opacity-20 p-3 rounded-lg">
                    <LuCamera className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold">Publish Camera</h3>
                    <p className="text-blue-100 mt-1">Share your device camera</p>
                  </div>
                </div>
                <LuArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-blue-100 mb-4">
                Start streaming from your phone, laptop, or tablet. Generate a Room ID that others can use to view your camera feed.
              </p>
              <div className="flex items-center text-blue-200 text-sm">
                <LuSmartphone className="h-4 w-4 mr-2" />
                <span>Works on any device with a camera</span>
              </div>
            </Link>

            <Link 
              href="/view" 
              className="group bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-8 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-400 bg-opacity-20 p-3 rounded-lg">
                    <LuEye className="h-8 w-8" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold">View Streams</h3>
                    <p className="text-green-100 mt-1">Watch live camera feeds</p>
                  </div>
                </div>
                <LuArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-green-100 mb-4">
                Enter a Room ID to watch live camera streams from medical staff. Perfect for remote consultations and monitoring.
              </p>
              <div className="flex items-center text-green-200 text-sm">
                <LuMonitor className="h-4 w-4 mr-2" />
                <span>Multiple viewers can watch simultaneously</span>
              </div>
            </Link>
          </div>

          {/* Local Camera Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <LuCamera className="h-5 w-5 mr-2" />
                  Local Camera Preview
                </h2>
                <p className="text-gray-600 mt-1">
                  Test your camera before publishing a stream
                </p>
              </div>
            </div>
            <LocalCamera />
          </div>

          {/* Instructions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <LuCamera className="h-5 w-5 mr-2" />
                For Publishers
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. Click &quot;Publish Camera&quot; to start streaming</li>
                <li>2. Allow camera and microphone access</li>
                <li>3. Share the generated Room ID with viewers</li>
                <li>4. Keep the tab open while streaming</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                <LuEye className="h-5 w-5 mr-2" />
                For Viewers
              </h3>
              <ol className="space-y-2 text-sm text-green-800">
                <li>1. Get a Room ID from a publisher</li>
                <li>2. Click &quot;View Streams&quot; and enter the Room ID</li>
                <li>3. Wait for the stream to connect</li>
                <li>4. Multiple viewers can watch the same stream</li>
              </ol>
            </div>
          </div>

          {/* Technical Requirements */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              System Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div>
                <strong>Browser Support:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Chrome, Firefox, Safari, Edge</li>
                  <li>• WebRTC support required</li>
                  <li>• Camera/microphone permissions</li>
                </ul>
              </div>
              <div>
                <strong>Network:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• Stable internet connection</li>
                  <li>• HTTPS required for camera access</li>
                  <li>• Minimum 1 Mbps upload speed</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


