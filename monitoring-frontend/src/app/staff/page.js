'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { LuUserCheck as UserCheck } from 'react-icons/lu';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setStaff(res.data.data || []);
    } catch (e) {
      console.error('Failed to fetch staff', e);
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


