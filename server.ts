/**
 * VALS Tracking Enterprise Platform - Main Express Server
 * Ownership: VALS Tracking (Private) Limited
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { valsDb } from './src/server/db';
import { NumberingSequence } from './src/types/vals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());

  // --- API Routes ---

  // Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      platform: 'VALS Tracking Enterprise ERP + GPS Telematics Engine',
      version: '1.0.0-LOCKED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      counts: {
        customers: valsDb.customers.length,
        vehicles: valsDb.vehicles.length,
        devices: valsDb.devices.length,
        sims: valsDb.sims.length,
        installations: valsDb.installations.length,
        tickets: valsDb.tickets.length,
        inventoryItems: valsDb.inventoryItems.length,
        stockTransactions: valsDb.stockTransactions.length,
        auditLogs: valsDb.auditLogs.length,
      },
    });
  });

  // Foundation & System Settings
  app.get('/api/foundation', (_req: Request, res: Response) => {
    res.json({
      company: valsDb.company,
      branches: valsDb.branches,
      departments: valsDb.departments,
      warehouses: valsDb.warehouses,
      users: valsDb.users,
      numberingSequences: valsDb.numberingSequences,
    });
  });

  // Numbering Sequences
  app.get('/api/numbering-sequences', (_req: Request, res: Response) => {
    res.json(Object.values(valsDb.numberingSequences));
  });

  app.post('/api/numbering-sequences/next', (req: Request, res: Response) => {
    try {
      const { prefix } = req.body;
      if (!prefix || !valsDb.numberingSequences[prefix]) {
        res.status(400).json({ error: 'Valid prefix required (e.g. CUS, VEH, DEV, SIM, INS, TKT, INV)' });
        return;
      }
      const nextSeq = valsDb.getNextSequence(prefix as NumberingSequence['prefix']);
      valsDb.logAudit('API User', 'Operator', 'SEQUENCE_GENERATED', 'Sequence', prefix, `Generated next sequential identifier: ${nextSeq}`);
      res.json({ prefix, nextSequence: nextSeq });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Customers
  app.get('/api/customers', (_req: Request, res: Response) => {
    res.json(valsDb.customers);
  });

  app.post('/api/customers', (req: Request, res: Response) => {
    try {
      const customerId = valsDb.getNextSequence('CUS');
      const newCustomer = {
        id: `CUS-ROW-${Date.now()}`,
        customerId,
        registeredAt: new Date().toISOString(),
        creditLimit: req.body.creditLimit || 100000,
        paymentTerms: req.body.paymentTerms || 'Net 30 Days',
        status: req.body.status || 'Active',
        ...req.body,
      };
      valsDb.customers.unshift(newCustomer);
      valsDb.logAudit('Admin', 'Super Admin', 'CUSTOMER_CREATED', 'Customer', customerId, `Created customer account for ${newCustomer.name}`);
      res.status(201).json(newCustomer);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vehicles
  app.get('/api/vehicles', (_req: Request, res: Response) => {
    res.json(valsDb.vehicles);
  });

  app.post('/api/vehicles', (req: Request, res: Response) => {
    try {
      const vehicleId = valsDb.getNextSequence('VEH');
      const newVehicle = {
        id: `VEH-ROW-${Date.now()}`,
        vehicleId,
        createdAt: new Date().toISOString(),
        status: req.body.status || 'Registered',
        ...req.body,
      };
      valsDb.vehicles.unshift(newVehicle);
      valsDb.logAudit('Fleet Officer', 'NOC Operations Manager', 'VEHICLE_REGISTERED', 'Vehicle', vehicleId, `Registered vehicle: ${newVehicle.regNumber} (${newVehicle.make} ${newVehicle.model})`);
      res.status(201).json(newVehicle);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GPS Devices
  app.get('/api/devices', (_req: Request, res: Response) => {
    res.json(valsDb.devices);
  });

  app.post('/api/devices', (req: Request, res: Response) => {
    try {
      const deviceId = valsDb.getNextSequence('DEV');
      const newDevice = {
        id: `DEV-ROW-${Date.now()}`,
        deviceId,
        status: req.body.status || 'In Stock',
        ...req.body,
      };
      valsDb.devices.unshift(newDevice);
      valsDb.logAudit('Inventory Officer', 'Supply Chain', 'DEVICE_PROCURED', 'GpsDevice', deviceId, `Added device IMEI: ${newDevice.imei} Protocol: ${newDevice.protocol}`);
      res.status(201).json(newDevice);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // SIM Cards
  app.get('/api/sims', (_req: Request, res: Response) => {
    res.json(valsDb.sims);
  });

  app.post('/api/sims', (req: Request, res: Response) => {
    try {
      const simId = valsDb.getNextSequence('SIM');
      const newSim = {
        id: `SIM-ROW-${Date.now()}`,
        simId,
        status: req.body.status || 'Stock',
        ...req.body,
      };
      valsDb.sims.unshift(newSim);
      valsDb.logAudit('SIM Controller', 'Supply Chain', 'SIM_PROVISIONED', 'SimCard', simId, `Provisioned SIM: ${newSim.msisdn} (${newSim.carrier})`);
      res.status(201).json(newSim);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Asset Assignment & History
  app.get('/api/assignments/history', (_req: Request, res: Response) => {
    res.json(valsDb.historicalAssignments);
  });

  app.post('/api/assignments', (req: Request, res: Response) => {
    const { vehicleId, deviceId, simId, technicianName, reason, notes } = req.body;
    if (!vehicleId || !deviceId || !simId) {
      res.status(400).json({ error: 'vehicleId, deviceId, and simId are required' });
      return;
    }
    const result = valsDb.assignDeviceAndSimToVehicle({
      vehicleId,
      deviceId,
      simId,
      technicianName: technicianName || 'Field Engineer',
      reason: reason || 'Initial Installation',
      notes,
    });
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ success: true, message: 'Device and SIM assigned successfully with historical trail.' });
  });

  // Live Telematics & Current States
  app.get('/api/telemetry/states', (_req: Request, res: Response) => {
    const states = Array.from(valsDb.vehicleStates.values());
    res.json(states);
  });

  app.get('/api/telemetry/history', (_req: Request, res: Response) => {
    res.json(valsDb.telemetryHistory);
  });

  // Protocol Packet Decoder Endpoint
  app.post('/api/telemetry/packet-decoder', (req: Request, res: Response) => {
    const { protocol, rawHex } = req.body;
    if (!rawHex) {
      res.status(400).json({ error: 'rawHex payload string is required' });
      return;
    }

    let decoded: any;
    if (protocol === 'GT06' || rawHex.startsWith('7878') || rawHex.startsWith('7979')) {
      decoded = valsDb.decodeGT06Packet(rawHex);
    } else if (protocol === 'Teltonika' || rawHex.startsWith('00000000')) {
      decoded = valsDb.decodeTeltonikaPacket(rawHex);
    } else {
      res.status(400).json({ error: 'Unsupported protocol. Provide protocol: GT06 or Teltonika' });
      return;
    }

    if (decoded.error) {
      res.status(422).json({ error: decoded.error });
      return;
    }

    const state = valsDb.processTelemetry(decoded);
    res.json({
      success: true,
      protocol: decoded.protocol,
      decodedTelemetry: decoded,
      updatedVehicleState: state,
    });
  });

  // Simulate Telemetry Movement (For live road monitoring simulation)
  app.post('/api/telemetry/simulate-step', (req: Request, res: Response) => {
    const { vehicleId } = req.body;
    const targetVehId = vehicleId || 'VEH-ROW-001';
    let state = valsDb.vehicleStates.get(targetVehId);

    if (!state) {
      res.status(404).json({ error: 'Vehicle state not found' });
      return;
    }

    // Realistic Pakistani highway delta
    const dLat = (Math.random() - 0.45) * 0.003;
    const dLon = (Math.random() - 0.45) * 0.003;
    const newSpeed = state.ignition ? Math.floor(40 + Math.random() * 45) : 0;

    const telemetry = {
      deviceId: state.deviceId || 'DEV-000101',
      imei: state.imei || '868204041234567',
      vehicleId: targetVehId,
      timestamp: new Date().toISOString(),
      latitude: parseFloat((state.lastLatitude + dLat).toFixed(6)),
      longitude: parseFloat((state.lastLongitude + dLon).toFixed(6)),
      speed: newSpeed,
      heading: (state.heading + Math.floor(Math.random() * 20 - 10) + 360) % 360,
      ignition: state.ignition,
      gpsValid: true,
      batteryVoltage: parseFloat((12.4 + Math.random() * 1.4).toFixed(2)),
      externalPower: true,
      odometer: state.odometer + 1,
      protocol: state.protocol,
    };

    const updated = valsDb.processTelemetry(telemetry);
    res.json(updated);
  });

  // Installations & Field Service
  app.get('/api/installations', (_req: Request, res: Response) => {
    res.json(valsDb.installations);
  });

  app.post('/api/installations', (req: Request, res: Response) => {
    try {
      const orderNumber = valsDb.getNextSequence('INS');
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const newOrder = {
        id: `INS-ROW-${Date.now()}`,
        orderNumber,
        otpCode,
        otpVerified: false,
        status: 'Scheduled',
        checklist: [
          { id: 'CHK-1', label: 'Verify vehicle chassis & registration certificate', checked: false },
          { id: 'CHK-2', label: 'Inspect 12V/24V electrical battery stability', checked: false },
          { id: 'CHK-3', label: 'Mount GPS antenna with clear sky line-of-sight', checked: false },
          { id: 'CHK-4', label: 'Solder and heat-shrink ignition sense wire (ACC)', checked: false },
          { id: 'CHK-5', label: 'Install engine immobilizer relay safely', checked: false },
          { id: 'CHK-6', label: 'Test live packet transmission with NOC server', checked: false },
        ],
        ...req.body,
      };
      valsDb.installations.unshift(newOrder);
      valsDb.logAudit(req.body.technicianName || 'Supervisor', 'Field Service Supervisor', 'INSTALLATION_DISPATCHED', 'InstallationOrder', orderNumber, `Dispatched installation order for vehicle ${newOrder.vehicleReg}`);
      res.status(201).json(newOrder);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/installations/:id/verify-otp', (req: Request, res: Response) => {
    const { id } = req.params;
    const { otpCode } = req.body;
    const order = valsDb.installations.find(ins => ins.id === id || ins.orderNumber === id);
    if (!order) {
      res.status(404).json({ error: 'Installation order not found' });
      return;
    }
    if (order.otpCode !== otpCode) {
      res.status(400).json({ error: 'Incorrect Customer OTP Code. Verification failed.' });
      return;
    }

    order.otpVerified = true;
    order.status = 'Customer OTP Verified';
    valsDb.logAudit(order.technicianName, 'Field Technician', 'INSTALLATION_OTP_VERIFIED', 'InstallationOrder', order.orderNumber, `Customer verified OTP ${otpCode} for vehicle ${order.vehicleReg}`);
    res.json({ success: true, order });
  });

  // Support Tickets & SLA
  app.get('/api/tickets', (_req: Request, res: Response) => {
    res.json(valsDb.tickets);
  });

  app.post('/api/tickets', (req: Request, res: Response) => {
    try {
      const ticketNumber = valsDb.getNextSequence('TKT');
      const priority = req.body.priority || 'Medium';
      const slaHours = priority === 'Critical' ? 4 : priority === 'High' ? 8 : priority === 'Medium' ? 24 : 48;
      const now = new Date();
      const resolutionDue = new Date(now.getTime() + slaHours * 3600000).toISOString();
      const responseDue = new Date(now.getTime() + (slaHours / 4) * 3600000).toISOString();

      const newTicket = {
        id: `TKT-ROW-${Date.now()}`,
        ticketNumber,
        priority,
        status: 'Open',
        slaResponseHours: slaHours / 4,
        slaResolutionHours: slaHours,
        createdAt: now.toISOString(),
        responseDueAt: responseDue,
        resolutionDueAt: resolutionDue,
        isOverdue: false,
        ...req.body,
      };
      valsDb.tickets.unshift(newTicket);
      valsDb.logAudit(req.body.assignedTo || 'Support Desk', 'Customer Support Agent', 'TICKET_CREATED', 'SupportTicket', ticketNumber, `Created complaint: ${newTicket.title} (Priority: ${newTicket.priority})`);
      res.status(201).json(newTicket);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Inventory & Stock Transactions
  app.get('/api/inventory/items', (_req: Request, res: Response) => {
    res.json(valsDb.inventoryItems);
  });

  app.get('/api/inventory/transactions', (_req: Request, res: Response) => {
    res.json(valsDb.stockTransactions);
  });

  app.post('/api/inventory/transactions', (req: Request, res: Response) => {
    const result = valsDb.executeStockTransaction(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(result.transaction);
  });

  // Finance, AMC & Billing
  app.get('/api/finance/packages', (_req: Request, res: Response) => {
    res.json(valsDb.packages);
  });

  app.get('/api/finance/amc', (_req: Request, res: Response) => {
    res.json(valsDb.amcContracts);
  });

  app.get('/api/finance/invoices', (_req: Request, res: Response) => {
    res.json(valsDb.invoices);
  });

  // Audit Trail & API Hub
  app.get('/api/audit-logs', (_req: Request, res: Response) => {
    res.json(valsDb.auditLogs);
  });

  app.get('/api/api-clients', (_req: Request, res: Response) => {
    res.json(valsDb.apiClients);
  });

  // Vite Middlewares in Development or Static Files in Production
  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VALS Tracking Enterprise Platform] Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
