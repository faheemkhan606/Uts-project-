import React, { useState } from 'react';
import { PackagePlan, AmcContract, Invoice } from '../types/vals';
import { Receipt, FileText, CheckCircle2, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

interface Props {
  packages: PackagePlan[];
  contracts: AmcContract[];
  invoices: Invoice[];
  onRefresh: () => void;
}

export const FinanceView: React.FC<Props> = ({ packages, contracts, invoices }) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'amc' | 'invoices'>('packages');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>Finance &amp; Revenue Operations</span>
          <span aria-hidden="true">·</span>
          <span>Packages, AMC Contracts &amp; Invoicing</span>
          <span aria-hidden="true">·</span>
          <span>Server Sequences: AMC-{`{000000}`}, INV-{`{000000}`}</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Commercial Subscriptions, AMC &amp; Billing
        </h2>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'packages' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Commercial Packages ({packages.length})
        </button>
        <button
          onClick={() => setActiveTab('amc')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'amc' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Annual Maintenance Contracts (AMC) ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'invoices' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Customer Invoices &amp; Receivables ({invoices.length})
        </button>
      </div>

      {/* Tab 1: Packages */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {pkg.code}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">Active Plan</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">
                  {pkg.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="my-4 pt-3 border-t border-slate-100">
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    PKR {pkg.monthlyPrice.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 font-sans"> / vehicle / mo</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Annual: PKR {pkg.annualPrice.toLocaleString()} · Setup: PKR {pkg.installationFee.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2">Included Telematics Features:</div>
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => alert(`Assigned ${pkg.name} template`)}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Configure Package Parameters
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: AMC Contracts */}
      {activeTab === 'amc' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contract No</th>
                  <th className="py-3 px-4">Client Account</th>
                  <th className="py-3 px-4">Covered Vehicle</th>
                  <th className="py-3 px-4">Contract Period</th>
                  <th className="py-3 px-4">Annual Fee</th>
                  <th className="py-3 px-4">Service Scope</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map(amc => (
                  <tr key={amc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {amc.contractNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {amc.customerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {amc.vehicleReg}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {amc.startDate} → {amc.endDate}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-900 font-medium">
                      PKR {amc.annualFee.toLocaleString()}/yr
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {amc.coverage}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {amc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Sales Tax (16% GST)</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {inv.invoiceDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                      PKR {inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                      PKR {inv.taxAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      PKR {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-700 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
