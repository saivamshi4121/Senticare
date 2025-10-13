'use client';

import { useEffect, useRef, useState } from 'react';

export default function LocalCamera({ title = 'Local Camera' }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (cams.length && !deviceId) setDeviceId(cams[0].deviceId || '');
      } catch (e) {
        setError(e?.message || 'Could not enumerate devices');
      }
    })();
  }, []);

  const start = async () => {
    try {
      setError('');
      stop();
      const constraints = {
        audio: false,
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e) {
      setError(e?.name === 'NotAllowedError' ? 'Camera permission denied' : (e?.message || 'Camera error'));
      setActive(false);
    }
  };

  const stop = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          >
            {devices.map(d => (
              <option key={d.deviceId || d.label} value={d.deviceId}>{d.label || 'Camera'}</option>
            ))}
          </select>
          {!active ? (
            <button onClick={start} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">Start</button>
          ) : (
            <button onClick={stop} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Stop</button>
          )}
        </div>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} playsInline muted className="w-full h-[240px] object-cover" />
      </div>
    </div>
  );
}


