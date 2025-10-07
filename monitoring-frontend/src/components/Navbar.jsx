'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LuBell as Bell,
  LuUser as User,
  LuSettings as Settings,
  LuLogOut as LogOut,
  LuMenu as Menu,
  LuX as X,
  LuActivity as Activity,
  LuAlertTriangle as AlertTriangle
} from 'react-icons/lu';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                SentiCare
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-gray-700 font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500">{user?.role}</p>
                  </div>
                  <a
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <div className="flex items-center px-3 py-2 text-base font-medium text-gray-900">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">{user?.role}</p>
                </div>
              </div>
              <a
                href="/settings"
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

