import React, { useState } from 'react';
import { AuditLogEntry, ApiClient } from '../types/vals';
import { Shield, Key, Search, Lock, Webhook, CheckCircle2 } from 'lucide-react';

interface Props {
  auditLogs: AuditLogEntry[];
  apiClients: ApiClient[];
  onRefresh: () => void;
}

export const AuditLogsView: React.FC<Props> = ({ auditLogs, apiClients }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'apihub'>('audit');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>Security Governance &amp; Integration Hub</span>
          <span aria-hidden="true">·</span>
          <span>Section 37-40 Compliance</span>
          <span aria-hidden="true">·</span>
          <span>Tamper-Proof Audit Trail</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Enterprise Security Logs &amp; API Integration Hub
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'audit' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Security Audit Trail ({auditLogs.length} events)
        </button>
        <button
          onClick={() => setActiveTab('apihub')}
          className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
            activeTab === 'apihub' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          API Integration Clients ({apiClients.length})
        </button>
      </div>

      {activeTab === 'audit' ? (
        <div className="space-y-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search audit actions, actors, entities..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Audit Details</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600 text-[11px]">
                        {log.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{log.actorName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{log.actorRole}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                        {log.entityType}: {log.entityId}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiClients.map(client => (
              <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {client.clientId}
                  </span>
                  <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authorized Active Client
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{client.name}</h3>
                  <div className="text-xs font-mono text-slate-500 mt-1">
                    Rate Limit: {client.rateLimitPerMin} requests/min
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono">
                  <span className="text-slate-400 block text-[10px]">Production Bearer API Key:</span>
                  <span className="text-emerald-400 font-bold">{client.apiKey}</span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold block mb-1">Scopes Granted:</span>
                  <div className="flex flex-wrap gap-1">
                    {client.permissions.map((p, i) => (
                      <span key={i} className="font-mono text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
