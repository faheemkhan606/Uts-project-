import React, { useState } from 'react';
import { GpsDevice, Warehouse, GpsProtocol } from '../types/vals';
import { Plus, Search, Cpu, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Props {
  devices: GpsDevice[];
  warehouses: Warehouse[];
  onRefresh: () => void;
}

export const DevicesView: React.FC<Props> = ({ devices, warehouses, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Device Form
  const [imei, setImei] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [manufacturer, setManufacturer] = useState('Concox');
  const [model, setModel] = useState('GT06N GPS Tracker');
  const [protocol, setProtocol] = useState<GpsProtocol>('GT06');
  const [firmware, setFirmware] = useState('v4.1.8-PK-VALS');
  const [vendor, setVendor] = useState('Shenzhen Jimi IOT Ltd');
  const [purchaseCost, setPurchaseCost] = useState(5800);
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');

  const filtered = devices.filter(d =>
    d.imei.includes(searchTerm) ||
    d.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imei || imei.length < 15) {
      alert('Valid 15-digit IMEI required');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei,
          serialNumber: serialNo || `SN-${Date.now()}`,
          manufacturer,
          model,
          protocol,
          firmwareVersion: firmware,
          vendor,
          purchaseDate: new Date().toISOString().split('T')[0],
          purchaseCost: Number(purchaseCost),
          warehouseId,
          warrantyExpiry: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
          status: 'In Stock',
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setImei('');
        setSerialNo('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add device');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Asset Core</span>
            <span aria-hidden="true">·</span>
            <span>GPS Telematics Hardware</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: DEV-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            GPS Device Serialized Inventory
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Procure / Add Device</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search IMEI, serial, model..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total Devices: {devices.length} · In Stock: {devices.filter(d => d.status === 'In Stock').length}
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Device ID</th>
                <th className="py-3 px-4">IMEI Number</th>
                <th className="py-3 px-4">Hardware Model</th>
                <th className="py-3 px-4">Protocol Engine</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Warranty Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(dev => {
                const wh = warehouses.find(w => w.id === dev.warehouseId);
                return (
                  <tr key={dev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {dev.deviceId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tracking-tight">
                      {dev.imei}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {dev.manufacturer} {dev.model}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {dev.protocol}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {dev.firmwareVersion}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {wh?.name || 'Central Vault'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${
                        dev.status === 'Installed' ? 'text-emerald-700' :
                        dev.status === 'In Stock' ? 'text-blue-700' :
                        'text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          dev.status === 'Installed' ? 'bg-emerald-500' :
                          dev.status === 'In Stock' ? 'bg-blue-500' :
                          'bg-slate-400'
                        }`} />
                        {dev.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {dev.warrantyExpiry}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Procure New GPS Telematics Device
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">15-Digit IMEI Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 868204041234567"
                  value={imei}
                  onChange={e => setImei(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Manufacturer *</label>
                  <select
                    value={manufacturer}
                    onChange={e => {
                      setManufacturer(e.target.value);
                      if (e.target.value === 'Teltonika') {
                        setProtocol('Teltonika');
                        setModel('FMB920 European Tracker');
                      } else if (e.target.value === 'Concox') {
                        setProtocol('GT06');
                        setModel('GT06N GPS Tracker');
                      } else if (e.target.value === 'SinoTrack') {
                        setProtocol('SinoTrack');
                        setModel('ST-901 4G');
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Concox">Concox / Jimi IoT</option>
                    <option value="Teltonika">Teltonika Telematics</option>
                    <option value="SinoTrack">SinoTrack</option>
                    <option value="Queclink">Queclink</option>
                    <option value="TKStar">TKStar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Telematics Protocol *</label>
                  <select
                    value={protocol}
                    onChange={e => setProtocol(e.target.value as GpsProtocol)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono font-medium"
                  >
                    <option value="GT06">GT06 (Standard)</option>
                    <option value="Teltonika">Teltonika Codec 8/8E</option>
                    <option value="Concox">Concox Binary</option>
                    <option value="SinoTrack">SinoTrack Protocol</option>
                    <option value="GenericHTTP">Generic HTTP / REST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Hardware Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="Optional SN"
                    value={serialNo}
                    onChange={e => setSerialNo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Receiving Warehouse</label>
                  <select
                    value={warehouseId}
                    onChange={e => setWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
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
                  {isSubmitting ? 'Registering...' : 'Add to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
