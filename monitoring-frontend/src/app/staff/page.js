'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LuUserCheck as UserCheck, LuPlus as Plus, LuUserPlus as UserPlus, LuX as X } from 'react-icons/lu';
import { toast } from 'react-hot-toast';

export default function StaffPage() {
  const { user, isAuthenticated } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Nurse',
    department: 'General',
    employeeId: '',
    phone: ''
  });
  const [creating, setCreating] = useState(false);

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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const res = await api.post('/auth/register', newUserForm);
      if (res.data.success) {
        toast.success('User created successfully!');
        setShowAddModal(false);
        setNewUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'Nurse',
          department: 'General',
          employeeId: '',
          phone: ''
        });
        fetchStaff(); // Refresh the staff list
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e) => {
    setNewUserForm({
      ...newUserForm,
      [e.target.name]: e.target.value
    });
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
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UserCheck className="h-6 w-6 text-blue-600 mr-2" />
                Staff Management
              </h1>
              <p className="text-gray-600">Manage and view staff members</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h2 className="font-semibold">All Staff ({staff.length})</h2>
              </div>
              <div className="divide-y">
                {staff.map(s => (
                  <div key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                        <p className="text-sm text-gray-500">{s.email}</p>
                        <p className="text-xs text-gray-400">{s.employeeId} • {s.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        s.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                        s.role === 'Doctor' ? 'bg-blue-100 text-blue-800' :
                        s.role === 'Nurse' ? 'bg-green-100 text-green-800' :
                        s.role === 'Technician' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {s.role}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {staff.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p>No staff members found</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Add the first member
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <UserPlus className="h-5 w-5 text-blue-600 mr-2" />
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={newUserForm.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={newUserForm.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUserForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@senticare.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUserForm.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={newUserForm.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Technician">Technician</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={newUserForm.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ICU, Cardiology, Emergency"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={newUserForm.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP-XXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUserForm.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


