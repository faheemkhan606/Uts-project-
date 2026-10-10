import React, { useState } from 'react';
import { CompanyProfile, Branch, Department, Warehouse, NumberingSequence, User } from '../types/vals';
import { Building, MapPin, Hash, Users, Shield, RefreshCw } from 'lucide-react';

interface Props {
  company: CompanyProfile;
  branches: Branch[];
  departments: Department[];
  warehouses: Warehouse[];
  users: User[];
  sequences: Record<string, NumberingSequence>;
  onRefresh: () => void;
}

export const FoundationView: React.FC<Props> = ({
  company,
  branches,
  departments,
  warehouses,
  users,
  sequences,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'sequences' | 'company' | 'branches' | 'departments' | 'users'>('sequences');
  const [testPrefix, setTestPrefix] = useState<'CUS' | 'VEH' | 'DEV' | 'SIM' | 'INS' | 'TKT' | 'INV'>('CUS');
  const [generatedSequence, setGeneratedSequence] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleTestSequence = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/numbering-sequences/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix: testPrefix }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedSequence(data.nextSequence);
        onRefresh();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>Master System Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Section 13 Foundation</span>
          <span aria-hidden="true">·</span>
          <span>Server-Side Numbering Sequences &amp; RBAC</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Foundation, Master Sequences &amp; Organizational Structure
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('sequences')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'sequences' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Auto-Numbering Sequences (Section 13)
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'company' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'branches' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Branches ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'departments' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Departments ({departments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'users' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          RBAC Roles &amp; Users ({users.length})
        </button>
      </div>

      {/* Tab 1: Numbering Sequences */}
      {activeTab === 'sequences' && (
        <div className="space-y-4">
          {/* Interactive Server Sequence Generator Sandbox */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Server-Side Sequence Generator Sandbox
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Per Section 13: Identifiers must be generated server-side with zero collision risk. Select any prefix to increment and preview the real sequence:
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={testPrefix}
                onChange={e => setTestPrefix(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
              >
                <option value="CUS">CUS - Customer Account (CUS-000001)</option>
                <option value="VEH">VEH - Fleet Vehicle (VEH-000001)</option>
                <option value="DEV">DEV - GPS Device (DEV-000001)</option>
                <option value="SIM">SIM - Cellular SIM (SIM-000001)</option>
                <option value="INS">INS - Installation Order (INS-000001)</option>
                <option value="TKT">TKT - Support Ticket (TKT-000001)</option>
                <option value="INV">INV - Billing Invoice (INV-000001)</option>
              </select>

              <button
                onClick={handleTestSequence}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Increment &amp; Fetch Next Identifier</span>
              </button>

              {generatedSequence && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-mono font-bold">
                  <span>Server Sequence Generated:</span>
                  <span className="text-emerald-900 text-sm tracking-tight">{generatedSequence}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sequences Registry Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Prefix</th>
                    <th className="py-3 px-4">Entity Domain</th>
                    <th className="py-3 px-4">Format Mask</th>
                    <th className="py-3 px-4">Padding Length</th>
                    <th className="py-3 px-4">Step</th>
                    <th className="py-3 px-4 text-right">Current Counter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.values(sequences).map(seq => (
                    <tr key={seq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        {seq.prefix}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {seq.entity}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-700 bg-blue-50/30 font-semibold">
                        {seq.format}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {seq.padding} digits
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        +{seq.step}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {seq.currentNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Company Profile */}
      {activeTab === 'company' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Legal Registered Name:</span>
                <span className="font-bold text-sm text-slate-900">{company.legalName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Brand / Trade Name:</span>
                <span className="font-semibold text-slate-800">{company.tradeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">National Tax Number (NTN):</span>
                <span className="font-mono font-medium text-slate-800">{company.ntn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sales Tax Registration (STRN):</span>
                <span className="font-mono font-medium text-slate-800">{company.strn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Incorporation Certificate No:</span>
                <span className="font-mono font-medium text-slate-800">{company.incorporationNo}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 block">Head Office Address:</span>
                <span className="text-slate-800">{company.headOfficeAddress}, {company.city}, {company.country}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Commercial Phone:</span>
                <span className="font-mono text-slate-800">{company.primaryPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">24/7 Emergency NOC Hotline:</span>
                <span className="font-mono font-bold text-rose-600">{company.emergencyNocPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Operations Email:</span>
                <span className="text-slate-800">{company.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Operational Currency &amp; Timezone:</span>
                <span className="font-mono text-slate-800">{company.currency} · {company.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Branches */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {branches.map(br => (
            <div key={br.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {br.code}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Active Branch</span>
              </div>
              <h3 className="font-bold text-slate-900 mt-2 text-sm">{br.name}</h3>
              <p className="text-xs text-slate-600 mt-1">{br.address}, {br.city}, {br.province}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Manager: <strong className="text-slate-700">{br.managerName}</strong></span>
                <span className="font-mono">{br.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map(dep => (
            <div key={dep.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="font-mono font-bold text-xs text-slate-500 mb-1">{dep.code}</div>
              <h3 className="font-bold text-slate-900 text-sm">{dep.name}</h3>
              <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div>Lead: <strong className="text-slate-800">{dep.headOfDepartment}</strong></div>
                <div>Headcount: <span className="font-mono font-semibold">{dep.employeeCount} Engineers</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Users & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Assigned Role (RBAC)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {u.id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.email}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-700 font-medium">
                        {u.status}
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
