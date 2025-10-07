'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LuHeart as Heart,
  LuThermometer as Thermometer,
  LuDroplets as Droplets,
  LuActivity as Activity,
  LuAlertTriangle as AlertTriangle,
  LuUser as User,
  LuMapPin as MapPin,
  LuClock as Clock,
  LuChevronRight as ChevronRight
} from 'react-icons/lu';
import { format } from 'date-fns';

export default function PatientCard({ patient }) {
  const [vitalSigns, setVitalSigns] = useState(null);
  const [statusColor, setStatusColor] = useState('green');

  useEffect(() => {
    if (patient.vitalSigns && patient.vitalSigns.length > 0) {
      const latest = patient.vitalSigns[patient.vitalSigns.length - 1];
      setVitalSigns(latest);
    }
  }, [patient.vitalSigns]);

  useEffect(() => {
    // Determine status color based on patient status and vital signs
    if (patient.roomInfo?.status === 'Critical') {
      setStatusColor('red');
    } else if (patient.roomInfo?.status === 'Active' && vitalSigns) {
      // Check for critical vital signs
      if (vitalSigns.temperature > 39 || vitalSigns.temperature < 35) {
        setStatusColor('red');
      } else if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50) {
        setStatusColor('orange');
      } else if (vitalSigns.oxygenSaturation < 90) {
        setStatusColor('red');
      } else {
        setStatusColor('green');
      }
    } else {
      setStatusColor('gray');
    }
  }, [patient.roomInfo?.status, vitalSigns]);

  const getStatusColor = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || colors.gray;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: 'text-red-600',
      High: 'text-orange-600',
      Medium: 'text-yellow-600',
      Low: 'text-green-600'
    };
    return colors[priority] || colors.Low;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-xs text-gray-500">ID: {patient.patientId}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(statusColor)}`}>
            {patient.roomInfo?.status || 'Unknown'}
          </span>
        </div>

        {/* Room Info */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <MapPin className="h-3 w-3 mr-1" />
          Room {patient.roomInfo?.roomNumber}
          {patient.roomInfo?.bedNumber && ` - Bed ${patient.roomInfo.bedNumber}`}
        </div>

        {/* Vital Signs */}
        {vitalSigns && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center">
              <Thermometer className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Temp</p>
                <p className="text-sm font-medium">{vitalSigns.temperature}°C</p>
              </div>
            </div>
            <div className="flex items-center">
              <Heart className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Heart Rate</p>
                <p className="text-sm font-medium">{vitalSigns.heartRate} bpm</p>
              </div>
            </div>
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">BP</p>
                <p className="text-sm font-medium">
                  {vitalSigns.bloodPressure?.systolic}/{vitalSigns.bloodPressure?.diastolic}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Droplets className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">O2 Sat</p>
                <p className="text-sm font-medium">{vitalSigns.oxygenSaturation}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Last Update */}
        {vitalSigns && (
          <div className="flex items-center text-xs text-gray-400 mb-3">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {format(new Date(vitalSigns.timestamp), 'MMM d, HH:mm')}
          </div>
        )}

        {/* Alerts */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">Active Alerts</span>
            </div>
            <div className="space-y-1">
              {patient.alerts.slice(0, 2).map((alert) => (
                <div key={alert._id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 truncate">{alert.title}</span>
                  <span className={`text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                </div>
              ))}
              {patient.alerts.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{patient.alerts.length - 2} more alerts
                </p>
              )}
            </div>
          </div>
        )}

        {/* Assigned Staff */}
        {patient.assignedStaff && patient.assignedStaff.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-700 mb-1">Assigned Staff</p>
            <div className="flex flex-wrap gap-1">
              {patient.assignedStaff.slice(0, 3).map((staff) => (
                <span
                  key={staff._id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                >
                  {staff.firstName} {staff.lastName}
                </span>
              ))}
              {patient.assignedStaff.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-50 text-gray-700">
                  +{patient.assignedStaff.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <Link
            href={`/patients/${patient._id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

