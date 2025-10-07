'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

export default function TrendChart({ data }) {
  const chartData = useMemo(() => {
    return (data || []).map((patient) => {
      const latest = patient.vitalSigns?.[patient.vitalSigns.length - 1];
      return {
        name: `${patient.firstName} ${patient.lastName}`,
        time: latest ? format(new Date(latest.timestamp), 'HH:mm') : '-',
        heartRate: latest?.heartRate || 0,
        temperature: latest?.temperature || 0,
        oxygenSaturation: latest?.oxygenSaturation || 0,
      };
    });
  }, [data]);

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="temperature" stroke="#3b82f6" name="Temperature" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="oxygenSaturation" stroke="#10b981" name="O2 Saturation" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


