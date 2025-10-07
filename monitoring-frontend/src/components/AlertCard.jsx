'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LuAlertTriangle as AlertTriangle,
  LuClock as Clock,
  LuUser as User,
  LuChevronRight as ChevronRight,
  LuCheckCircle2 as CheckCircle2
} from 'react-icons/lu';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';

export default function AlertCard({ alert, onAcknowledge, onResolve }) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const update = () => setRelativeTime(formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [mounted, alert.createdAt]);

  const handleAcknowledge = async () => {
    try {
      setLoading(true);
      await api.patch(`/alerts/${alert._id}/acknowledge`, { notes: 'Acknowledged from dashboard' });
      onAcknowledge?.(alert._id);
    } catch (error) {
      console.error('Acknowledge failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setLoading(true);
      await api.patch(`/alerts/${alert._id}/resolve`, { resolutionNotes: 'Resolved from dashboard' });
      onResolve?.(alert._id);
    } catch (error) {
      console.error('Resolve failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  }[alert.priority] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900">{alert.title}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor}`}>
                {alert.priority}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
            <div className="flex items-center text-xs text-gray-500 gap-4">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {mounted ? relativeTime : ''}
              </span>
              {alert.patient && (
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  <Link href={`/patients/${alert.patient._id || alert.patient}`} className="text-blue-600 hover:text-blue-800">
                    Patient
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
        <Link href={`/alerts/${alert._id}`} className="text-gray-400 hover:text-gray-600">
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleAcknowledge}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Acknowledge
        </button>
        <button
          onClick={handleResolve}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Resolve
        </button>
      </div>
    </div>
  );
}


