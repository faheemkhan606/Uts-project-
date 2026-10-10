import React, { useState } from 'react';
import {
  Radio,
  Car,
  Cpu,
  Smartphone,
  History,
  Wrench,
  Users,
  LifeBuoy,
  Boxes,
  Receipt,
  Terminal,
  Settings,
  Shield,
  Menu,
  X,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { User, RoleName } from '../types/vals';

interface LayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  users: User[];
  activeRole: RoleName;
  onRoleChange: (role: RoleName) => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onTabChange,
  users,
  activeRole,
  onRoleChange,
  onRefreshAll,
  isRefreshing,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'live', label: 'NOC Live Monitor', icon: Radio, category: 'Operations' },
    { id: 'vehicles', label: 'Fleet Vehicles', icon: Car, category: 'Assets' },
    { id: 'devices', label: 'GPS Hardware', icon: Cpu, category: 'Assets' },
    { id: 'sims', label: 'SIM Cards', icon: Smartphone, category: 'Assets' },
    { id: 'assignments', label: 'Historical Custody', icon: History, category: 'Assets' },
    { id: 'installations', label: 'Installations & OTP', icon: Wrench, category: 'Field Operations' },
    { id: 'customers', label: 'Customer Accounts', icon: Users, category: 'CRM & Accounts' },
    { id: 'tickets', label: 'SLA Helpdesk', icon: LifeBuoy, category: 'CRM & Accounts' },
    { id: 'inventory', label: 'Warehouse Stock', icon: Boxes, category: 'Supply Chain' },
    { id: 'finance', label: 'Finance & AMC', icon: Receipt, category: 'Revenue & Billing' },
    { id: 'decoder', label: 'Protocol Lab', icon: Terminal, category: 'Telematics Tech' },
    { id: 'foundation', label: 'Master Foundation', icon: Settings, category: 'System Architecture' },
    { id: 'audit', label: 'Security & API Hub', icon: Shield, category: 'System Architecture' },
  ];

  const categories = Array.from(new Set(navItems.map(i => i.category)));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Single text element wordmark
        Zone 2: 4-6 clean text navigation links (clean typography, single-line)
        Zone 3: 1-2 primary actions (Refresh, Role Switcher)
      */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-6 h-14 flex items-center justify-between shadow-2xs">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-600 lg:hidden hover:bg-slate-100 rounded-md cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <a
            href="/"
            onClick={e => {
              e.preventDefault();
              onTabChange('live');
            }}
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            VALS Tracking Enterprise
          </a>
        </div>

        {/* Zone 2: Clean top text links (Single-line, quiet hover) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => onTabChange('live')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'live' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Live NOC
          </button>
          <button
            onClick={() => onTabChange('vehicles')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'vehicles' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Fleet
          </button>
          <button
            onClick={() => onTabChange('installations')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'installations' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Field Work Orders
          </button>
          <button
            onClick={() => onTabChange('customers')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'customers' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => onTabChange('tickets')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'tickets' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Helpdesk
          </button>
          <button
            onClick={() => onTabChange('decoder')}
            className={`cursor-pointer transition-colors whitespace-nowrap ${
              currentTab === 'decoder' ? 'text-slate-900 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Protocol Lab
          </button>
        </nav>

        {/* Zone 3: Primary action + Role Switcher */}
        <div className="flex items-center gap-2">
          {/* RBAC Persona Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={activeRole}
              onChange={e => onRoleChange(e.target.value as RoleName)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="NOC Operations Manager">NOC Controller</option>
              <option value="Field Service Supervisor">Field Supervisor</option>
              <option value="Field Technician">Technician</option>
              <option value="Billing & Accounts Officer">Accounts Officer</option>
              <option value="Customer Support Agent">Support Agent</option>
            </select>
          </div>

          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Synchronize ERP State"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 gap-4 lg:gap-6">
        {/* Left Sidebar Navigation (240px) */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 p-4 transition-transform lg:static lg:block lg:w-56 lg:p-0 lg:bg-transparent lg:border-r-0 lg:z-auto ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="lg:sticky lg:top-20 space-y-5">
            {categories.map(cat => {
              const catItems = navItems.filter(i => i.category === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    {cat}
                  </div>
                  {catItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Quiet Footer Note */}
            <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 px-2 space-y-0.5">
              <div>VALS Tracking (Pvt) Ltd</div>
              <div className="font-mono">v1.0.0-LOCKED</div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};
