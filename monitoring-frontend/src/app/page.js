'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PatientCard from '@/components/PatientCard';
import AlertCard from '@/components/AlertCard';
import TrendChart from '@/components/TrendChart';
import { api } from '@/lib/api';
import { 
  LuActivity as Activity,
  LuAlertTriangle as AlertTriangle,
  LuUsers as Users,
  LuHeart as Heart,
  LuThermometer as Thermometer,
  LuDroplets as Droplets,
  LuTrendingUp as TrendingUp,
  LuClock as Clock
} from 'react-icons/lu';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAlerts: 0,
    criticalPatients: 0,
    avgVitalSigns: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time updates
      socket.on('newAlert', (alert) => {
        setAlerts(prev => [alert, ...prev]);
        setStats(prev => ({
          ...prev,
          activeAlerts: prev.activeAlerts + 1
        }));
      });

      socket.on('alertResolved', (alert) => {
        setAlerts(prev => prev.filter(a => a._id !== alert._id));
        setStats(prev => ({
          ...prev,
          activeAlerts: Math.max(0, prev.activeAlerts - 1)
        }));
      });

      socket.on('vitalSignsUpdated', (data) => {
        setPatients(prev => prev.map(patient => 
          patient._id === data.patientId 
            ? { ...patient, latestVitalSigns: data.vitalSigns }
            : patient
        ));
      });

      return () => {
        socket.off('newAlert');
        socket.off('alertResolved');
        socket.off('vitalSignsUpdated');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [patientsRes, alertsRes] = await Promise.all([
        api.get('/patients?limit=20'),
        api.get('/alerts/active')
      ]);

      setPatients(patientsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);

      // Calculate stats
      const totalPatients = patientsRes.data.data?.length || 0;
      const activeAlerts = alertsRes.data.data?.length || 0;
      const criticalPatients = patientsRes.data.data?.filter(p => 
        p.roomInfo?.status === 'Critical'
      ).length || 0;

      setStats({
        totalPatients,
        activeAlerts,
        criticalPatients,
        avgVitalSigns: {}
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            SentiCare Monitoring System
          </h1>
          <p className="text-gray-600 mb-8">
            Please log in to access the monitoring dashboard
          </p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 ml-64">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.firstName}. Monitor patient status and alerts in real-time.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.criticalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patients Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Patient Monitoring
                  </h2>
                </div>
                <div className="p-6">
                  {patients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patients.map((patient) => (
                        <PatientCard key={patient._id} patient={patient} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No patients found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Active Alerts
                  </h2>
                </div>
                <div className="p-6">
                  {alerts.length > 0 ? (
                    <div className="space-y-4">
                      {alerts.slice(0, 5).map((alert) => (
                        <AlertCard key={alert._id} alert={alert} />
                      ))}
                      {alerts.length > 5 && (
                        <a
                          href="/alerts"
                          className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View all {alerts.length} alerts
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No active alerts</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Vital Signs Trends
                </h2>
              </div>
              <div className="p-6">
                <TrendChart data={patients} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
