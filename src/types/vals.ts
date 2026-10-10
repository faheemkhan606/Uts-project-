/**
 * VALS Tracking Enterprise Platform - Core Domain Types
 * Ownership: VALS Tracking (Private) Limited
 */

export type RoleName = 
  | 'Super Admin'
  | 'NOC Operations Manager'
  | 'Monitoring Officer'
  | 'Field Service Supervisor'
  | 'Field Technician'
  | 'Billing & Accounts Officer'
  | 'Customer Support Agent'
  | 'Inventory Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleName;
  departmentId: string;
  branchId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  legalName: string;
  tradeName: string;
  ntn: string;
  strn: string;
  incorporationNo: string;
  headOfficeAddress: string;
  city: string;
  country: string;
  primaryPhone: string;
  emergencyNocPhone: string;
  email: string;
  website: string;
  currency: string;
  timezone: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  address: string;
  phone: string;
  managerName: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  employeeCount: number;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  location: string;
  capacity: string;
  managerName: string;
  isActive: boolean;
}

export interface NumberingSequence {
  id: string;
  prefix: 'CUS' | 'VEH' | 'DEV' | 'SIM' | 'PR' | 'PO' | 'SO' | 'INS' | 'TKT' | 'AMC' | 'INV';
  entity: string;
  currentNumber: number;
  step: number;
  padding: number;
  delimiter: string;
  format: string; // e.g. CUS-{000000}
}

export interface Customer {
  id: string;
  customerId: string; // CUS-000001
  customerType: 'Company' | 'Individual';
  name: string;
  companyName?: string;
  contactPerson: string;
  nationalIdOrReg: string; // CNIC or NTN
  phone: string;
  whatsapp: string;
  email: string;
  billingAddress: string;
  city: string;
  province: string;
  salesRep: string;
  accountManager: string;
  status: 'Lead' | 'Prospect' | 'Active' | 'Suspended' | 'Inactive' | 'Closed';
  packageId?: string;
  creditLimit: number;
  paymentTerms: string;
  registeredAt: string;
  notes?: string;
}

export type VehicleStatus = 
  | 'Registered'
  | 'Device Assigned'
  | 'Installation Pending'
  | 'Installed'
  | 'Activated'
  | 'Monitoring'
  | 'Suspended'
  | 'Maintenance'
  | 'Deactivated'
  | 'Archived';

export interface Vehicle {
  id: string;
  vehicleId: string; // VEH-000001
  regNumber: string;
  vehicleType: 'Sedan' | 'SUV' | 'Light Truck' | 'Heavy Trailer' | 'Motorcycle' | 'Bus' | 'Van' | 'Construction Equipment';
  make: string;
  model: string;
  year: number;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  customerId: string;
  driverName?: string;
  driverPhone?: string;
  assignedDeviceId?: string;
  assignedSimId?: string;
  installationId?: string;
  status: VehicleStatus;
  packageId?: string;
  insuranceExpiry?: string;
  registrationExpiry?: string;
  createdAt: string;
}

export type GpsProtocol = 
  | 'GT06'
  | 'Teltonika'
  | 'Concox'
  | 'Queclink'
  | 'SinoTrack'
  | 'TKStar'
  | 'GenericHTTP';

export type DeviceLifecycleStatus = 
  | 'Procured'
  | 'Received'
  | 'In Stock'
  | 'Reserved'
  | 'Assigned'
  | 'Installed'
  | 'Active'
  | 'Maintenance'
  | 'Replaced'
  | 'Returned'
  | 'Retired';

export interface GpsDevice {
  id: string;
  deviceId: string; // DEV-000001
  imei: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  protocol: GpsProtocol;
  firmwareVersion: string;
  status: DeviceLifecycleStatus;
  vendor: string;
  purchaseDate: string;
  purchaseCost: number;
  warehouseId: string;
  customerId?: string;
  assignedVehicleId?: string;
  warrantyExpiry: string;
  notes?: string;
}

export type SimStatus = 
  | 'Procured'
  | 'Stock'
  | 'Assigned'
  | 'Active'
  | 'Suspended'
  | 'Replaced'
  | 'Deactivated';

export interface SimCard {
  id: string;
  simId: string; // SIM-000001
  iccid: string;
  msisdn: string; // Mobile Number
  carrier: 'Jazz' | 'Zong' | 'Telenor' | 'Ufone' | 'Other';
  packageName: string;
  monthlyCost: number;
  activationDate?: string;
  expiryDate?: string;
  status: SimStatus;
  customerId?: string;
  assignedVehicleId?: string;
  assignedDeviceId?: string;
  notes?: string;
}

export interface HistoricalAssignment {
  id: string;
  vehicleId: string;
  deviceId: string;
  simId: string;
  assignedAt: string;
  removedAt?: string;
  technicianName: string;
  installationId?: string;
  reason: 'Initial Installation' | 'Device Upgrade' | 'SIM Replacement' | 'Defective Swap' | 'De-installation';
  notes?: string;
}

export interface NormalizedTelemetry {
  deviceId: string;
  imei: string;
  vehicleId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  ignition: boolean;
  gpsValid: boolean;
  batteryVoltage: number; // Volts
  externalPower: boolean;
  odometer: number; // km
  fuelLevel?: number; // %
  engineHours?: number;
  rawPayload?: string;
  protocol: GpsProtocol;
}

export interface CurrentVehicleState {
  vehicleId: string;
  regNumber: string;
  customerId: string;
  customerName: string;
  deviceId?: string;
  imei?: string;
  simNumber?: string;
  lastLatitude: number;
  lastLongitude: number;
  lastUpdate: string;
  speed: number;
  heading: number;
  ignition: boolean;
  onlineStatus: 'online' | 'idle' | 'offline';
  gpsValid: boolean;
  batteryVoltage: number;
  externalPower: boolean;
  odometer: number;
  activeAlerts: string[];
  protocol: GpsProtocol;
}

export type InstallationStatus = 
  | 'Requested'
  | 'Assigned'
  | 'Scheduled'
  | 'Technician Checked-In'
  | 'In Progress'
  | 'Testing GPS'
  | 'Customer OTP Verified'
  | 'Completed'
  | 'Cancelled';

export interface InstallationChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface InstallationOrder {
  id: string;
  orderNumber: string; // INS-000001
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleReg: string;
  deviceId: string;
  deviceImei: string;
  simId: string;
  simMsisdn: string;
  technicianId: string;
  technicianName: string;
  scheduledDate: string;
  installationAddress: string;
  city: string;
  status: InstallationStatus;
  checklist: InstallationChecklistItem[];
  otpCode: string;
  otpVerified: boolean;
  signatureName?: string;
  checkInTime?: string;
  completedTime?: string;
  notes?: string;
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Customer'
  | 'Waiting for Internal Action'
  | 'Resolved'
  | 'Closed'
  | 'Cancelled';

export interface SupportTicket {
  id: string;
  ticketNumber: string; // TKT-000001
  customerId: string;
  customerName: string;
  vehicleId?: string;
  vehicleReg?: string;
  category: 'Tracker Offline' | 'Ignition Anomaly' | 'Hardware Issue' | 'SIM / Data Issue' | 'Billing Inquiry' | 'Relocation' | 'General';
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  slaResponseHours: number;
  slaResolutionHours: number;
  createdAt: string;
  responseDueAt: string;
  resolutionDueAt: string;
  respondedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  isOverdue: boolean;
}

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g. ITM-001
  name: string;
  category: 'GPS Hardware' | 'SIM Cards' | 'Relays & Harnesses' | 'Batteries' | 'Antennas' | 'Tools';
  unit: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  minReorderLevel: number;
  isSerialised: boolean;
  serialList?: string[]; // IMEIs or ICCIDs
  unitCost: number;
}

export interface StockTransaction {
  id: string;
  transactionNumber: string;
  itemId: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  transactionType: 'Receipt' | 'Issue' | 'Return' | 'Damage' | 'Adjustment';
  quantity: number;
  serialNumber?: string;
  referenceDocType: 'Purchase Order' | 'Installation' | 'Maintenance' | 'Manual Adjustment';
  referenceDocNo: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface PackagePlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  installationFee: number;
  deviceFee: number;
  features: string[];
  isActive: boolean;
}

export interface AmcContract {
  id: string;
  contractNumber: string; // AMC-000001
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleReg: string;
  startDate: string;
  endDate: string;
  coverage: string;
  annualFee: number;
  status: 'Draft' | 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed' | 'Cancelled';
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-000001
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
}

export interface ApiClient {
  id: string;
  name: string;
  clientId: string;
  apiKey: string;
  permissions: string[];
  rateLimitPerMin: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookConfig {
  id: string;
  targetUrl: string;
  secret: string;
  events: ('device.online' | 'device.offline' | 'alert.overspeed' | 'alert.power_cut' | 'alert.geofence' | 'installation.completed' | 'ticket.created')[];
  isActive: boolean;
  createdAt: string;
}
