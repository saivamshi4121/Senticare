'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LuUserCheck as UserCheck } from 'react-icons/lu';

export default function StaffPage() {
  const { user, isAuthenticated } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      fetchStaff();
    } else if (isAuthenticated) {
      setForbidden(true);
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setStaff(res.data.data || []);
    } catch (e) {
      if (e?.response?.status === 403) {
        setForbidden(true);
      }
      console.error('Failed to fetch staff', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff</h1>
          <p className="text-gray-600 mb-6">Please log in to view this page.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Login</a>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-gray-600">This page is restricted to Admin users.</p>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
              Staff
            </h1>
            <p className="text-gray-600">Manage and view staff members</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">All Staff</h2>
              </div>
              <div className="divide-y">
                {staff.map(s => (
                  <div key={s._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.firstName} {s.lastName}</p>
                      <p className="text-sm text-gray-500">{s.email}</p>
                    </div>
                    <div className="text-sm text-gray-600">{s.role}</div>
                  </div>
                ))}
                {staff.length === 0 && (
                  <div className="p-6 text-center text-gray-500">No staff found</div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


