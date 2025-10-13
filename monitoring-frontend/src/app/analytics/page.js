'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import TrendChart from '@/components/TrendChart';
import { api } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function AnalyticsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients?limit=50');
      setPatients(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch analytics data', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Vitals trends and alert overview</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-4">
              <TrendChart data={patients} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


