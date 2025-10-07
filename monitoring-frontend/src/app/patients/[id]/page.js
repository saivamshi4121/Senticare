'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import { useSocket } from '@/contexts/SocketContext';
import {
  LuUsers as Users,
  LuHeart as Heart,
  LuThermometer as Thermometer,
  LuActivity as Activity,
  LuDroplets as Droplets,
  LuMapPin as MapPin
} from 'react-icons/lu';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { joinPatientRoom, leavePatientRoom } = useSocket();

  useEffect(() => {
    if (patientId) {
      fetchPatient();
      joinPatientRoom(patientId);
      return () => leavePatientRoom(patientId);
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/${patientId}`);
      setPatient(res.data.data);
    } catch (e) {
      console.error('Failed to fetch patient', e);
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
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : !patient ? (
            <div className="text-center text-gray-500 py-20">Patient not found</div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <p className="text-gray-600">ID: {patient.patientId}</p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  Room {patient.roomInfo?.roomNumber}
                  {patient.roomInfo?.bedNumber && ` - Bed ${patient.roomInfo.bedNumber}`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <h2 className="font-semibold mb-3">Vital Signs</h2>
                  {patient.vitalSigns?.length ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{patient.vitalSigns[patient.vitalSigns.length - 1]?.temperature}°C</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{patient.vitalSigns[patient.vitalSigns.length - 1]?.heartRate} bpm</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-gray-400 mr-2" />
                        <span>
                          {patient.vitalSigns[patient.vitalSigns.length - 1]?.bloodPressure?.systolic}/
                          {patient.vitalSigns[patient.vitalSigns.length - 1]?.bloodPressure?.diastolic}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{patient.vitalSigns[patient.vitalSigns.length - 1]?.oxygenSaturation}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No vital signs recorded</p>
                  )}
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h2 className="font-semibold mb-3">Assigned Staff</h2>
                  {patient.assignedStaff?.length ? (
                    <div className="space-y-2">
                      {patient.assignedStaff.map(s => (
                        <div key={s._id} className="flex items-center justify-between">
                          <span>{s.firstName} {s.lastName}</span>
                          <span className="text-xs text-gray-500">{s.role}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No staff assigned</p>
                  )}
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h2 className="font-semibold mb-3">Notes</h2>
                  {patient.notes?.length ? (
                    <ul className="space-y-2 text-sm">
                      {patient.notes.slice(-5).reverse().map((n, i) => (
                        <li key={i} className="border-b pb-2">
                          <p className="text-gray-700">{n.content}</p>
                          <p className="text-gray-400 text-xs">{new Date(n.timestamp).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No notes</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


