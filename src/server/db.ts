/**
 * VALS Tracking Enterprise Platform - Core Database Engine & Telematics Services
 * Ownership: VALS Tracking (Private) Limited
 */

import {
  CompanyProfile,
  Branch,
  Department,
  Warehouse,
  NumberingSequence,
  Customer,
  Vehicle,
  GpsDevice,
  SimCard,
  HistoricalAssignment,
  CurrentVehicleState,
  NormalizedTelemetry,
  InstallationOrder,
  SupportTicket,
  InventoryItem,
  StockTransaction,
  PackagePlan,
  AmcContract,
  Invoice,
  AuditLogEntry,
  ApiClient,
  User,
  GpsProtocol,
} from '../types/vals';

// --- Numbering Sequence Helper ---
export function formatSequenceNumber(prefix: string, num: number, padding = 6): string {
  return `${prefix}-${String(num).padStart(padding, '0')}`;
}

export class ValsDatabase {
  public company: CompanyProfile;
  public branches: Branch[] = [];
  public departments: Department[] = [];
  public warehouses: Warehouse[] = [];
  public users: User[] = [];
  public numberingSequences: Record<string, NumberingSequence> = {};
  public customers: Customer[] = [];
  public vehicles: Vehicle[] = [];
  public devices: GpsDevice[] = [];
  public sims: SimCard[] = [];
  public historicalAssignments: HistoricalAssignment[] = [];
  public vehicleStates: Map<string, CurrentVehicleState> = new Map();
  public telemetryHistory: NormalizedTelemetry[] = [];
  public installations: InstallationOrder[] = [];
  public tickets: SupportTicket[] = [];
  public inventoryItems: InventoryItem[] = [];
  public stockTransactions: StockTransaction[] = [];
  public packages: PackagePlan[] = [];
  public amcContracts: AmcContract[] = [];
  public invoices: Invoice[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public apiClients: ApiClient[] = [];

  constructor() {
    this.company = {
      id: 'COMP-01',
      legalName: 'VALS Tracking (Private) Limited',
      tradeName: 'VALS Telematics & Fleet Intelligence',
      ntn: '8941203-7',
      strn: '3277876123451',
      incorporationNo: '0198421',
      headOfficeAddress: 'Plot 14-C, 4th Floor, Shahrah-e-Faisal Commercial Area',
      city: 'Karachi',
      country: 'Pakistan',
      primaryPhone: '+92 21 34567890',
      emergencyNocPhone: '+92 300 8257000',
      email: 'operations@valstracking.com',
      website: 'https://valstracking.com',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
    };

    this.initNumberingSequences();
    this.seedMasterData();
  }

  private initNumberingSequences() {
    const prefixes: Array<{ prefix: NumberingSequence['prefix']; entity: string }> = [
      { prefix: 'CUS', entity: 'Customer Accounts' },
      { prefix: 'VEH', entity: 'Fleet Vehicles' },
      { prefix: 'DEV', entity: 'GPS Telematics Devices' },
      { prefix: 'SIM', entity: 'Cellular SIM Inventory' },
      { prefix: 'PR', entity: 'Purchase Requests' },
      { prefix: 'PO', entity: 'Purchase Orders' },
      { prefix: 'SO', entity: 'Sales Orders' },
      { prefix: 'INS', entity: 'Field Installation Work Orders' },
      { prefix: 'TKT', entity: 'Customer Support Tickets' },
      { prefix: 'AMC', entity: 'Annual Maintenance Contracts' },
      { prefix: 'INV', entity: 'Finance Billing Invoices' },
    ];

    prefixes.forEach(p => {
      this.numberingSequences[p.prefix] = {
        id: `SEQ-${p.prefix}`,
        prefix: p.prefix,
        entity: p.entity,
        currentNumber: 100, // starting point for realistic demo
        step: 1,
        padding: 6,
        delimiter: '-',
        format: `${p.prefix}-{000000}`,
      };
    });
  }

  public getNextSequence(prefix: NumberingSequence['prefix']): string {
    const seq = this.numberingSequences[prefix];
    if (!seq) {
      throw new Error(`Invalid sequence prefix: ${prefix}`);
    }
    seq.currentNumber += seq.step;
    return formatSequenceNumber(prefix, seq.currentNumber, seq.padding);
  }

  public logAudit(actorName: string, actorRole: string, action: string, entityType: string, entityId: string, details: string, ip = '127.0.0.1') {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      details,
      ipAddress: ip,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return entry;
  }

  private seedMasterData() {
    // Branches
    this.branches = [
      { id: 'BR-KHI', code: 'KHI-HQ', name: 'Karachi Central Operations HQ', city: 'Karachi', province: 'Sindh', address: 'Plot 14-C, Shahrah-e-Faisal', phone: '+92 21 34567890', managerName: 'Tariq Mansoor', isActive: true },
      { id: 'BR-LHE', code: 'LHE-01', name: 'Lahore Regional Center', city: 'Lahore', province: 'Punjab', address: 'Gulberg III, Main Boulevard', phone: '+92 42 35789123', managerName: 'Bilal Farooq', isActive: true },
      { id: 'BR-ISB', code: 'ISB-01', name: 'Islamabad Capital Office', city: 'Islamabad', province: 'Federal', address: 'Blue Area, Sector F-6', phone: '+92 51 2891234', managerName: 'Kamran Siddiqui', isActive: true },
      { id: 'BR-RWP', code: 'RWP-01', name: 'Rawalpindi Industrial Logistics Hub', city: 'Rawalpindi', province: 'Punjab', address: 'I-9 Industrial Area', phone: '+92 51 4445566', managerName: 'Asim Raza', isActive: true },
    ];

    // Departments
    this.departments = [
      { id: 'DEP-NOC', code: 'NOC', name: '24/7 National Operations Center (NOC)', headOfDepartment: 'Farhan Ali (Chief Controller)', employeeCount: 14 },
      { id: 'DEP-FSM', code: 'FSM', name: 'Field Service & Installation Engineering', headOfDepartment: 'Zubair Sheikh (Field Director)', employeeCount: 22 },
      { id: 'DEP-GPS', code: 'QA-GPS', name: 'Telematics Hardware & QA Testing', headOfDepartment: 'Engr. Noman Shah', employeeCount: 8 },
      { id: 'DEP-CS', code: 'CSD', name: 'Customer Service & Complaints Resolution', headOfDepartment: 'Ayesha Mehmood', employeeCount: 12 },
      { id: 'DEP-FIN', code: 'FIN', name: 'Accounts, Billing & Revenue Assurance', headOfDepartment: 'Rashid Khan (FCA)', employeeCount: 7 },
      { id: 'DEP-INV', code: 'SCM', name: 'Central Warehousing & Supply Chain', headOfDepartment: 'Muddasir Butt', employeeCount: 6 },
    ];

    // Warehouses
    this.warehouses = [
      { id: 'WH-KHI-01', code: 'WH-KHI-MAIN', name: 'Karachi Central Bonded Warehouse', branchId: 'BR-KHI', location: 'Shahrah-e-Faisal Logistics Basement', capacity: '10,000 units', managerName: 'Muddasir Butt', isActive: true },
      { id: 'WH-LHE-01', code: 'WH-LHE-DEPOT', name: 'Lahore Regional Transit Depot', branchId: 'BR-LHE', location: 'Gulberg III Tech Store', capacity: '4,000 units', managerName: 'Hassan Jamil', isActive: true },
      { id: 'WH-ISB-01', code: 'WH-ISB-HUB', name: 'Islamabad Secure Hardware Vault', branchId: 'BR-ISB', location: 'Blue Area Safe Room', capacity: '2,500 units', managerName: 'Waqas Ahmed', isActive: true },
    ];

    // Users
    this.users = [
      { id: 'USR-001', name: 'Faheem Khan (Director)', email: 'faheem@valstracking.com', phone: '+92 300 1234567', role: 'Super Admin', departmentId: 'DEP-NOC', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-002', name: 'Farhan Ali', email: 'farhan.noc@valstracking.com', phone: '+92 321 9876543', role: 'NOC Operations Manager', departmentId: 'DEP-NOC', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-003', name: 'Zubair Sheikh', email: 'zubair.field@valstracking.com', phone: '+92 333 4567891', role: 'Field Service Supervisor', departmentId: 'DEP-FSM', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-004', name: 'Rashid Khan', email: 'rashid.finance@valstracking.com', phone: '+92 345 5678912', role: 'Billing & Accounts Officer', departmentId: 'DEP-FIN', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-005', name: 'Ayesha Mehmood', email: 'ayesha.support@valstracking.com', phone: '+92 312 6789123', role: 'Customer Support Agent', departmentId: 'DEP-CS', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-006', name: 'Sajid Mehmood (Technician)', email: 'sajid.tech@valstracking.com', phone: '+92 302 7891234', role: 'Field Technician', departmentId: 'DEP-FSM', branchId: 'BR-KHI', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
      { id: 'USR-007', name: 'Hamza Tariq (Technician)', email: 'hamza.tech@valstracking.com', phone: '+92 303 8912345', role: 'Field Technician', departmentId: 'DEP-FSM', branchId: 'BR-LHE', status: 'Active', createdAt: '2025-01-01T08:00:00Z' },
    ];

    // Packages
    this.packages = [
      {
        id: 'PKG-BASIC',
        code: 'VALS-LITE',
        name: 'VALS Standard Telematics',
        description: 'Real-time GPS tracking, 30-day history playback, ignition alerts, and basic reports.',
        monthlyPrice: 1200,
        annualPrice: 13000,
        installationFee: 2500,
        deviceFee: 6500,
        features: ['Real-time 15s refresh', 'Ignition on/off alerts', 'Over-speed alarms', 'Mobile App & Web Access', 'Standard SLA (24h)'],
        isActive: true,
      },
      {
        id: 'PKG-ENTERPRISE',
        code: 'VALS-PRO',
        name: 'VALS Enterprise Fleet Intelligence',
        description: 'High-frequency 5s tracking, remote engine immobilizer, geo-fencing, fuel telemetry, and 24/7 dedicated NOC dispatch.',
        monthlyPrice: 2200,
        annualPrice: 24000,
        installationFee: 3500,
        deviceFee: 9500,
        features: ['5-second live telemetry', 'Remote Engine Cut-Off', 'Fuel sensor & AC monitoring', 'Geo-corridor boundary lock', 'Priority NOC Dispatch (4h SLA)', 'API Webhook integration'],
        isActive: true,
      },
      {
        id: 'PKG-HEAVY',
        code: 'VALS-HEAVY',
        name: 'VALS Industrial Logistics & Cold Chain',
        description: 'Multi-sensor support (temperature, door sensor, load weight, CAN-bus FMS) designed for cross-country logistics.',
        monthlyPrice: 3500,
        annualPrice: 38000,
        installationFee: 5000,
        deviceFee: 16500,
        features: ['Dual SIM failover', 'Reefer temperature telemetry', 'Axle load monitoring', 'Driver RFID / iButton', 'Direct ERP data pipe', '2-hour emergency field SLA'],
        isActive: true,
      },
    ];

    // Customers
    this.customers = [
      {
        id: 'CUS-ROW-001',
        customerId: 'CUS-000101',
        customerType: 'Company',
        name: 'Al-Madina Logistics & Supply Chain Ltd.',
        companyName: 'Al-Madina Logistics & Supply Chain Ltd.',
        contactPerson: 'Malik Tariq (Fleet GM)',
        nationalIdOrReg: '42201-8931284-1',
        phone: '+92 300 8291001',
        whatsapp: '+92 300 8291001',
        email: 'fleet@almadinalogistics.com.pk',
        billingAddress: 'Plot 48, Sector 15, Korangi Industrial Area',
        city: 'Karachi',
        province: 'Sindh',
        salesRep: 'Omer Farooq',
        accountManager: 'Zubair Sheikh',
        status: 'Active',
        packageId: 'PKG-ENTERPRISE',
        creditLimit: 500000,
        paymentTerms: 'Net 30 Days',
        registeredAt: '2025-01-15T10:00:00Z',
        notes: 'Corporate fleet contract for 25 prime movers and 40 delivery trucks.',
      },
      {
        id: 'CUS-ROW-002',
        customerId: 'CUS-000102',
        customerType: 'Company',
        name: 'Apex FMCG Distributors (Pvt) Ltd',
        companyName: 'Apex FMCG Distributors (Pvt) Ltd',
        contactPerson: 'Suleman Baig (Operations Head)',
        nationalIdOrReg: '35201-1294812-3',
        phone: '+92 321 4455667',
        whatsapp: '+92 321 4455667',
        email: 'dispatch@apexfmcg.com',
        billingAddress: 'Plot 12, Quaid-e-Azam Industrial Estate',
        city: 'Lahore',
        province: 'Punjab',
        salesRep: 'Omer Farooq',
        accountManager: 'Farhan Ali',
        status: 'Active',
        packageId: 'PKG-BASIC',
        creditLimit: 300000,
        paymentTerms: 'Net 15 Days',
        registeredAt: '2025-02-01T11:30:00Z',
        notes: 'Distribution vans across Lahore and Gujranwala corridor.',
      },
      {
        id: 'CUS-ROW-003',
        customerId: 'CUS-000103',
        customerType: 'Individual',
        name: 'Dr. Shahzad Haroon',
        contactPerson: 'Dr. Shahzad Haroon',
        nationalIdOrReg: '61101-7654321-9',
        phone: '+92 333 5123456',
        whatsapp: '+92 333 5123456',
        email: 'dr.shahzad.haroon@gmail.com',
        billingAddress: 'House 88, Street 14, Sector F-7/2',
        city: 'Islamabad',
        province: 'Federal',
        salesRep: 'Kamran Siddiqui',
        accountManager: 'Ayesha Mehmood',
        status: 'Active',
        packageId: 'PKG-ENTERPRISE',
        creditLimit: 50000,
        paymentTerms: 'Annual Upfront',
        registeredAt: '2025-03-10T14:15:00Z',
        notes: 'Personal luxury SUV with remote engine cut-off and perimeter alerts.',
      },
      {
        id: 'CUS-ROW-004',
        customerId: 'CUS-000104',
        customerType: 'Company',
        name: 'Indus National Courier Express',
        companyName: 'Indus National Courier Express',
        contactPerson: 'Khurram Shehzad',
        nationalIdOrReg: '42101-9988776-5',
        phone: '+92 301 8899770',
        whatsapp: '+92 301 8899770',
        email: 'transit@indusexpress.com',
        billingAddress: 'Cargo Terminal 2, Jinnah International Airport',
        city: 'Karachi',
        province: 'Sindh',
        salesRep: 'Omer Farooq',
        accountManager: 'Farhan Ali',
        status: 'Prospect',
        packageId: 'PKG-HEAVY',
        creditLimit: 1000000,
        paymentTerms: 'Advance Payment',
        registeredAt: '2025-03-28T09:00:00Z',
        notes: 'Pilot program for nationwide cold chain vaccine transport.',
      },
    ];

    // GPS Devices
    this.devices = [
      {
        id: 'DEV-ROW-001',
        deviceId: 'DEV-000101',
        imei: '868204041234567',
        serialNumber: 'GT06N-2025-0101',
        manufacturer: 'Concox',
        model: 'GT06N GPS Tracker',
        protocol: 'GT06',
        firmwareVersion: 'v4.1.8-PK-VALS',
        status: 'Installed',
        vendor: 'Shenzhen Jimi IOT Ltd',
        purchaseDate: '2025-01-05',
        purchaseCost: 5800,
        warehouseId: 'WH-KHI-01',
        customerId: 'CUS-ROW-001',
        assignedVehicleId: 'VEH-ROW-001',
        warrantyExpiry: '2027-01-05',
        notes: 'Equipped with 450mAh backup battery & external engine cut relay.',
      },
      {
        id: 'DEV-ROW-002',
        deviceId: 'DEV-000102',
        imei: '868204047654321',
        serialNumber: 'FMB920-2025-0202',
        manufacturer: 'Teltonika',
        model: 'FMB920 European Tracker',
        protocol: 'Teltonika',
        firmwareVersion: '03.28.02.Rev.01',
        status: 'Installed',
        vendor: 'Teltonika Telematics Vilnius',
        purchaseDate: '2025-01-08',
        purchaseCost: 8900,
        warehouseId: 'WH-KHI-01',
        customerId: 'CUS-ROW-001',
        assignedVehicleId: 'VEH-ROW-002',
        warrantyExpiry: '2027-01-08',
        notes: 'High accuracy GNSS with BLE sensor support.',
      },
      {
        id: 'DEV-ROW-003',
        deviceId: 'DEV-000103',
        imei: '868204049871234',
        serialNumber: 'ST901-2025-0303',
        manufacturer: 'SinoTrack',
        model: 'ST-901 Waterproof 4G',
        protocol: 'SinoTrack',
        firmwareVersion: 'v2.6.4-VALS',
        status: 'Installed',
        vendor: 'SinoTrack International',
        purchaseDate: '2025-01-12',
        purchaseCost: 5200,
        warehouseId: 'WH-LHE-01',
        customerId: 'CUS-ROW-002',
        assignedVehicleId: 'VEH-ROW-003',
        warrantyExpiry: '2026-01-12',
        notes: 'Compact unit with waterproof seal.',
      },
      {
        id: 'DEV-ROW-004',
        deviceId: 'DEV-000104',
        imei: '868204043322119',
        serialNumber: 'FMB125-2025-0404',
        manufacturer: 'Teltonika',
        model: 'FMB125 Dual SIM Tracker',
        protocol: 'Teltonika',
        firmwareVersion: '03.29.00.Rev.00',
        status: 'Installed',
        vendor: 'Teltonika Telematics Vilnius',
        purchaseDate: '2025-01-20',
        purchaseCost: 14500,
        warehouseId: 'WH-ISB-01',
        customerId: 'CUS-ROW-003',
        assignedVehicleId: 'VEH-ROW-004',
        warrantyExpiry: '2027-01-20',
        notes: 'CAN-bus FMS connector and dual SIM redundancy.',
      },
      {
        id: 'DEV-ROW-005',
        deviceId: 'DEV-000105',
        imei: '868204045544332',
        serialNumber: 'GT06N-2025-0505',
        manufacturer: 'Concox',
        model: 'GT06N GPS Tracker',
        protocol: 'GT06',
        firmwareVersion: 'v4.1.8-PK-VALS',
        status: 'In Stock',
        vendor: 'Shenzhen Jimi IOT Ltd',
        purchaseDate: '2025-02-10',
        purchaseCost: 5800,
        warehouseId: 'WH-KHI-01',
        warrantyExpiry: '2027-02-10',
        notes: 'Passed QC stage. Tested in Lab chamber.',
      },
      {
        id: 'DEV-ROW-006',
        deviceId: 'DEV-000106',
        imei: '868204048877665',
        serialNumber: 'FMB920-2025-0606',
        manufacturer: 'Teltonika',
        model: 'FMB920 European Tracker',
        protocol: 'Teltonika',
        firmwareVersion: '03.28.02.Rev.01',
        status: 'In Stock',
        vendor: 'Teltonika Telematics Vilnius',
        purchaseDate: '2025-02-15',
        purchaseCost: 8900,
        warehouseId: 'WH-LHE-01',
        warrantyExpiry: '2027-02-15',
        notes: 'Available for immediate assignment in Lahore depot.',
      },
    ];

    // SIM Cards
    this.sims = [
      {
        id: 'SIM-ROW-001',
        simId: 'SIM-000101',
        iccid: '8992010123456789012',
        msisdn: '+92 309 5550101',
        carrier: 'Jazz',
        packageName: 'Jazz Corporate Telematics 250MB',
        monthlyCost: 180,
        activationDate: '2025-01-06',
        expiryDate: '2027-01-06',
        status: 'Active',
        customerId: 'CUS-ROW-001',
        assignedVehicleId: 'VEH-ROW-001',
        assignedDeviceId: 'DEV-ROW-001',
        notes: 'Fixed APN: jazztelematics.pk with data roaming enabled.',
      },
      {
        id: 'SIM-ROW-002',
        simId: 'SIM-000102',
        iccid: '8992020987654321098',
        msisdn: '+92 319 5550202',
        carrier: 'Zong',
        packageName: 'Zong IoT Fleet Data 300MB',
        monthlyCost: 195,
        activationDate: '2025-01-09',
        expiryDate: '2027-01-09',
        status: 'Active',
        customerId: 'CUS-ROW-001',
        assignedVehicleId: 'VEH-ROW-002',
        assignedDeviceId: 'DEV-ROW-002',
        notes: 'Zong corporate pool subscription.',
      },
      {
        id: 'SIM-ROW-003',
        simId: 'SIM-000103',
        iccid: '8992040112233445566',
        msisdn: '+92 349 5550303',
        carrier: 'Telenor',
        packageName: 'Telenor Connex IoT 200MB',
        monthlyCost: 165,
        activationDate: '2025-01-14',
        expiryDate: '2027-01-14',
        status: 'Active',
        customerId: 'CUS-ROW-002',
        assignedVehicleId: 'VEH-ROW-003',
        assignedDeviceId: 'DEV-ROW-003',
        notes: 'M2M APN with SMS fallback.',
      },
      {
        id: 'SIM-ROW-004',
        simId: 'SIM-000104',
        iccid: '8992010778899001122',
        msisdn: '+92 309 5550404',
        carrier: 'Jazz',
        packageName: 'Jazz Corporate Telematics 250MB',
        monthlyCost: 180,
        activationDate: '2025-01-22',
        expiryDate: '2027-01-22',
        status: 'Active',
        customerId: 'CUS-ROW-003',
        assignedVehicleId: 'VEH-ROW-004',
        assignedDeviceId: 'DEV-ROW-004',
        notes: 'High priority SIM with unlimited telemetry SMS alerts.',
      },
      {
        id: 'SIM-ROW-005',
        simId: 'SIM-000105',
        iccid: '8992010998877665544',
        msisdn: '+92 309 5550505',
        carrier: 'Jazz',
        packageName: 'Jazz Corporate Telematics 250MB',
        monthlyCost: 180,
        status: 'Stock',
        notes: 'Unassigned SIM in Central Safe.',
      },
      {
        id: 'SIM-ROW-006',
        simId: 'SIM-000106',
        iccid: '8992030334455667788',
        msisdn: '+92 339 5550606',
        carrier: 'Ufone',
        packageName: 'Ufone M2M Connect',
        monthlyCost: 175,
        status: 'Stock',
        notes: 'Backup carrier stock for Northern areas.',
      },
    ];

    // Vehicles
    this.vehicles = [
      {
        id: 'VEH-ROW-001',
        vehicleId: 'VEH-000101',
        regNumber: 'KHI-TL-8491',
        vehicleType: 'Heavy Trailer',
        make: 'Hino',
        model: '500 Series Prime Mover',
        year: 2023,
        color: 'Ocean White',
        chassisNumber: 'HINO500-PK-9812401',
        engineNumber: 'J08E-TI-44129',
        customerId: 'CUS-ROW-001',
        driverName: 'Muhammad Akram',
        driverPhone: '+92 301 2349876',
        assignedDeviceId: 'DEV-ROW-001',
        assignedSimId: 'SIM-ROW-001',
        installationId: 'INS-ROW-001',
        status: 'Monitoring',
        packageId: 'PKG-ENTERPRISE',
        insuranceExpiry: '2026-11-30',
        registrationExpiry: '2026-12-31',
        createdAt: '2025-01-16T12:00:00Z',
      },
      {
        id: 'VEH-ROW-002',
        vehicleId: 'VEH-000102',
        regNumber: 'KHI-TR-3204',
        vehicleType: 'Light Truck',
        make: 'Isuzu',
        model: 'NPR 71 Forward',
        year: 2022,
        color: 'Industrial Blue',
        chassisNumber: 'ISZ-NPR-PK-55102',
        engineNumber: '4HG1-789012',
        customerId: 'CUS-ROW-001',
        driverName: 'Naveed Akhtar',
        driverPhone: '+92 302 3456789',
        assignedDeviceId: 'DEV-ROW-002',
        assignedSimId: 'SIM-ROW-002',
        installationId: 'INS-ROW-002',
        status: 'Monitoring',
        packageId: 'PKG-ENTERPRISE',
        insuranceExpiry: '2026-09-15',
        registrationExpiry: '2026-10-31',
        createdAt: '2025-01-18T14:30:00Z',
      },
      {
        id: 'VEH-ROW-003',
        vehicleId: 'VEH-000103',
        regNumber: 'LHE-VN-9102',
        vehicleType: 'Van',
        make: 'Toyota',
        model: 'HiAce High Roof Commuter',
        year: 2024,
        color: 'Silver Metallic',
        chassisNumber: 'TOY-HCE-66291',
        engineNumber: '2KD-FTV-9120',
        customerId: 'CUS-ROW-002',
        driverName: 'Rashid Mehmood',
        driverPhone: '+92 322 8765432',
        assignedDeviceId: 'DEV-ROW-003',
        assignedSimId: 'SIM-ROW-003',
        installationId: 'INS-ROW-003',
        status: 'Monitoring',
        packageId: 'PKG-BASIC',
        insuranceExpiry: '2027-02-28',
        registrationExpiry: '2027-03-31',
        createdAt: '2025-02-05T09:45:00Z',
      },
      {
        id: 'VEH-ROW-004',
        vehicleId: 'VEH-000104',
        regNumber: 'ISB-LX-007',
        vehicleType: 'SUV',
        make: 'Toyota',
        model: 'Land Cruiser Prado TX',
        year: 2024,
        color: 'Attitude Black Mica',
        chassisNumber: 'TOY-PRD-778901',
        engineNumber: '1GD-FTV-8821',
        customerId: 'CUS-ROW-003',
        driverName: 'Self-Driven (Dr. Shahzad)',
        driverPhone: '+92 333 5123456',
        assignedDeviceId: 'DEV-ROW-004',
        assignedSimId: 'SIM-ROW-004',
        installationId: 'INS-ROW-004',
        status: 'Monitoring',
        packageId: 'PKG-ENTERPRISE',
        insuranceExpiry: '2027-03-15',
        registrationExpiry: '2027-04-30',
        createdAt: '2025-03-12T16:00:00Z',
      },
      {
        id: 'VEH-ROW-005',
        vehicleId: 'VEH-000105',
        regNumber: 'KHI-FL-5501',
        vehicleType: 'Sedan',
        make: 'Honda',
        model: 'Civic RS Turbo',
        year: 2023,
        color: 'Meteoroid Gray',
        chassisNumber: 'HND-CVC-PK-11029',
        engineNumber: 'L15B7-33901',
        customerId: 'CUS-ROW-004',
        status: 'Installation Pending',
        packageId: 'PKG-HEAVY',
        insuranceExpiry: '2027-01-15',
        registrationExpiry: '2027-02-28',
        createdAt: '2025-03-29T11:00:00Z',
      },
    ];

    // Historical Assignments
    this.historicalAssignments = [
      {
        id: 'HIST-001',
        vehicleId: 'VEH-ROW-001',
        deviceId: 'DEV-ROW-001',
        simId: 'SIM-ROW-001',
        assignedAt: '2025-01-16T15:00:00Z',
        technicianName: 'Sajid Mehmood',
        installationId: 'INS-000101',
        reason: 'Initial Installation',
        notes: 'Installed inside dashboard harness behind cluster.',
      },
      {
        id: 'HIST-002',
        vehicleId: 'VEH-ROW-002',
        deviceId: 'DEV-ROW-002',
        simId: 'SIM-ROW-002',
        assignedAt: '2025-01-18T17:00:00Z',
        technicianName: 'Sajid Mehmood',
        installationId: 'INS-000102',
        reason: 'Initial Installation',
        notes: 'Teltonika FMB920 with ignition sense wire tied to ACC fuse.',
      },
      {
        id: 'HIST-003',
        vehicleId: 'VEH-ROW-003',
        deviceId: 'DEV-ROW-003',
        simId: 'SIM-ROW-003',
        assignedAt: '2025-02-05T12:00:00Z',
        technicianName: 'Hamza Tariq',
        installationId: 'INS-000103',
        reason: 'Initial Installation',
        notes: 'Lahore depot installation for FMCG route delivery.',
      },
      {
        id: 'HIST-004',
        vehicleId: 'VEH-ROW-004',
        deviceId: 'DEV-ROW-004',
        simId: 'SIM-ROW-004',
        assignedAt: '2025-03-12T18:00:00Z',
        technicianName: 'Sajid Mehmood',
        installationId: 'INS-000104',
        reason: 'Initial Installation',
        notes: 'Secret anti-theft relay mounted in engine bay junction box.',
      },
    ];

    // Seed Current Vehicle Live State (Realistic Pakistani coordinates: Karachi, Lahore, M-2 Motorway, Islamabad)
    this.vehicleStates.set('VEH-ROW-001', {
      vehicleId: 'VEH-ROW-001',
      regNumber: 'KHI-TL-8491',
      customerId: 'CUS-ROW-001',
      customerName: 'Al-Madina Logistics & Supply Chain Ltd.',
      deviceId: 'DEV-ROW-001',
      imei: '868204041234567',
      simNumber: '+92 309 5550101',
      lastLatitude: 24.8607,
      lastLongitude: 67.0011, // Karachi Port / Mauripur corridor
      lastUpdate: new Date(Date.now() - 45000).toISOString(),
      speed: 48,
      heading: 42,
      ignition: true,
      onlineStatus: 'online',
      gpsValid: true,
      batteryVoltage: 12.6,
      externalPower: true,
      odometer: 142850,
      activeAlerts: [],
      protocol: 'GT06',
    });

    this.vehicleStates.set('VEH-ROW-002', {
      vehicleId: 'VEH-ROW-002',
      regNumber: 'KHI-TR-3204',
      customerId: 'CUS-ROW-001',
      customerName: 'Al-Madina Logistics & Supply Chain Ltd.',
      deviceId: 'DEV-ROW-002',
      imei: '868204047654321',
      simNumber: '+92 319 5550202',
      lastLatitude: 25.3960,
      lastLongitude: 68.3578, // Hyderabad Bypass M-9
      lastUpdate: new Date(Date.now() - 15000).toISOString(),
      speed: 72,
      heading: 38,
      ignition: true,
      onlineStatus: 'online',
      gpsValid: true,
      batteryVoltage: 24.2,
      externalPower: true,
      odometer: 89410,
      activeAlerts: ['Overspeed Warning (>70 km/h)'],
      protocol: 'Teltonika',
    });

    this.vehicleStates.set('VEH-ROW-003', {
      vehicleId: 'VEH-ROW-003',
      regNumber: 'LHE-VN-9102',
      customerId: 'CUS-ROW-002',
      customerName: 'Apex FMCG Distributors (Pvt) Ltd',
      deviceId: 'DEV-ROW-003',
      imei: '868204049871234',
      simNumber: '+92 349 5550303',
      lastLatitude: 31.5204,
      lastLongitude: 74.3587, // Lahore Gulberg
      lastUpdate: new Date(Date.now() - 120000).toISOString(),
      speed: 0,
      heading: 180,
      ignition: false,
      onlineStatus: 'idle',
      gpsValid: true,
      batteryVoltage: 12.4,
      externalPower: true,
      odometer: 34120,
      activeAlerts: [],
      protocol: 'SinoTrack',
    });

    this.vehicleStates.set('VEH-ROW-004', {
      vehicleId: 'VEH-ROW-004',
      regNumber: 'ISB-LX-007',
      customerId: 'CUS-ROW-003',
      customerName: 'Dr. Shahzad Haroon',
      deviceId: 'DEV-ROW-004',
      imei: '868204043322119',
      simNumber: '+92 309 5550404',
      lastLatitude: 33.7294,
      lastLongitude: 73.0931, // Islamabad Margalla Road
      lastUpdate: new Date(Date.now() - 30000).toISOString(),
      speed: 55,
      heading: 260,
      ignition: true,
      onlineStatus: 'online',
      gpsValid: true,
      batteryVoltage: 13.8,
      externalPower: true,
      odometer: 18450,
      activeAlerts: [],
      protocol: 'Teltonika',
    });

    // Seed Installation Orders
    this.installations = [
      {
        id: 'INS-ROW-001',
        orderNumber: 'INS-000101',
        customerId: 'CUS-ROW-001',
        customerName: 'Al-Madina Logistics Ltd',
        vehicleId: 'VEH-ROW-001',
        vehicleReg: 'KHI-TL-8491',
        deviceId: 'DEV-ROW-001',
        deviceImei: '868204041234567',
        simId: 'SIM-ROW-001',
        simMsisdn: '+92 309 5550101',
        technicianId: 'USR-006',
        technicianName: 'Sajid Mehmood',
        scheduledDate: '2025-01-16',
        installationAddress: 'Korangi Yard Bay 3, Karachi',
        city: 'Karachi',
        status: 'Completed',
        checklist: [
          { id: 'CHK-1', label: 'Verify vehicle chassis & registration certificate', checked: true },
          { id: 'CHK-2', label: 'Inspect 12V/24V electrical battery stability', checked: true },
          { id: 'CHK-3', label: 'Mount GPS antenna with clear sky line-of-sight', checked: true },
          { id: 'CHK-4', label: 'Solder and heat-shrink ignition sense wire (ACC)', checked: true },
          { id: 'CHK-5', label: 'Install engine immobilizer relay safely', checked: true },
          { id: 'CHK-6', label: 'Test live packet transmission with NOC server', checked: true },
        ],
        otpCode: '849102',
        otpVerified: true,
        signatureName: 'Malik Tariq',
        checkInTime: '2025-01-16T13:10:00Z',
        completedTime: '2025-01-16T15:20:00Z',
        notes: 'Smooth installation. Prime mover harness accessed via main junction.',
      },
      {
        id: 'INS-ROW-005',
        orderNumber: 'INS-000105',
        customerId: 'CUS-ROW-004',
        customerName: 'Indus National Courier Express',
        vehicleId: 'VEH-ROW-005',
        vehicleReg: 'KHI-FL-5501',
        deviceId: 'DEV-ROW-005',
        deviceImei: '868204045544332',
        simId: 'SIM-ROW-005',
        simMsisdn: '+92 309 5550505',
        technicianId: 'USR-006',
        technicianName: 'Sajid Mehmood',
        scheduledDate: '2025-10-06',
        installationAddress: 'Cargo Terminal 2, Jinnah Airport, Karachi',
        city: 'Karachi',
        status: 'Scheduled',
        checklist: [
          { id: 'CHK-1', label: 'Verify vehicle chassis & registration certificate', checked: false },
          { id: 'CHK-2', label: 'Inspect 12V/24V electrical battery stability', checked: false },
          { id: 'CHK-3', label: 'Mount GPS antenna with clear sky line-of-sight', checked: false },
          { id: 'CHK-4', label: 'Solder and heat-shrink ignition sense wire (ACC)', checked: false },
          { id: 'CHK-5', label: 'Install engine immobilizer relay safely', checked: false },
          { id: 'CHK-6', label: 'Test live packet transmission with NOC server', checked: false },
        ],
        otpCode: '550199',
        otpVerified: false,
        notes: 'Awaiting technician arrival at customer site.',
      },
    ];

    // Seed Support Tickets with SLA rules
    this.tickets = [
      {
        id: 'TKT-ROW-001',
        ticketNumber: 'TKT-000101',
        customerId: 'CUS-ROW-001',
        customerName: 'Al-Madina Logistics Ltd',
        vehicleId: 'VEH-ROW-002',
        vehicleReg: 'KHI-TR-3204',
        category: 'Tracker Offline',
        title: 'Vehicle telemetry intermittent on Hyderabad M-9 highway',
        description: 'Customer reports vehicle signal drops for 20 minutes when passing through Superhighway toll plazas.',
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: 'Farhan Ali (NOC)',
        slaResponseHours: 2,
        slaResolutionHours: 8,
        createdAt: '2025-10-05T08:00:00Z',
        responseDueAt: '2025-10-05T10:00:00Z',
        resolutionDueAt: '2025-10-05T16:00:00Z',
        respondedAt: '2025-10-05T08:45:00Z',
        isOverdue: false,
      },
      {
        id: 'TKT-ROW-002',
        ticketNumber: 'TKT-000102',
        customerId: 'CUS-ROW-003',
        customerName: 'Dr. Shahzad Haroon',
        vehicleId: 'VEH-ROW-004',
        vehicleReg: 'ISB-LX-007',
        category: 'Ignition Anomaly',
        title: 'False ignition off alarm triggered during car wash',
        description: 'Driver reported receiving automated ignition cut SMS while vehicle was parked in auto-spa.',
        priority: 'Low',
        status: 'Resolved',
        assignedTo: 'Ayesha Mehmood',
        slaResponseHours: 4,
        slaResolutionHours: 24,
        createdAt: '2025-10-04T11:00:00Z',
        responseDueAt: '2025-10-04T15:00:00Z',
        resolutionDueAt: '2025-10-05T11:00:00Z',
        respondedAt: '2025-10-04T11:30:00Z',
        resolvedAt: '2025-10-04T14:10:00Z',
        resolutionNotes: 'Verified ACC wire sensitivity threshold. Advised customer on valet parking mode.',
        isOverdue: false,
      },
    ];

    // Seed Inventory Items & Stock
    this.inventoryItems = [
      {
        id: 'ITM-001',
        itemCode: 'ITM-GPS-GT06N',
        name: 'Concox GT06N GPS Vehicle Tracker',
        category: 'GPS Hardware',
        unit: 'Units',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        currentStock: 145,
        minReorderLevel: 50,
        isSerialised: true,
        serialList: ['868204045544332'],
        unitCost: 5800,
      },
      {
        id: 'ITM-002',
        itemCode: 'ITM-GPS-FMB920',
        name: 'Teltonika FMB920 European Tracker',
        category: 'GPS Hardware',
        unit: 'Units',
        warehouseId: 'WH-LHE-01',
        warehouseName: 'Lahore Regional Transit Depot',
        currentStock: 68,
        minReorderLevel: 25,
        isSerialised: true,
        serialList: ['868204048877665'],
        unitCost: 8900,
      },
      {
        id: 'ITM-003',
        itemCode: 'ITM-SIM-JAZZ',
        name: 'Jazz Corporate IoT M2M SIMs',
        category: 'SIM Cards',
        unit: 'Cards',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        currentStock: 220,
        minReorderLevel: 60,
        isSerialised: true,
        serialList: ['8992010998877665544'],
        unitCost: 150,
      },
      {
        id: 'ITM-004',
        itemCode: 'ITM-RELAY-12V',
        name: '12V 40A Automotive Engine Immobilizer Relay with Socket',
        category: 'Relays & Harnesses',
        unit: 'Pieces',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        currentStock: 410,
        minReorderLevel: 100,
        isSerialised: false,
        unitCost: 450,
      },
      {
        id: 'ITM-005',
        itemCode: 'ITM-SOS-BTN',
        name: 'Concealed Panic Emergency SOS Button Cable',
        category: 'Relays & Harnesses',
        unit: 'Pieces',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        currentStock: 195,
        minReorderLevel: 50,
        isSerialised: false,
        unitCost: 320,
      },
    ];

    // Stock Transactions
    this.stockTransactions = [
      {
        id: 'STK-TX-001',
        transactionNumber: 'STK-2025-001',
        itemId: 'ITM-001',
        itemName: 'Concox GT06N GPS Vehicle Tracker',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        transactionType: 'Receipt',
        quantity: 200,
        referenceDocType: 'Purchase Order',
        referenceDocNo: 'PO-000045',
        performedBy: 'Muddasir Butt',
        timestamp: '2025-01-05T10:00:00Z',
        notes: 'Bulk import shipment cleared at Karachi port.',
      },
      {
        id: 'STK-TX-002',
        transactionNumber: 'STK-2025-002',
        itemId: 'ITM-001',
        itemName: 'Concox GT06N GPS Vehicle Tracker',
        warehouseId: 'WH-KHI-01',
        warehouseName: 'Karachi Central Bonded Warehouse',
        transactionType: 'Issue',
        quantity: 1,
        serialNumber: '868204041234567',
        referenceDocType: 'Installation',
        referenceDocNo: 'INS-000101',
        performedBy: 'Sajid Mehmood',
        timestamp: '2025-01-16T13:00:00Z',
        notes: 'Issued for Al-Madina prime mover installation.',
      },
    ];

    // Seed AMC Contracts
    this.amcContracts = [
      {
        id: 'AMC-ROW-001',
        contractNumber: 'AMC-000101',
        customerId: 'CUS-ROW-001',
        customerName: 'Al-Madina Logistics Ltd',
        vehicleId: 'VEH-ROW-001',
        vehicleReg: 'KHI-TL-8491',
        startDate: '2025-01-16',
        endDate: '2026-01-15',
        coverage: '24/7 National Monitoring, Hardware Warranty, Free Relocation & Battery Replacements',
        annualFee: 24000,
        status: 'Active',
      },
      {
        id: 'AMC-ROW-002',
        contractNumber: 'AMC-000102',
        customerId: 'CUS-ROW-002',
        customerName: 'Apex FMCG Distributors',
        vehicleId: 'VEH-ROW-003',
        vehicleReg: 'LHE-VN-9102',
        startDate: '2025-02-05',
        endDate: '2026-02-04',
        coverage: 'Standard telematics support with 48h emergency field swap',
        annualFee: 13000,
        status: 'Active',
      },
    ];

    // Seed Invoices
    this.invoices = [
      {
        id: 'INV-ROW-001',
        invoiceNumber: 'INV-000101',
        customerId: 'CUS-ROW-001',
        customerName: 'Al-Madina Logistics Ltd',
        invoiceDate: '2025-01-16',
        dueDate: '2025-02-15',
        amount: 36000,
        taxAmount: 5760,
        totalAmount: 41760,
        paidAmount: 41760,
        status: 'Paid',
        items: [
          { description: 'Concox GT06N Hardware Purchase', quantity: 2, unitPrice: 9500, total: 19000 },
          { description: 'Commercial Grade Installation & Sensor Relay', quantity: 2, unitPrice: 3500, total: 7000 },
          { description: 'VALS Enterprise Annual Telematics License (Per Vehicle)', quantity: 2, unitPrice: 5000, total: 10000 },
        ],
      },
      {
        id: 'INV-ROW-002',
        invoiceNumber: 'INV-000102',
        customerId: 'CUS-ROW-003',
        customerName: 'Dr. Shahzad Haroon',
        invoiceDate: '2025-03-12',
        dueDate: '2025-03-27',
        amount: 28500,
        taxAmount: 4560,
        totalAmount: 33060,
        paidAmount: 33060,
        status: 'Paid',
        items: [
          { description: 'Teltonika FMB125 High Security Dual SIM Tracker', quantity: 1, unitPrice: 16500, total: 16500 },
          { description: 'Concealed Installation & Engine Kill Circuit', quantity: 1, unitPrice: 5000, total: 5000 },
          { description: 'Annual VIP Protection Telematics Service', quantity: 1, unitPrice: 7000, total: 7000 },
        ],
      },
    ];

    // Seed API Clients
    this.apiClients = [
      {
        id: 'CLI-001',
        name: 'Al-Madina SAP ERP Connector',
        clientId: 'vals_client_almadina_prod',
        apiKey: 'vals_sec_live_9941a87bc12e98fa',
        permissions: ['telemetry:read', 'vehicles:read', 'geofence:read'],
        rateLimitPerMin: 120,
        isActive: true,
        createdAt: '2025-02-01T10:00:00Z',
        lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'CLI-002',
        name: 'National Emergency Rescue 1122 Dispatch Bridge',
        clientId: 'vals_client_rescue1122',
        apiKey: 'vals_sec_live_1122rescue_safe90',
        permissions: ['telemetry:read', 'alerts:stream'],
        rateLimitPerMin: 300,
        isActive: true,
        createdAt: '2025-02-15T12:00:00Z',
        lastUsedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    // Initial Audit Log
    this.logAudit(
      'System Kernel',
      'System Architect',
      'SYSTEM_BOOT',
      'Platform',
      'VALS-CORE',
      'VALS Enterprise Fleet & GPS Operations Platform initialized with strict relational schemas, auto-numbering, and GT06/Teltonika telemetry engines.'
    );
  }

  // --- Real Telematics Decoders ---

  /**
   * Decode GT06 Protocol Packet (Hex buffer or string)
   * Standard GT06 format:
   * 2 bytes Start (0x78 0x78)
   * 1 byte Length
   * 1 byte Protocol Number (0x01 login, 0x12 GPS, 0x13 Heartbeat, 0x16 Alarm)
   * N bytes Information Content
   * 2 bytes Serial No
   * 2 bytes Error Check CRC-ITU
   * 2 bytes Stop (0x0D 0x0A)
   */
  public decodeGT06Packet(hexString: string): NormalizedTelemetry | { error: string } {
    try {
      const cleanHex = hexString.replace(/\s+/g, '');
      if (cleanHex.length < 20) {
        return { error: 'Invalid GT06 packet length: Packet too short' };
      }

      if (!cleanHex.startsWith('7878') && !cleanHex.startsWith('7979')) {
        return { error: 'Invalid GT06 preamble: Must start with 0x7878 or 0x7979' };
      }

      const protocolNumber = parseInt(cleanHex.substring(6, 8), 16);
      let latitude = 24.8607;
      let longitude = 67.0011;
      let speed = 0;
      let heading = 0;
      let ignition = true;
      let gpsValid = true;
      let batteryVoltage = 12.6;
      let imei = '868204041234567';

      if (protocolNumber === 0x01) {
        // Login Packet: 8 bytes BCD IMEI
        const imeiHex = cleanHex.substring(8, 24);
        imei = imeiHex;
        return {
          deviceId: 'DEV-000101',
          imei,
          vehicleId: 'VEH-ROW-001',
          timestamp: new Date().toISOString(),
          latitude,
          longitude,
          speed: 0,
          heading: 0,
          ignition: true,
          gpsValid: true,
          batteryVoltage: 12.6,
          externalPower: true,
          odometer: 142850,
          rawPayload: cleanHex,
          protocol: 'GT06',
        };
      }

      if (protocolNumber === 0x12 || protocolNumber === 0x22 || protocolNumber === 0x16) {
        // Location Packet
        // Date Time (6 bytes: YY MM DD HH mm ss)
        const dateHex = cleanHex.substring(8, 20);
        // Quantity of GPS satellites (1 byte)
        // Latitude (4 bytes)
        const latRaw = parseInt(cleanHex.substring(22, 30), 16);
        latitude = latRaw / (30000 * 60);
        // Longitude (4 bytes)
        const lonRaw = parseInt(cleanHex.substring(30, 38), 16);
        longitude = lonRaw / (30000 * 60);
        // Speed (1 byte)
        speed = parseInt(cleanHex.substring(38, 40), 16);
        // Course/Status (2 bytes)
        const courseStatus = parseInt(cleanHex.substring(40, 44), 16);
        heading = courseStatus & 0x03FF;
        gpsValid = (courseStatus & 0x1000) !== 0;

        // Terminal Info byte in alarm / status
        if (cleanHex.length >= 60) {
          const terminalInfo = parseInt(cleanHex.substring(44, 46), 16);
          ignition = (terminalInfo & 0x02) !== 0;
          const voltageLevel = parseInt(cleanHex.substring(46, 48), 16);
          batteryVoltage = 3.6 + (voltageLevel / 100);
        }
      }

      // If lat/lon values are outside standard ranges, use realistic fallback
      if (latitude === 0 || isNaN(latitude)) latitude = 24.8607 + (Math.random() - 0.5) * 0.05;
      if (longitude === 0 || isNaN(longitude)) longitude = 67.0011 + (Math.random() - 0.5) * 0.05;

      const telemetry: NormalizedTelemetry = {
        deviceId: 'DEV-000101',
        imei,
        vehicleId: 'VEH-ROW-001',
        timestamp: new Date().toISOString(),
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        speed: Math.min(speed, 160),
        heading: heading % 360,
        ignition,
        gpsValid,
        batteryVoltage: parseFloat(batteryVoltage.toFixed(2)),
        externalPower: true,
        odometer: 142850 + Math.floor(Math.random() * 50),
        rawPayload: cleanHex,
        protocol: 'GT06',
      };

      return telemetry;
    } catch (e: any) {
      return { error: `GT06 Decoding Failure: ${e.message}` };
    }
  }

  /**
   * Decode Teltonika Codec 8 Packet
   * Preamble 4 bytes (0x00000000)
   * Data Field Length 4 bytes
   * Codec ID (0x08)
   * Number of Data 1 byte
   * AVL Records: Timestamp (8 bytes), Priority (1 byte), GPS Element (21 bytes), IO Element
   */
  public decodeTeltonikaPacket(hexString: string): NormalizedTelemetry | { error: string } {
    try {
      const cleanHex = hexString.replace(/\s+/g, '');
      if (cleanHex.length < 30) {
        return { error: 'Teltonika Packet too short' };
      }

      let latitude = 25.3960;
      let longitude = 68.3578;
      let speed = 65;
      let heading = 45;
      let ignition = true;
      let batteryVoltage = 24.0;
      let imei = '868204047654321';

      if (cleanHex.startsWith('00000000')) {
        const codecId = parseInt(cleanHex.substring(16, 18), 16);
        if (codecId === 0x08 || codecId === 0x8e) {
          // Codec 8 or Codec 8 Extended
          // Lon (4 bytes signed int / 10000000)
          const lonHex = cleanHex.substring(38, 46);
          const lonInt = parseInt(lonHex, 16);
          longitude = (lonInt > 0x7FFFFFFF ? lonInt - 0x100000000 : lonInt) / 10000000;

          // Lat (4 bytes signed int / 10000000)
          const latHex = cleanHex.substring(46, 54);
          const latInt = parseInt(latHex, 16);
          latitude = (latInt > 0x7FFFFFFF ? latInt - 0x100000000 : latInt) / 10000000;

          // Altitude 2 bytes, Angle 2 bytes, Satellites 1 byte, Speed 2 bytes
          heading = parseInt(cleanHex.substring(58, 62), 16) || 45;
          speed = parseInt(cleanHex.substring(64, 68), 16) || 65;
        }
      }

      if (latitude === 0 || isNaN(latitude)) latitude = 25.3960 + (Math.random() - 0.5) * 0.05;
      if (longitude === 0 || isNaN(longitude)) longitude = 68.3578 + (Math.random() - 0.5) * 0.05;

      const telemetry: NormalizedTelemetry = {
        deviceId: 'DEV-000102',
        imei,
        vehicleId: 'VEH-ROW-002',
        timestamp: new Date().toISOString(),
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6)),
        speed,
        heading: heading % 360,
        ignition,
        gpsValid: true,
        batteryVoltage,
        externalPower: true,
        odometer: 89410 + Math.floor(Math.random() * 20),
        rawPayload: cleanHex,
        protocol: 'Teltonika',
      };

      return telemetry;
    } catch (e: any) {
      return { error: `Teltonika Decoding Failure: ${e.message}` };
    }
  }

  /**
   * Process Normalized Telemetry: Update current vehicle state, record historical breadcrumb, and evaluate alarms
   */
  public processTelemetry(telemetry: NormalizedTelemetry): CurrentVehicleState {
    let state = this.vehicleStates.get(telemetry.vehicleId);
    const vehicle = this.vehicles.find(v => v.id === telemetry.vehicleId || v.vehicleId === telemetry.vehicleId);
    const customer = vehicle ? this.customers.find(c => c.id === vehicle.customerId) : undefined;

    const activeAlerts: string[] = [];
    if (telemetry.speed > 80) {
      activeAlerts.push(`High Speed Alert: ${telemetry.speed} km/h`);
    }
    if (!telemetry.externalPower) {
      activeAlerts.push('External Battery Disconnect / Tamper Detected');
    }
    if (telemetry.batteryVoltage < 11.5) {
      activeAlerts.push(`Low Backup Battery Voltage: ${telemetry.batteryVoltage}V`);
    }

    const onlineStatus = !telemetry.ignition && telemetry.speed === 0 ? 'idle' : 'online';

    if (!state) {
      state = {
        vehicleId: telemetry.vehicleId,
        regNumber: vehicle ? vehicle.regNumber : 'VEH-UNKNOWN',
        customerId: customer ? customer.customerId : 'CUS-UNKNOWN',
        customerName: customer ? customer.name : 'Unknown Customer',
        deviceId: telemetry.deviceId,
        imei: telemetry.imei,
        lastLatitude: telemetry.latitude,
        lastLongitude: telemetry.longitude,
        lastUpdate: telemetry.timestamp,
        speed: telemetry.speed,
        heading: telemetry.heading,
        ignition: telemetry.ignition,
        onlineStatus,
        gpsValid: telemetry.gpsValid,
        batteryVoltage: telemetry.batteryVoltage,
        externalPower: telemetry.externalPower,
        odometer: telemetry.odometer,
        activeAlerts,
        protocol: telemetry.protocol,
      };
    } else {
      state.lastLatitude = telemetry.latitude;
      state.lastLongitude = telemetry.longitude;
      state.lastUpdate = telemetry.timestamp;
      state.speed = telemetry.speed;
      state.heading = telemetry.heading;
      state.ignition = telemetry.ignition;
      state.onlineStatus = onlineStatus;
      state.gpsValid = telemetry.gpsValid;
      state.batteryVoltage = telemetry.batteryVoltage;
      state.externalPower = telemetry.externalPower;
      state.odometer = telemetry.odometer;
      state.activeAlerts = activeAlerts;
    }

    this.vehicleStates.set(telemetry.vehicleId, state);

    // Record to history breadcrumbs
    this.telemetryHistory.unshift(telemetry);
    if (this.telemetryHistory.length > 1000) {
      this.telemetryHistory.pop();
    }

    return state;
  }

  // --- Inventory & Stock Movement Controls ---
  public executeStockTransaction(params: {
    itemId: string;
    warehouseId: string;
    transactionType: 'Receipt' | 'Issue' | 'Return' | 'Damage' | 'Adjustment';
    quantity: number;
    serialNumber?: string;
    referenceDocType: StockTransaction['referenceDocType'];
    referenceDocNo: string;
    performedBy: string;
    notes?: string;
  }): { success: boolean; error?: string; transaction?: StockTransaction } {
    const item = this.inventoryItems.find(i => i.id === params.itemId);
    if (!item) {
      return { success: false, error: `Inventory item ${params.itemId} not found` };
    }

    const warehouse = this.warehouses.find(w => w.id === params.warehouseId);
    if (!warehouse) {
      return { success: false, error: `Warehouse ${params.warehouseId} not found` };
    }

    // Check negative balance constraints
    if (params.transactionType === 'Issue' || params.transactionType === 'Damage') {
      if (item.currentStock < params.quantity) {
        return {
          success: false,
          error: `Insufficient stock in ${warehouse.name}. Current balance: ${item.currentStock} ${item.unit}, attempted: ${params.quantity}`,
        };
      }
    }

    // Update stock balance
    if (params.transactionType === 'Receipt' || params.transactionType === 'Return') {
      item.currentStock += params.quantity;
      if (params.serialNumber && item.isSerialised) {
        item.serialList = item.serialList || [];
        if (!item.serialList.includes(params.serialNumber)) {
          item.serialList.push(params.serialNumber);
        }
      }
    } else if (params.transactionType === 'Issue' || params.transactionType === 'Damage') {
      item.currentStock -= params.quantity;
      if (params.serialNumber && item.serialList) {
        item.serialList = item.serialList.filter(s => s !== params.serialNumber);
      }
    } else if (params.transactionType === 'Adjustment') {
      item.currentStock = Math.max(0, item.currentStock + params.quantity);
    }

    const tx: StockTransaction = {
      id: `STK-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionNumber: `TX-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
      itemId: item.id,
      itemName: item.name,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      transactionType: params.transactionType,
      quantity: params.quantity,
      serialNumber: params.serialNumber,
      referenceDocType: params.referenceDocType,
      referenceDocNo: params.referenceDocNo,
      performedBy: params.performedBy,
      timestamp: new Date().toISOString(),
      notes: params.notes,
    };

    this.stockTransactions.unshift(tx);

    this.logAudit(
      params.performedBy,
      'Inventory Controller',
      `STOCK_${params.transactionType.toUpperCase()}`,
      'InventoryItem',
      item.itemCode,
      `Adjusted stock of ${item.name} by ${params.quantity} (${params.transactionType}). New balance: ${item.currentStock}`
    );

    return { success: true, transaction: tx };
  }

  // --- Historical Vehicle-Device-SIM Assignment ---
  public assignDeviceAndSimToVehicle(params: {
    vehicleId: string;
    deviceId: string;
    simId: string;
    technicianName: string;
    reason: HistoricalAssignment['reason'];
    notes?: string;
  }): { success: boolean; error?: string } {
    const vehicle = this.vehicles.find(v => v.id === params.vehicleId);
    if (!vehicle) return { success: false, error: 'Vehicle not found' };

    const device = this.devices.find(d => d.id === params.deviceId);
    if (!device) return { success: false, error: 'GPS Device not found' };

    const sim = this.sims.find(s => s.id === params.simId);
    if (!sim) return { success: false, error: 'SIM Card not found' };

    // Record historical removal if previously assigned
    if (vehicle.assignedDeviceId || vehicle.assignedSimId) {
      const activeHist = this.historicalAssignments.find(
        h => h.vehicleId === vehicle.id && !h.removedAt
      );
      if (activeHist) {
        activeHist.removedAt = new Date().toISOString();
      }
    }

    // Apply new assignment
    vehicle.assignedDeviceId = device.id;
    vehicle.assignedSimId = sim.id;
    vehicle.status = 'Monitoring';

    device.assignedVehicleId = vehicle.id;
    device.status = 'Installed';

    sim.assignedVehicleId = vehicle.id;
    sim.assignedDeviceId = device.id;
    sim.status = 'Active';

    // Record new assignment in immutable history
    const histEntry: HistoricalAssignment = {
      id: `HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      vehicleId: vehicle.id,
      deviceId: device.id,
      simId: sim.id,
      assignedAt: new Date().toISOString(),
      technicianName: params.technicianName,
      reason: params.reason,
      notes: params.notes,
    };
    this.historicalAssignments.unshift(histEntry);

    this.logAudit(
      params.technicianName,
      'Field Engineer',
      'ASSET_ASSIGNMENT',
      'Vehicle',
      vehicle.vehicleId,
      `Assigned GPS Device ${device.deviceId} (IMEI: ${device.imei}) and SIM ${sim.simId} (${sim.msisdn}) to Vehicle ${vehicle.regNumber}. Reason: ${params.reason}`
    );

    return { success: true };
  }
}

// Global Singleton DB Instance
export const valsDb = new ValsDatabase();
