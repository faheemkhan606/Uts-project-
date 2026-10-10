import React, { useState } from 'react';
import { InstallationOrder, Vehicle, Customer, User } from '../types/vals';
import { Plus, Search, CheckSquare, KeyRound, Wrench, ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react';

interface Props {
  installations: InstallationOrder[];
  vehicles: Vehicle[];
  customers: Customer[];
  technicians: User[];
  onRefresh: () => void;
}

export const InstallationsView: React.FC<Props> = ({
  installations,
  vehicles,
  customers,
  technicians,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<InstallationOrder | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const filtered = installations.filter(ins =>
    ins.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.vehicleReg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ins.technicianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerifyOtp = async (orderId: string) => {
    if (!otpInput) {
      alert('Please enter customer OTP code');
      return;
    }
    setIsVerifying(true);
    setOtpMessage('');
    try {
      const res = await fetch(`/api/installations/${orderId}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpCode: otpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpMessage('OTP verified successfully! Installation completed.');
        onRefresh();
        setSelectedOrder(data.order);
      } else {
        setOtpMessage(data.error || 'OTP verification failed');
      }
    } catch (err: any) {
      setOtpMessage(`Error: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Field Service Management</span>
            <span aria-hidden="true">·</span>
            <span>Technician Operations &amp; QA</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: INS-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Installation Work Orders &amp; Customer OTP Verification
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Active Orders: {installations.filter(i => i.status !== 'Completed').length}</span>
        </div>
      </div>

      {/* Grid: Order List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Orders List (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order, vehicle reg..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {filtered.length} Work Orders
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {filtered.map(order => {
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setOtpInput('');
                    setOtpMessage('');
                  }}
                  className={`p-3 text-left cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {order.orderNumber} · {order.vehicleReg}
                    </span>
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        order.status === 'Completed' || order.status === 'Customer OTP Verified'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'Completed' || order.status === 'Customer OTP Verified'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {order.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium mt-1">
                    {order.customerName}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {order.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      {order.technicianName}
                    </span>
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-slate-400" />
                      OTP: {order.otpVerified ? 'Verified' : 'Pending Client'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Detail, Checklist & OTP Action (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col h-[650px] overflow-y-auto">
          {selectedOrder ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-slate-900">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                    {selectedOrder.vehicleReg}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Customer: <strong className="text-slate-800">{selectedOrder.customerName}</strong>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedOrder.installationAddress}, {selectedOrder.city}</span>
                </div>
              </div>

              {/* Hardware Bindings */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 font-mono">
                <div className="font-bold text-slate-700 font-sans uppercase text-[11px]">
                  Assigned Hardware &amp; SIM
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device IMEI:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.deviceImei}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SIM MSISDN:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.simMsisdn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Engineer:</span>
                  <span className="text-slate-800">{selectedOrder.technicianName}</span>
                </div>
              </div>

              {/* QA Checklist */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span>6-Point Field Installation Checklist</span>
                </div>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedOrder.checklist.map((chk, idx) => (
                    <div key={chk.id} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        chk.checked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {chk.checked ? '✓' : idx + 1}
                      </span>
                      <span className={chk.checked ? 'line-through text-slate-400' : ''}>
                        {chk.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer OTP Verification Section */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-900">
                    Customer Confirmation &amp; OTP Handshake
                  </span>
                </div>

                {selectedOrder.otpVerified ? (
                  <div className="text-xs text-emerald-800 bg-emerald-100/60 p-2.5 rounded border border-emerald-300 font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Customer confirmed sign-off. OTP validated. Installation permanently frozen.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Enter the 6-digit OTP code sent to customer's mobile number:
                      <br />
                      <span className="font-mono text-[11px] text-slate-400">(Demo System OTP: <strong>{selectedOrder.otpCode}</strong>)</span>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded font-mono text-center font-bold tracking-widest text-slate-900 text-sm"
                      />
                      <button
                        onClick={() => handleVerifyOtp(selectedOrder.id)}
                        disabled={isVerifying}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {isVerifying ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>

                    {otpMessage && (
                      <div className={`text-xs p-2 rounded font-medium ${
                        otpMessage.includes('successfully') ? 'text-emerald-800 bg-emerald-100' : 'text-rose-800 bg-rose-100'
                      }`}>
                        {otpMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <Wrench className="w-8 h-8 mb-2" />
              <span>Select an installation order to view checklist &amp; OTP verification</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
