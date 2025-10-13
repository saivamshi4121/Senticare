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
      <div className="min-h-screen bg-white">
        {/* Public Landing Page */}
        <header className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white pointer-events-none" />
          <nav className="container flex items-center justify-between py-6 relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">S</div>
              <span className="text-lg font-semibold text-gray-900">SentiCare</span>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how" className="text-gray-600 hover:text-gray-900">How it works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
              <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Get started</a>
            </div>
          </nav>

          {/* Hero */}
          <section className="container relative z-10 pt-10 pb-16 sm:pt-16 sm:pb-20">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  Live hospital monitoring
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                  Real‑time Patient Monitoring for Modern Hospitals
                </h1>
                <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl">
                  SentiCare centralizes vital signs, alerts, and staff coordination in a single, secure platform—so your teams can act faster and deliver better care.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href="/register" className="inline-flex justify-center items-center px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">
                    Start free trial
                  </a>
                  <a href="/login" className="inline-flex justify-center items-center px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
                    View live demo
                  </a>
                </div>
                <div className="mt-6 flex items-center gap-6 text-xs text-gray-500">
                  <div>
                    <span className="block text-gray-900 font-semibold">99.9% uptime</span>
                    Enterprise‑grade security
                  </div>
                  <div>
                    <span className="block text-gray-900 font-semibold">HIPAA-ready</span>
                    Role‑based access
                  </div>
                </div>
              </div>
              <div className="lg:pl-8">
                <div className="relative rounded-xl border border-gray-200 shadow-sm bg-white p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-600">Active Alerts</p>
                      <p className="mt-1 text-3xl font-bold text-blue-700">24</p>
                      <p className="mt-1 text-xs text-blue-700">+3 in the last hour</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50">
                      <p className="text-sm text-gray-600">Critical Patients</p>
                      <p className="mt-1 text-3xl font-bold text-green-700">8</p>
                      <p className="mt-1 text-xs text-green-700">Stable trend</p>
                    </div>
                    <div className="col-span-2 p-4 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">Live vital trends</p>
                      <div className="h-24 mt-2 rounded-md bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100" />
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-gray-500">Sample data for illustration</div>
                </div>
              </div>
            </div>
          </section>
        </header>

        {/* Features */}
        <section id="features" className="container py-12 sm:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything your clinical teams need</h2>
            <p className="mt-3 text-gray-600">From ICU command centers to ward stations, SentiCare brings actionable insights to every screen.</p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Real‑time Alerts</h3>
                <p className="mt-1 text-sm text-gray-600">Critical thresholds trigger instant, role‑aware notifications with escalation.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Patient 360°</h3>
                <p className="mt-1 text-sm text-gray-600">Unified view of vitals, notes, and assignments for faster rounding.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Team Coordination</h3>
                <p className="mt-1 text-sm text-gray-600">Assign, acknowledge, and resolve tasks with full auditability.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Security & Roles</h3>
                <p className="mt-1 text-sm text-gray-600">Granular RBAC controls for Admin, Doctor, Nurse, and more.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="mt-1 text-sm text-gray-600">Trend dashboards highlight units and patients that need attention.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900">Simple Integration</h3>
                <p className="mt-1 text-sm text-gray-600">Modern API and socket‑based updates; deploy on‑prem or cloud.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-10">
          <div className="card">
            <div className="card-body flex flex-col lg:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Ready to modernize your monitoring?</h3>
                <p className="text-gray-600">Start a free pilot in minutes. No credit card required.</p>
              </div>
              <div className="flex gap-3">
                <a href="/register" className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Get started</a>
                <a href="/login" className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">View demo</a>
              </div>
            </div>
          </div>
        </section>

        <footer className="container py-10 text-xs text-gray-500">
          © {new Date().getFullYear()} SentiCare. All rights reserved.
        </footer>
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
