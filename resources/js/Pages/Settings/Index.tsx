import React, { useState } from 'react';
import { useAuthorization } from '../../lib/authorization';
import { SystemSettingItem } from '../../lib/settings';
import {
  Sliders,
  Globe,
  ShieldCheck,
  Radio,
  Bell,
  Database,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Save,
} from 'lucide-react';

interface Props {
  settingsGrouped: Record<string, SystemSettingItem[]>;
  canUpdate: boolean;
}

export default function SettingsIndex({ settingsGrouped, canUpdate }: Props) {
  const { user } = useAuthorization();
  const groups = Object.keys(settingsGrouped);
  const [activeGroup, setActiveGroup] = useState<string>(groups[0] || 'general');
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    Object.values(settingsGrouped).flat().forEach((item) => {
      initial[item.key] = item.value;
    });
    return initial;
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'general':
        return <Sliders className="w-5 h-5" />;
      case 'localization':
        return <Globe className="w-5 h-5" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5" />;
      case 'telematics':
        return <Radio className="w-5 h-5" />;
      case 'notifications':
        return <Bell className="w-5 h-5" />;
      case 'audit':
        return <Database className="w-5 h-5" />;
      default:
        return <Sliders className="w-5 h-5" />;
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdate) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Create CSRF-aware submission payload
      const response = await fetch('/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          settings: formData,
        }),
      });

      if (response.ok) {
        setStatusMessage('Configuration settings saved successfully.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setStatusMessage(errorData.message || 'Validation error while saving settings.');
      }
    } catch {
      setStatusMessage('Network or server error encountered while updating settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSettings = settingsGrouped[activeGroup] || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-6 h-6 text-emerald-400" />
              VALS Enterprise System Settings
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 ml-10">
            Centralized typed configuration foundation for ERP, Telematics NOC, Security, and Localization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Authenticated Actor</div>
            <div className="text-sm font-semibold text-emerald-400">{user?.name || 'Authorized Staff'}</div>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Configuration Domains
          </div>
          {groups.map((group) => {
            const isActive = activeGroup === group;
            return (
              <button
                key={group}
                onClick={() => {
                  setActiveGroup(group);
                  setStatusMessage(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors capitalize ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                {getGroupIcon(group)}
                <span>{group} Settings</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {settingsGrouped[group]?.length || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Settings Form Container */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                  {getGroupIcon(activeGroup)}
                  {activeGroup} Configuration
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Parameters managed under the {activeGroup} subsystem. Changes are recorded in immutable audit logs.
                </p>
              </div>

              {canUpdate && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm border ${
                  statusMessage.includes('successfully')
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800 text-rose-300'
                }`}
              >
                {statusMessage.includes('successfully') ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="space-y-6">
              {currentSettings.map((item) => {
                const currentValue = formData[item.key] ?? item.value;

                return (
                  <div
                    key={item.key}
                    className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-200">{item.key}</span>
                          {item.is_public && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-400">
                              <Eye className="w-3 h-3" /> Public
                            </span>
                          )}
                          {item.is_encrypted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400">
                              <Lock className="w-3 h-3" /> Encrypted at Rest
                            </span>
                          )}
                          {item.is_system && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                              System
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider self-start sm:self-auto">
                        Type: {item.type}
                      </span>
                    </div>

                    {/* Input Field based on item type */}
                    <div className="pt-1">
                      {item.type === 'boolean' ? (
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                            <input
                              type="radio"
                              name={item.key}
                              value="true"
                              checked={currentValue === true || currentValue === 'true'}
                              onChange={() => handleChange(item.key, true)}
                              disabled={!canUpdate}
                              className="text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                            />
                            Enabled / True
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                            <input
                              type="radio"
                              name={item.key}
                              value="false"
                              checked={currentValue === false || currentValue === 'false'}
                              onChange={() => handleChange(item.key, false)}
                              disabled={!canUpdate}
                              className="text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                            />
                            Disabled / False
                          </label>
                        </div>
                      ) : item.type === 'integer' || item.type === 'float' ? (
                        <input
                          type="number"
                          value={currentValue ?? ''}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          disabled={!canUpdate}
                          className="w-full sm:w-72 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      ) : item.type === 'encrypted' ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="password"
                            value={currentValue ?? ''}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            disabled={!canUpdate}
                            placeholder="********"
                            className="w-full sm:w-96 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                          />
                          <span className="text-xs text-amber-400">Decryption masked</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={currentValue ?? ''}
                          onChange={(e) => handleChange(item.key, e.target.value)}
                          disabled={!canUpdate}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
