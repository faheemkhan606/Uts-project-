import React, { useState } from 'react';
import { Vehicle, Customer, GpsDevice, SimCard } from '../types/vals';
import { Plus, Search, Filter, Cpu, Smartphone, ShieldCheck, History, ArrowRightLeft } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  customers: Customer[];
  devices: GpsDevice[];
  sims: SimCard[];
  onRefresh: () => void;
}

export const VehiclesView: React.FC<Props> = ({ vehicles, customers, devices, sims, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // New Vehicle Form State
  const [newReg, setNewReg] = useState('');
  const [newMake, setNewMake] = useState('Toyota');
  const [newModel, setNewModel] = useState('Corolla Altis');
  const [newYear, setNewYear] = useState(2024);
  const [newColor, setNewColor] = useState('Super White');
  const [newType, setNewType] = useState<Vehicle['vehicleType']>('Sedan');
  const [newChassis, setNewChassis] = useState('');
  const [newEngine, setNewEngine] = useState('');
  const [newCustomerId, setNewCustomerId] = useState(customers[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment Modal State
  const [assignDeviceId, setAssignDeviceId] = useState('');
  const [assignSimId, setAssignSimId] = useState('');
  const [assignTechName, setAssignTechName] = useState('Sajid Mehmood');
  const [assignReason, setAssignReason] = useState<'Initial Installation' | 'Device Upgrade' | 'SIM Replacement' | 'Defective Swap'>('Initial Installation');

  const availableDevices = devices.filter(d => d.status === 'In Stock');
  const availableSims = sims.filter(s => s.status === 'Stock');

  const filtered = vehicles.filter(v => 
    v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regNumber: newReg.toUpperCase(),
          make: newMake,
          model: newModel,
          year: Number(newYear),
          color: newColor,
          vehicleType: newType,
          chassisNumber: newChassis || `CHS-${Date.now()}`,
          engineNumber: newEngine || `ENG-${Date.now()}`,
          customerId: newCustomerId,
          status: 'Installation Pending',
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewReg('');
        setNewChassis('');
        setNewEngine('');
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create vehicle');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !assignDeviceId || !assignSimId) {
      alert('Please select both a GPS Device and a SIM Card');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          deviceId: assignDeviceId,
          simId: assignSimId,
          technicianName: assignTechName,
          reason: assignReason,
        }),
      });
      if (res.ok) {
        setShowAssignModal(false);
        setSelectedVehicle(null);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Assignment failed');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Asset Core</span>
            <span aria-hidden="true">·</span>
            <span>Vehicle Fleet Registry</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: VEH-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Registered Vehicles &amp; Asset Linkages
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search registration, chassis, make..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filtered.length} of {vehicles.length} fleet units
        </div>
      </div>

      {/* Table Data Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Make &amp; Model</th>
                <th className="py-3 px-4">Owner / Customer</th>
                <th className="py-3 px-4">GPS Device</th>
                <th className="py-3 px-4">SIM Card</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map(veh => {
                const customer = customers.find(c => c.id === veh.customerId);
                const device = devices.find(d => d.id === veh.assignedDeviceId);
                const sim = sims.find(s => s.id === veh.assignedSimId);

                return (
                  <tr key={veh.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {veh.vehicleId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {veh.regNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {veh.year} {veh.make} {veh.model}
                      <span className="text-[11px] text-slate-400 block">{veh.vehicleType} · {veh.color}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {customer?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      {device ? (
                        <div>
                          <span className="font-mono font-medium text-slate-800">{device.deviceId}</span>
                          <span className="text-[11px] text-slate-500 block font-mono">IMEI: {device.imei}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Device Assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {sim ? (
                        <div>
                          <span className="font-mono font-medium text-slate-800">{sim.msisdn}</span>
                          <span className="text-[11px] text-slate-500 block">{sim.carrier}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No SIM Assigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${
                        veh.status === 'Monitoring' ? 'text-emerald-700' :
                        veh.status === 'Installation Pending' ? 'text-amber-700' :
                        'text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          veh.status === 'Monitoring' ? 'bg-emerald-500' :
                          veh.status === 'Installation Pending' ? 'bg-amber-500' :
                          'bg-slate-400'
                        }`} />
                        {veh.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedVehicle(veh);
                          setShowAssignModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        title="Assign or swap hardware"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Swap HW</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Vehicle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Register New Fleet Vehicle
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Registration Plate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KHI-FL-9901"
                  value={newReg}
                  onChange={e => setNewReg(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono uppercase font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Vehicle Make *</label>
                  <input
                    type="text"
                    required
                    value={newMake}
                    onChange={e => setNewMake(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={e => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Color</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Light Truck">Light Truck</option>
                    <option value="Heavy Trailer">Heavy Trailer</option>
                    <option value="Van">Van</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Customer Account *</label>
                <select
                  value={newCustomerId}
                  onChange={e => setNewCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customerId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  {isSubmitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign / Swap Hardware */}
      {showAssignModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign GPS Hardware &amp; SIM
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Target Vehicle: {selectedVehicle.regNumber} ({selectedVehicle.vehicleId})
                </span>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Available GPS Device *</label>
                <select
                  required
                  value={assignDeviceId}
                  onChange={e => setAssignDeviceId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                >
                  <option value="">-- Choose Stock GPS Device --</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.deviceId} · IMEI {d.imei} · {d.manufacturer} {d.model} ({d.protocol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Available Cellular SIM *</label>
                <select
                  required
                  value={assignSimId}
                  onChange={e => setAssignSimId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                >
                  <option value="">-- Choose Stock SIM Card --</option>
                  {availableSims.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.simId} · {s.msisdn} ({s.carrier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Assignment Reason</label>
                <select
                  value={assignReason}
                  onChange={e => setAssignReason(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  <option value="Initial Installation">Initial Installation</option>
                  <option value="Device Upgrade">Device Upgrade</option>
                  <option value="SIM Replacement">SIM Replacement</option>
                  <option value="Defective Swap">Defective Swap</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Field Engineer / Technician Name</label>
                <input
                  type="text"
                  value={assignTechName}
                  onChange={e => setAssignTechName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px]">
                Note: This operation will automatically lock and archive previous hardware assignments into the immutable historical record.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
