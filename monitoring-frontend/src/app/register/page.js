'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Nurse',
    department: 'General',
    employeeId: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.success) {
      toast.success('Registration successful');
      window.location.href = '/';
    } else {
      toast.error(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-600 mb-6">Register to access SentiCare</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input name="firstName" value={form.firstName} onChange={onChange} required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={onChange} required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select name="role" value={form.role} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <option>Admin</option>
              <option>Doctor</option>
              <option>Nurse</option>
              <option>Technician</option>
              <option>Receptionist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input name="department" value={form.department} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input name="employeeId" value={form.employeeId} onChange={onChange} required className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" value={form.phone} onChange={onChange} className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
          <div className="md:col-span-2 text-center text-sm text-gray-600">
            Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800">Log in</a>
          </div>
        </form>
      </div>
    </div>
  );
}


