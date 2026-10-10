import React, { useState } from 'react';
import { HistoricalAssignment, Vehicle, GpsDevice, SimCard } from '../types/vals';
import { History, Search, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface Props {
  assignments: HistoricalAssignment[];
  vehicles: Vehicle[];
  devices: GpsDevice[];
  sims: SimCard[];
}

export const HistoricalAssignmentsView: React.FC<Props> = ({
  assignments,
  vehicles,
  devices,
  sims,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = assignments.filter(a => {
    const veh = vehicles.find(v => v.id === a.vehicleId);
    const dev = devices.find(d => d.id === a.deviceId);
    const sim = sims.find(s => s.id === a.simId);

    const matchText = `${veh?.regNumber || ''} ${dev?.imei || ''} ${sim?.msisdn || ''} ${a.technicianName} ${a.reason} ${a.notes || ''}`.toLowerCase();
    return matchText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>Asset Integrity &amp; Audit</span>
          <span aria-hidden="true">·</span>
          <span>Section 18 Compliance</span>
          <span aria-hidden="true">·</span>
          <span>Immutable Historical Trail</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Vehicle · Device · SIM Historical Chain of Custody
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Historical records retain previous and current hardware bindings, engineer endorsements, swap reasons, and lifecycle dates. Records are append-only.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle reg, IMEI, technician, reason..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {assignments.length} total chain-of-custody records
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Vehicle Registration</th>
                <th className="py-3 px-4">GPS Device (IMEI)</th>
                <th className="py-3 px-4">SIM Card (MSISDN)</th>
                <th className="py-3 px-4">Assignment Reason</th>
                <th className="py-3 px-4">Field Engineer</th>
                <th className="py-3 px-4">Binding Period</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(entry => {
                const veh = vehicles.find(v => v.id === entry.vehicleId);
                const dev = devices.find(d => d.id === entry.deviceId);
                const sim = sims.find(s => s.id === entry.simId);
                const isActive = !entry.removedAt;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {entry.id}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {veh?.regNumber || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {dev ? (
                        <span>{dev.deviceId} ({dev.imei})</span>
                      ) : (
                        entry.deviceId
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {sim ? (
                        <span>{sim.msisdn} ({sim.carrier})</span>
                      ) : (
                        entry.simId
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{entry.reason}</span>
                      {entry.notes && (
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">{entry.notes}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {entry.technicianName}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {new Date(entry.assignedAt).toLocaleDateString()}
                      {entry.removedAt ? ` → ${new Date(entry.removedAt).toLocaleDateString()}` : ' → Present'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-medium ${
                        isActive ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Current Binding' : 'Archived Historical'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
