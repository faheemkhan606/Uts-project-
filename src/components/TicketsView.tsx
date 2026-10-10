import React, { useState } from 'react';
import { SupportTicket, Customer, Vehicle } from '../types/vals';
import { Plus, Search, AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  tickets: SupportTicket[];
  customers: Customer[];
  vehicles: Vehicle[];
  onRefresh: () => void;
}

export const TicketsView: React.FC<Props> = ({ tickets, customers, vehicles, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Ticket State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [category, setCategory] = useState<SupportTicket['category']>('Tracker Offline');
  const [priority, setPriority] = useState<SupportTicket['priority']>('High');
  const [assignedTo, setAssignedTo] = useState('Farhan Ali (NOC)');

  const filtered = tickets.filter(t =>
    t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.vehicleReg && t.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const cus = customers.find(c => c.id === customerId);
    const veh = vehicles.find(v => v.id === vehicleId);

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          customerId,
          customerName: cus?.name || 'Customer',
          vehicleId,
          vehicleReg: veh?.regNumber || 'N/A',
          category,
          priority,
          assignedTo,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create ticket');
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
            <span>Customer Service Desk</span>
            <span aria-hidden="true">·</span>
            <span>SLA Monitoring &amp; Escalations</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: TKT-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Complaints, Service Tickets &amp; SLA Tracking
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Support Ticket</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket, vehicle, client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Open Tickets: {tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed').length}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket No</th>
                <th className="py-3 px-4">Subject &amp; Category</th>
                <th className="py-3 px-4">Account / Vehicle</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">SLA Resolution Target</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tkt => (
                <tr key={tkt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {tkt.ticketNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{tkt.title}</span>
                    <span className="text-[11px] text-slate-500">{tkt.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{tkt.customerName}</span>
                    <span className="font-mono text-[11px] text-slate-500">{tkt.vehicleReg}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                      tkt.priority === 'Critical' ? 'text-rose-700' :
                      tkt.priority === 'High' ? 'text-amber-700' :
                      'text-slate-700'
                    }`}>
                      {tkt.priority} ({tkt.slaResolutionHours}h SLA)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(tkt.resolutionDueAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {tkt.assignedTo}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center gap-1.5 font-medium ${
                      tkt.status === 'Resolved' ? 'text-emerald-700' :
                      tkt.status === 'In Progress' ? 'text-blue-700' :
                      'text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tkt.status === 'Resolved' ? 'bg-emerald-500' :
                        tkt.status === 'In Progress' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`} />
                      {tkt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Log Customer Support Ticket
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Customer Account *</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Related Fleet Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={e => setVehicleId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.regNumber} ({v.make} {v.model})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Issue Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Tracker Offline">Tracker Offline</option>
                    <option value="Ignition Anomaly">Ignition Anomaly</option>
                    <option value="Hardware Issue">Hardware Issue</option>
                    <option value="SIM / Data Issue">SIM / Data Issue</option>
                    <option value="Billing Inquiry">Billing Inquiry</option>
                    <option value="Relocation">Device Relocation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Priority / SLA *</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Critical">Critical (4h SLA)</option>
                    <option value="High">High (8h SLA)</option>
                    <option value="Medium">Medium (24h SLA)</option>
                    <option value="Low">Low (48h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Complaint Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit intermittent along Karachi Port bypass"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Include driver contact, physical symptoms or route details..."
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
                  {isSubmitting ? 'Logging...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
