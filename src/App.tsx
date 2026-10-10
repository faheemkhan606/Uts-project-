/**
 * VALS Tracking Enterprise Platform - Main Frontend Application
 * Ownership: VALS Tracking (Private) Limited
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { LiveOperationsView } from './components/LiveOperationsView';
import { VehiclesView } from './components/VehiclesView';
import { DevicesView } from './components/DevicesView';
import { SimsView } from './components/SimsView';
import { HistoricalAssignmentsView } from './components/HistoricalAssignmentsView';
import { InstallationsView } from './components/InstallationsView';
import { CustomersView } from './components/CustomersView';
import { TicketsView } from './components/TicketsView';
import { InventoryView } from './components/InventoryView';
import { FinanceView } from './components/FinanceView';
import { ProtocolDecoderView } from './components/ProtocolDecoderView';
import { FoundationView } from './components/FoundationView';
import { AuditLogsView } from './components/AuditLogsView';

import {
  CurrentVehicleState,
  Vehicle,
  GpsDevice,
  SimCard,
  HistoricalAssignment,
  InstallationOrder,
  Customer,
  SupportTicket,
  InventoryItem,
  StockTransaction,
  PackagePlan,
  AmcContract,
  Invoice,
  AuditLogEntry,
  ApiClient,
  CompanyProfile,
  Branch,
  Department,
  Warehouse,
  NumberingSequence,
  User,
  RoleName,
} from './types/vals';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('live');
  const [activeRole, setActiveRole] = useState<RoleName>('Super Admin');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Foundation Data State
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sequences, setSequences] = useState<Record<string, NumberingSequence>>({});

  // Operational State
  const [vehicleStates, setVehicleStates] = useState<CurrentVehicleState[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [devices, setDevices] = useState<GpsDevice[]>([]);
  const [sims, setSims] = useState<SimCard[]>([]);
  const [assignments, setAssignments] = useState<HistoricalAssignment[]>([]);
  const [installations, setInstallations] = useState<InstallationOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>([]);
  const [packages, setPackages] = useState<PackagePlan[]>([]);
  const [contracts, setContracts] = useState<AmcContract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [apiClients, setApiClients] = useState<ApiClient[]>([]);

  const fetchAllData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage('');

    try {
      const [
        foundRes,
        telemetryRes,
        vehRes,
        devRes,
        simRes,
        assignRes,
        insRes,
        cusRes,
        tktRes,
        invRes,
        txRes,
        pkgRes,
        amcRes,
        invcRes,
        auditRes,
        cliRes,
      ] = await Promise.all([
        fetch('/api/foundation'),
        fetch('/api/telemetry/states'),
        fetch('/api/vehicles'),
        fetch('/api/devices'),
        fetch('/api/sims'),
        fetch('/api/assignments/history'),
        fetch('/api/installations'),
        fetch('/api/customers'),
        fetch('/api/tickets'),
        fetch('/api/inventory/items'),
        fetch('/api/inventory/transactions'),
        fetch('/api/finance/packages'),
        fetch('/api/finance/amc'),
        fetch('/api/finance/invoices'),
        fetch('/api/audit-logs'),
        fetch('/api/api-clients'),
      ]);

      if (!foundRes.ok) throw new Error('Failed to load foundation data');

      const foundData = await foundRes.json();
      setCompany(foundData.company);
      setBranches(foundData.branches);
      setDepartments(foundData.departments);
      setWarehouses(foundData.warehouses);
      setUsers(foundData.users);
      setSequences(foundData.numberingSequences);

      if (telemetryRes.ok) setVehicleStates(await telemetryRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (devRes.ok) setDevices(await devRes.json());
      if (simRes.ok) setSims(await simRes.json());
      if (assignRes.ok) setAssignments(await assignRes.json());
      if (insRes.ok) setInstallations(await insRes.json());
      if (cusRes.ok) setCustomers(await cusRes.json());
      if (tktRes.ok) setTickets(await tktRes.json());
      if (invRes.ok) setInventoryItems(await invRes.json());
      if (txRes.ok) setStockTransactions(await txRes.json());
      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (amcRes.ok) setContracts(await amcRes.json());
      if (invcRes.ok) setInvoices(await invcRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (cliRes.ok) setApiClients(await cliRes.json());
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(err.message || 'Error communicating with backend service');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData(true);
  }, [fetchAllData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-base font-bold tracking-tight font-sans">VALS Tracking Enterprise Platform</h1>
        <p className="text-xs text-slate-400 font-mono mt-1">Booting relational database &amp; NOC telematics engine...</p>
      </div>
    );
  }

  return (
    <Layout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      users={users}
      activeRole={activeRole}
      onRoleChange={setActiveRole}
      onRefreshAll={() => fetchAllData(false)}
      isRefreshing={isRefreshing}
    >
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            onClick={() => fetchAllData(false)}
            className="font-semibold underline cursor-pointer hover:text-rose-900"
          >
            Retry Connection
          </button>
        </div>
      )}

      {currentTab === 'live' && (
        <LiveOperationsView
          vehicleStates={vehicleStates}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'vehicles' && (
        <VehiclesView
          vehicles={vehicles}
          customers={customers}
          devices={devices}
          sims={sims}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'devices' && (
        <DevicesView
          devices={devices}
          warehouses={warehouses}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'sims' && (
        <SimsView
          sims={sims}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'assignments' && (
        <HistoricalAssignmentsView
          assignments={assignments}
          vehicles={vehicles}
          devices={devices}
          sims={sims}
        />
      )}

      {currentTab === 'installations' && (
        <InstallationsView
          installations={installations}
          vehicles={vehicles}
          customers={customers}
          technicians={users.filter(u => u.role === 'Field Technician')}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'customers' && (
        <CustomersView
          customers={customers}
          packages={packages}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'tickets' && (
        <TicketsView
          tickets={tickets}
          customers={customers}
          vehicles={vehicles}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'inventory' && (
        <InventoryView
          items={inventoryItems}
          transactions={stockTransactions}
          warehouses={warehouses}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'finance' && (
        <FinanceView
          packages={packages}
          contracts={contracts}
          invoices={invoices}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'decoder' && (
        <ProtocolDecoderView
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'foundation' && company && (
        <FoundationView
          company={company}
          branches={branches}
          departments={departments}
          warehouses={warehouses}
          users={users}
          sequences={sequences}
          onRefresh={() => fetchAllData(false)}
        />
      )}

      {currentTab === 'audit' && (
        <AuditLogsView
          auditLogs={auditLogs}
          apiClients={apiClients}
          onRefresh={() => fetchAllData(false)}
        />
      )}
    </Layout>
  );
}
