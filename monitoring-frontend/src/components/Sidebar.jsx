'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LuLayoutDashboard as LayoutDashboard,
  LuUsers as Users,
  LuAlertTriangle as AlertTriangle,
  LuUserCheck as UserCheck,
  LuSettings as Settings,
  LuActivity as Activity,
  LuCamera as Camera,
  LuBarChart3 as BarChart3
} from 'react-icons/lu';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Staff', href: '/staff', icon: UserCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const secondaryNavigation = [
  { name: 'Live Feeds', href: '/cameras', icon: Camera },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Navigation */}
          <div className="mt-8">
            <div className="px-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Additional
              </h3>
            </div>
            <nav className="mt-2 px-2 space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System Status */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">System Status</p>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

