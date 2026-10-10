import React, { useState, useEffect } from 'react';
import { CurrentVehicleState } from '../types/vals';
import {
  Activity,
  Radio,
  Gauge,
  Zap,
  Battery,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  RotateCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Car,
  Crosshair,
} from 'lucide-react';

interface Props {
  vehicleStates: CurrentVehicleState[];
  onRefresh: () => void;
  onSelectVehicle?: (vehId: string) => void;
}

export const LiveOperationsView: React.FC<Props> = ({ vehicleStates, onRefresh }) => {
  const [selectedVehId, setSelectedVehId] = useState<string>(vehicleStates[0]?.vehicleId || '');
  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [isSimulatingStep, setIsSimulatingStep] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'idle' | 'alerts'>('all');
  const [simMessage, setSimMessage] = useState<string>('');

  const selectedVehicle = vehicleStates.find(v => v.vehicleId === selectedVehId) || vehicleStates[0];

  // Auto-simulation interval
  useEffect(() => {
    let interval: any;
    if (autoSimulate) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/telemetry/simulate-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vehicleId: selectedVehId || 'VEH-ROW-001' }),
          });
          if (res.ok) {
            onRefresh();
          }
        } catch (err) {
          console.error('Auto-sim step failed', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [autoSimulate, selectedVehId, onRefresh]);

  const handleStepSimulation = async () => {
    setIsSimulatingStep(true);
    setSimMessage('');
    try {
      const res = await fetch('/api/telemetry/simulate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: selectedVehicle?.vehicleId }),
      });
      if (res.ok) {
        setSimMessage(`Injected new telemetry point for ${selectedVehicle.regNumber}`);
        onRefresh();
      }
    } catch (err: any) {
      setSimMessage(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulatingStep(false);
    }
  };

  const filteredVehicles = vehicleStates.filter(v => {
    if (filterStatus === 'online') return v.onlineStatus === 'online';
    if (filterStatus === 'idle') return v.onlineStatus === 'idle';
    if (filterStatus === 'alerts') return v.activeAlerts.length > 0;
    return true;
  });

  // Projection helper for Pakistan region:
  // Lat: 24.0 (Karachi south) to 34.5 (Peshawar / Margalla north) -> Y (height 550)
  // Lon: 66.5 (Gwadar / Karachi west) to 75.0 (Lahore / Kashmir east) -> X (width 850)
  const projectCoords = (lat: number, lon: number) => {
    const minLat = 24.0;
    const maxLat = 34.5;
    const minLon = 66.5;
    const maxLon = 75.0;

    const x = ((lon - minLon) / (maxLon - minLon)) * 750 + 50;
    const y = 520 - ((lat - minLat) / (maxLat - minLat)) * 460;
    return { x: Math.max(30, Math.min(820, x)), y: Math.max(30, Math.min(520, y)) };
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Zone */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>National Operations Center (NOC)</span>
              <span aria-hidden="true">·</span>
              <span>24/7 Telematics Pipeline</span>
              <span aria-hidden="true">·</span>
              <span>Active GPS Feed</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Live Fleet Command &amp; Realtime Telemetry
            </h2>
          </div>

          {/* Quick Simulation & Feed Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleStepSimulation}
              disabled={isSimulatingStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSimulatingStep ? 'animate-spin' : ''}`} />
              <span>Step Telemetry</span>
            </button>

            <button
              onClick={() => setAutoSimulate(!autoSimulate)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                autoSimulate
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {autoSimulate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoSimulate ? 'Pause Auto Feed' : 'Start Live GPS Stream'}</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {simMessage && (
          <div className="mt-2 text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">
            {simMessage}
          </div>
        )}
      </div>

      {/* Main Grid: Left Fleet List & Map Center + Right Telemetry Telemetry Gauges */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left Column: Fleet List (3 cols) */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-3 flex flex-col h-[650px] shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tracked Fleet ({filteredVehicles.length})
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-[11px]">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterStatus === 'all' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('online')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterStatus === 'online' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600'}`}
              >
                Online
              </button>
              <button
                onClick={() => setFilterStatus('alerts')}
                className={`px-2 py-0.5 rounded cursor-pointer ${filterStatus === 'alerts' ? 'bg-white shadow-xs font-semibold text-slate-900' : 'text-slate-600'}`}
              >
                Alerts
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredVehicles.map(veh => {
              const isSelected = selectedVehicle?.vehicleId === veh.vehicleId;
              const hasAlert = veh.activeAlerts.length > 0;

              return (
                <div
                  key={veh.vehicleId}
                  onClick={() => setSelectedVehId(veh.vehicleId)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                      {veh.regNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        veh.onlineStatus === 'online'
                          ? 'text-emerald-700'
                          : veh.onlineStatus === 'idle'
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          veh.onlineStatus === 'online'
                            ? 'bg-emerald-500 animate-pulse'
                            : veh.onlineStatus === 'idle'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {veh.onlineStatus === 'online' ? 'Moving' : veh.onlineStatus === 'idle' ? 'Idle' : 'Offline'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 truncate mt-0.5">
                    {veh.customerName}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-1 border-t border-slate-100">
                    <span className="font-mono tabular-nums font-medium text-slate-700">
                      {veh.speed} km/h
                    </span>
                    <span className="text-[11px]">
                      {veh.protocol} · {veh.ignition ? 'IGN ON' : 'IGN OFF'}
                    </span>
                  </div>

                  {hasAlert && (
                    <div className="mt-1.5 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span className="truncate">{veh.activeAlerts[0]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: High Precision Interactive Vector Map (6 cols) */}
        <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[650px] relative overflow-hidden shadow-xs">
          {/* Map Header Overlay */}
          <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>National Telematics Grid (Pakistan Corridor)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-emerald-400 font-medium">NOC Online</span>
          </div>

          {/* Interactive SVG Vector Map Canvas */}
          <div className="flex-1 w-full h-full relative">
            <svg
              viewBox="0 0 850 550"
              className="w-full h-full select-none"
              style={{ background: 'radial-gradient(ellipse at center, #111827 0%, #030712 100%)' }}
            >
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                </pattern>
                {/* Glow filter for active target */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Background */}
              <rect width="850" height="550" fill="url(#grid)" />

              {/* Simplified Pakistan National Highway Corridors */}
              <g stroke="rgba(59, 130, 246, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" fill="none">
                {/* Karachi -> Hyderabad -> Multan -> Lahore -> Rawalpindi/Islamabad corridor */}
                <path d="M 120 480 Q 220 420, 380 340 T 640 220 T 560 110" />
                {/* Indus Highway */}
                <path d="M 120 480 Q 180 380, 290 280 T 480 130" />
                {/* Lahore -> Faisalabad -> Multan */}
                <path d="M 640 220 L 520 250 L 380 340" />
              </g>

              {/* Major Cities / NOC Centers */}
              <g className="text-[10px] font-mono fill-slate-400">
                {/* Karachi HQ */}
                <circle cx="120" cy="480" r="4" fill="#3b82f6" />
                <text x="130" y="484" fill="#93c5fd" fontWeight="bold">Karachi (HQ/Port)</text>

                {/* Hyderabad */}
                <circle cx="210" cy="430" r="3" fill="#64748b" />
                <text x="218" y="434">Hyderabad M-9</text>

                {/* Sukkur */}
                <circle cx="280" cy="380" r="3" fill="#64748b" />
                <text x="288" y="384">Sukkur</text>

                {/* Multan */}
                <circle cx="430" cy="310" r="3" fill="#64748b" />
                <text x="438" y="314">Multan Hub</text>

                {/* Lahore */}
                <circle cx="640" cy="220" r="4" fill="#3b82f6" />
                <text x="650" y="224" fill="#93c5fd" fontWeight="bold">Lahore Regional</text>

                {/* Islamabad / Rawalpindi */}
                <circle cx="560" cy="110" r="4" fill="#3b82f6" />
                <text x="570" y="114" fill="#93c5fd" fontWeight="bold">Islamabad NOC</text>

                {/* Peshawar */}
                <circle cx="480" cy="110" r="3" fill="#64748b" />
                <text x="420" y="114">Peshawar</text>
              </g>

              {/* Vehicle Markers */}
              {vehicleStates.map(veh => {
                const pos = projectCoords(veh.lastLatitude, veh.lastLongitude);
                const isSelected = selectedVehicle?.vehicleId === veh.vehicleId;
                const hasAlert = veh.activeAlerts.length > 0;

                return (
                  <g
                    key={veh.vehicleId}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedVehId(veh.vehicleId)}
                    className="cursor-pointer transition-transform duration-300"
                    filter={isSelected ? 'url(#glow)' : undefined}
                  >
                    {/* Pulsing circle if active or alert */}
                    {isSelected && (
                      <circle
                        r="18"
                        fill="none"
                        stroke={hasAlert ? '#f43f5e' : '#3b82f6'}
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Outer Target Ring */}
                    <circle
                      r="12"
                      fill={isSelected ? '#1e3a8a' : '#0f172a'}
                      stroke={hasAlert ? '#f43f5e' : isSelected ? '#60a5fa' : '#475569'}
                      strokeWidth={isSelected ? '2' : '1.5'}
                    />

                    {/* Heading Pointer Arrow */}
                    <g transform={`rotate(${veh.heading})`}>
                      <polygon
                        points="0,-8 5,5 0,2 -5,5"
                        fill={hasAlert ? '#f43f5e' : isSelected ? '#38bdf8' : '#22c55e'}
                      />
                    </g>

                    {/* Registration Tag Label */}
                    <g transform="translate(14, -6)">
                      <rect
                        x="-2"
                        y="-10"
                        width="82"
                        height="18"
                        rx="4"
                        fill="#020617"
                        stroke={isSelected ? '#3b82f6' : '#334155'}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x="4"
                        y="3"
                        fill="#f8fafc"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        fontWeight="bold"
                      >
                        {veh.regNumber}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Footer Bar */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Moving</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Idle</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Active Alert</span>
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-400">
              Target: {selectedVehicle?.regNumber || 'None'} ({selectedVehicle?.lastLatitude.toFixed(4)}, {selectedVehicle?.lastLongitude.toFixed(4)})
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Gauge Dashboard & Controls (3 cols) */}
        <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-[650px] shadow-xs overflow-y-auto">
          {selectedVehicle ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vehicle Telemetry Card
                  </span>
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedVehicle.protocol}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-mono">
                  {selectedVehicle.regNumber}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedVehicle.customerName}
                </p>
              </div>

              {/* Active Alarms Section */}
              {selectedVehicle.activeAlerts.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>NOC Security Incident</span>
                  </div>
                  <ul className="text-xs text-rose-700 space-y-1">
                    {selectedVehicle.activeAlerts.map((alt, i) => (
                      <li key={i} className="font-mono font-medium">· {alt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-600" />
                    <span>Current Speed</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {selectedVehicle.speed} <span className="text-xs font-normal text-slate-500">km/h</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ignition State</span>
                  </div>
                  <div className={`text-base font-bold font-mono ${selectedVehicle.ignition ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {selectedVehicle.ignition ? 'ACC ON' : 'ACC OFF'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Backup Battery</span>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedVehicle.batteryVoltage} <span className="text-xs font-normal text-slate-500">V</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Heading Angle</span>
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedVehicle.heading}°
                  </div>
                </div>
              </div>

              {/* Hardware & Identity Linkage */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                  Assigned Hardware &amp; Cellular
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Device IMEI:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedVehicle.imei || 'Not assigned'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">SIM MSISDN:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedVehicle.simNumber || 'Not assigned'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Odometer:</span>
                  <span className="font-mono font-medium text-slate-800 tabular-nums">{selectedVehicle.odometer?.toLocaleString()} km</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Last Telemetry:</span>
                  <span className="font-mono text-slate-700">{new Date(selectedVehicle.lastUpdate).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Emergency NOC Remote Commands */}
              <div className="p-3 border border-slate-200 rounded-lg space-y-2 bg-white">
                <div className="text-xs font-bold text-slate-800">
                  Remote Command Console
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert(`Remote Engine Immobilizer command dispatched for ${selectedVehicle.regNumber}`)}
                    className="w-full py-1.5 px-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                  >
                    Cut Fuel / Engine
                  </button>
                  <button
                    onClick={() => alert(`Engine Restore command dispatched for ${selectedVehicle.regNumber}`)}
                    className="w-full py-1.5 px-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                  >
                    Restore Engine
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <Car className="w-8 h-8 mb-2" />
              <span>Select a vehicle to inspect live telemetry</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
