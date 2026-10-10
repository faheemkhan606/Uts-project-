import React, { useState } from 'react';
import { SimCard } from '../types/vals';
import { Plus, Search, Smartphone, Signal, CheckCircle } from 'lucide-react';

interface Props {
  sims: SimCard[];
  onRefresh: () => void;
}

export const SimsView: React.FC<Props> = ({ sims, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New SIM Form
  const [iccid, setIccid] = useState('');
  const [msisdn, setMsisdn] = useState('+92 309 ');
  const [carrier, setCarrier] = useState<SimCard['carrier']>('Jazz');
  const [packageName, setPackageName] = useState('Jazz Corporate Telematics 250MB');
  const [monthlyCost, setMonthlyCost] = useState(180);

  const filtered = sims.filter(s =>
    s.msisdn.includes(searchTerm) ||
    s.iccid.includes(searchTerm) ||
    s.simId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iccid: iccid || `8992010${Date.now()}`,
          msisdn,
          carrier,
          packageName,
          monthlyCost: Number(monthlyCost),
          activationDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
          status: 'Stock',
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setIccid('');
        setMsisdn('+92 309 ');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to provision SIM');
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
            <span>Cellular M2M SIM Cards</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: SIM-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            SIM Inventory &amp; Carrier Allocations
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Provision SIM Card</span>
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search MSISDN, ICCID, carrier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Total SIMs: {sims.length} · Active: {sims.filter(s => s.status === 'Active').length} · In Stock: {sims.filter(s => s.status === 'Stock').length}
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">SIM ID</th>
                <th className="py-3 px-4">Mobile Number (MSISDN)</th>
                <th className="py-3 px-4">ICCID Number</th>
                <th className="py-3 px-4">Telco Carrier</th>
                <th className="py-3 px-4">Data Package</th>
                <th className="py-3 px-4">Monthly Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(sim => (
                <tr key={sim.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {sim.simId}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tracking-tight">
                    {sim.msisdn}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {sim.iccid}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {sim.carrier}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {sim.packageName}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                    PKR {sim.monthlyCost}/mo
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${
                      sim.status === 'Active' ? 'text-emerald-700' :
                      sim.status === 'Stock' ? 'text-blue-700' :
                      'text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        sim.status === 'Active' ? 'bg-emerald-500' :
                        sim.status === 'Stock' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`} />
                      {sim.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {sim.expiryDate || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SIM Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Provision New Cellular SIM Card
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mobile MSISDN Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+92 309 5550999"
                  value={msisdn}
                  onChange={e => setMsisdn(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">ICCID (20 digits)</label>
                <input
                  type="text"
                  placeholder="8992010123456789012"
                  value={iccid}
                  onChange={e => setIccid(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Carrier Network *</label>
                  <select
                    value={carrier}
                    onChange={e => {
                      const c = e.target.value as SimCard['carrier'];
                      setCarrier(c);
                      if (c === 'Jazz') setPackageName('Jazz Corporate Telematics 250MB');
                      if (c === 'Zong') setPackageName('Zong IoT Fleet Data 300MB');
                      if (c === 'Telenor') setPackageName('Telenor Connex IoT 200MB');
                      if (c === 'Ufone') setPackageName('Ufone M2M Connect');
                    }}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Jazz">Jazz (PMCL)</option>
                    <option value="Zong">Zong (CMPak)</option>
                    <option value="Telenor">Telenor Pakistan</option>
                    <option value="Ufone">Ufone (PTML)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Monthly Cost (PKR)</label>
                  <input
                    type="number"
                    value={monthlyCost}
                    onChange={e => setMonthlyCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Data Package Profile</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={e => setPackageName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
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
                  {isSubmitting ? 'Provisioning...' : 'Add SIM to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
