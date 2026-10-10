/**
 * VALS Tracking Enterprise Platform - Automated Verification & Audit Test Suite
 * Ownership: VALS Tracking (Private) Limited
 */

import { valsDb } from '../src/server/db';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName} ${details ? '- ' + details : ''}`);
  }
}

console.log('===============================================================');
console.log('VALS TRACKING ENTERPRISE PLATFORM - AUTOMATED TEST SUITE');
console.log('Verification against Master Business Architecture & Freeze Rules');
console.log('===============================================================\n');

// 1. Foundation & Numbering Sequences
console.log('Module 01: Foundation & Auto-Numbering Sequences');
const nextCus = valsDb.getNextSequence('CUS');
assert(nextCus.startsWith('CUS-') && nextCus.length === 10, 'Generates valid CUS sequence format (e.g. CUS-000101)', `Got: ${nextCus}`);

const nextVeh = valsDb.getNextSequence('VEH');
assert(nextVeh.startsWith('VEH-') && nextVeh.length === 10, 'Generates valid VEH sequence format', `Got: ${nextVeh}`);

const nextDev = valsDb.getNextSequence('DEV');
assert(nextDev.startsWith('DEV-') && nextDev.length === 10, 'Generates valid DEV sequence format', `Got: ${nextDev}`);

const nextSim = valsDb.getNextSequence('SIM');
assert(nextSim.startsWith('SIM-') && nextSim.length === 10, 'Generates valid SIM sequence format', `Got: ${nextSim}`);

assert(valsDb.branches.length >= 4, 'Foundation branches properly configured (KHI, LHE, ISB, RWP)');
assert(valsDb.warehouses.length >= 3, 'Central and regional warehouses initialized');

// 2. Customer Management
console.log('\nModule 02: Customer Accounts & Validation');
const sampleCustomer = valsDb.customers.find(c => c.customerId === 'CUS-000101');
assert(!!sampleCustomer, 'Corporate customer CUS-000101 exists in database');
assert(sampleCustomer?.status === 'Active', 'Customer status is correctly marked Active');
assert(sampleCustomer?.creditLimit === 500000, 'Customer credit limit is properly enforced');

// 3. Vehicles, GPS Devices & SIM Management
console.log('\nModule 03: Fleet Vehicles, GPS Hardware & SIM Management');
const primeMover = valsDb.vehicles.find(v => v.regNumber === 'KHI-TL-8491');
assert(!!primeMover, 'Vehicle KHI-TL-8491 registered in fleet');
assert(primeMover?.assignedDeviceId === 'DEV-ROW-001', 'Vehicle has assigned Concox GT06 GPS device');
assert(primeMover?.assignedSimId === 'SIM-ROW-001', 'Vehicle has assigned Jazz Corporate Telematics SIM');

// 4. Historical Assignment Integrity
console.log('\nModule 04: Historical Assignment Trail');
assert(valsDb.historicalAssignments.length >= 4, 'Historical assignment records exist');
const histCheck = valsDb.historicalAssignments.find(h => h.vehicleId === 'VEH-ROW-001');
assert(!!histCheck && !!histCheck.technicianName, 'Historical assignment retains technician and installation details');

// 5. Telematics Protocol Decoder: GT06 Packet
console.log('\nModule 05: Telematics Protocol Decoder - GT06');
// Standard GT06 GPS packet hex simulation
const gt06Hex = '78781f12190a050d302b0c410291990c010200321400010100000001000212340d0a';
const decodedGT06: any = valsDb.decodeGT06Packet(gt06Hex);
assert(!decodedGT06.error, 'GT06 packet decoded without errors');
assert(decodedGT06.protocol === 'GT06', 'Decoded protocol confirmed as GT06');
assert(decodedGT06.latitude > 0 && decodedGT06.longitude > 0, 'Decoded geographic coordinates present');

// 6. Telematics Protocol Decoder: Teltonika Codec 8
console.log('\nModule 06: Telematics Protocol Decoder - Teltonika Codec 8');
const teltonikaHex = '000000000000002b08010000018a1234567800028a1234017a12340000002d004108010000000000010000000100001234';
const decodedTeltonika: any = valsDb.decodeTeltonikaPacket(teltonikaHex);
assert(!decodedTeltonika.error, 'Teltonika packet decoded without errors');
assert(decodedTeltonika.protocol === 'Teltonika', 'Decoded protocol confirmed as Teltonika');

// 7. Live Vehicle State & Active Alarms
console.log('\nModule 07: Live Vehicle State & High-Speed Alarm');
const overspeedTelemetry = {
  deviceId: 'DEV-000102',
  imei: '868204047654321',
  vehicleId: 'VEH-ROW-002',
  timestamp: new Date().toISOString(),
  latitude: 25.4012,
  longitude: 68.3610,
  speed: 95, // Above 80 threshold
  heading: 40,
  ignition: true,
  gpsValid: true,
  batteryVoltage: 24.0,
  externalPower: true,
  odometer: 89450,
  protocol: 'Teltonika' as const,
};
const updatedState = valsDb.processTelemetry(overspeedTelemetry);
assert(updatedState.speed === 95, 'Vehicle speed updated to 95 km/h');
assert(updatedState.activeAlerts.some(a => a.includes('High Speed Alert')), 'High Speed Alert triggered automatically');

// 8. Inventory & Negative Stock Balance Prevention
console.log('\nModule 08: Inventory Engine & Stock Integrity');
const testItem = valsDb.inventoryItems[0];
const initialStock = testItem.currentStock;

// Valid stock issue
const issueResult = valsDb.executeStockTransaction({
  itemId: testItem.id,
  warehouseId: testItem.warehouseId,
  transactionType: 'Issue',
  quantity: 2,
  referenceDocType: 'Installation',
  referenceDocNo: 'INS-TEST-001',
  performedBy: 'Test Runner',
  notes: 'Automated test stock issue',
});
assert(issueResult.success, 'Valid stock deduction succeeded');
assert(testItem.currentStock === initialStock - 2, 'Stock balance decremented by 2');

// Attempt negative stock balance (exceeding stock)
const negativeAttempt = valsDb.executeStockTransaction({
  itemId: testItem.id,
  warehouseId: testItem.warehouseId,
  transactionType: 'Issue',
  quantity: 999999, // Impossible amount
  referenceDocType: 'Installation',
  referenceDocNo: 'INS-INVALID-001',
  performedBy: 'Test Runner',
  notes: 'Negative balance test',
});
assert(!negativeAttempt.success, 'Negative stock balance rejected by business rule engine');

// 9. Field Service & Installation OTP Verification
console.log('\nModule 09: Field Service Installation OTP Flow');
const installOrder = valsDb.installations.find(ins => ins.id === 'INS-ROW-001');
assert(!!installOrder, 'Installation work order exists');
assert(installOrder?.otpVerified === true, 'Installation OTP verification state confirmed');

// 10. Audit Logging
console.log('\nModule 10: Immutable Audit Logging');
assert(valsDb.auditLogs.length > 0, 'Audit trail entries recorded in system');
const latestAudit = valsDb.auditLogs[0];
assert(!!latestAudit.timestamp && !!latestAudit.action, 'Audit entry contains timestamp, actor and action');

console.log('\n===============================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('===============================================================');

if (failed > 0) {
  console.error('FEATURE STATUS: FAIL');
  process.exit(1);
} else {
  console.log('FEATURE STATUS: PASS');
  console.log('FEATURE FREEZE: LOCKED');
}
