'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PatientCard from '@/components/PatientCard';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function PatientsIndexPage() {
  const { isAuthenticated } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchPatients();
  }, [isAuthenticated]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients?limit=50');
      setPatients(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch patients', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Patients</h1>
          <p className="text-gray-600 mb-6">Please log in to view patients.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600">Browse and open a patient for details</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p) => (
                <Link key={p._id} href={`/patients/${p._id}`}> 
                  <PatientCard patient={p} />
                </Link>
              ))}
              {patients.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">No patients</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


