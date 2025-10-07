'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AlertCard from '@/components/AlertCard';
import { api } from '@/lib/api';
import { LuAlertTriangle as AlertTriangle } from 'react-icons/lu';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/alerts');
      setAlerts(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (id) => {
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: 'Acknowledged' } : a));
  };

  const handleResolve = (id) => {
    setAlerts(prev => prev.filter(a => a._id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              Alerts
            </h1>
            <p className="text-gray-600">Manage active and historical alerts</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map(alert => (
                <AlertCard key={alert._id} alert={alert} onAcknowledge={handleAcknowledge} onResolve={handleResolve} />
              ))}
              {alerts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">No alerts</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


