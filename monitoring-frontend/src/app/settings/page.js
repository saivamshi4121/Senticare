'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { LuSettings as Settings } from 'react-icons/lu';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    contactInfo: user?.contactInfo || {},
    preferences: user?.preferences || {},
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    await updateProfile(profile);
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) return;
    setSaving(true);
    await changePassword(passwords.currentPassword, passwords.newPassword);
    setSaving(false);
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="h-6 w-6 text-gray-700 mr-2" />
              Settings
            </h1>
            <p className="text-gray-600">Manage your profile and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-semibold mb-4">Profile</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={profile.contactInfo?.phone || ''}
                    onChange={(e) => setProfile({ ...profile, contactInfo: { ...profile.contactInfo, phone: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={profile.preferences?.theme || 'auto'}
                    onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, theme: e.target.value } })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="font-semibold mb-4">Security</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={saving}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-black disabled:opacity-50"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


