# VALS Tracking Enterprise Platform — System Architecture

**Project Owner:** VALS Tracking (Private) Limited  
**Platform Type:** Enterprise Fleet & GPS Operations Management Platform (ERP + CRM + FSM + GPS Operations + Finance)

---

## 1. Architectural Philosophy

VALS Tracking Enterprise uses a **Clean Modular Monolith** architecture. Unnecessary microservices are prohibited to eliminate distributed transaction failures, network latency, and operational fragility.

### Architecture Pipeline
```text
[Browser / Mobile / Webhook]
             ↓
[React 19 + TypeScript + Inertia.js / REST API]
             ↓
[Laravel 13 Routing & Middleware Stack]
             ↓
[Form Requests / Authorization Gates & Policies]
             ↓
[Application & Domain Services]
  ├── NumberingSequenceService (Atomic Locking)
  ├── ProtocolResolver (Telematics Router)
  ├── Gt06Decoder / TeltonikaDecoder
  ├── StockTransactionService (Negative Balance Barrier)
  └── AuditLogService (Tamper-evident Audit Trail)
             ↓
[Eloquent ORM Models & Domain Enums]
             ↓
[MySQL 8.4 LTS (InnoDB Engine, utf8mb4, Strict Mode)]
```

---

## 2. Co-existence & Migration Baseline

The platform currently maintains two clearly demarcated layers:
1. **Functional Prototype Baseline:**
   - Located in `server.ts`, `src/server/db.ts`, `src/App.tsx`, and `tests/run-tests.ts`.
   - Runs in Node.js / Express on Port 3000.
   - Provides an immediately executable, fully verified 28-test baseline in sandbox and local dev environments.
2. **Production Laravel 13 Foundation:**
   - Standard Laravel directory tree (`app/`, `bootstrap/`, `config/`, `database/`, `resources/`, `routes/`, `tests/`).
   - Prepared for PHP 8.5, Laravel 13, MySQL 8.4, and Inertia.js.
   - Target server path: `C:\wamp64\www\vals-tracking-enterprise`.

---

## 3. Telematics Processing Architecture

GPS Telematics operates through a decoupled protocol pipeline:
```text
Incoming GPS Payload
        ↓
App\Services\Telematics\ProtocolResolver
        ↓
  ├── GT06 Parser (App\Services\Telematics\Gt06Decoder)
  └── Teltonika Codec 8/8E Parser (App\Services\Telematics\TeltonikaDecoder)
        ↓
App\DTO\NormalizedTelemetry
        ↓
App\Services\Telematics\TelemetryProcessor
        ↓
  ├── Updates 'vehicle_current_states' (single-row indexed state cache)
  ├── Appends to 'telemetry_history' (partitionable historical breadcrumbs)
  └── Dispatches threshold alerts (Overspeed, Power Cut, Geofence breach)
```
Production code never injects synthetic GPS data; simulation is strictly quarantined to development and testing environments.

---

## 4. Master Numbering Sequences

All identifiers are generated server-side within a database transaction enforcing row locks (`SELECT ... FOR UPDATE`):
- Customer: `CUS-000001`
- Vehicle: `VEH-000001`
- GPS Device: `DEV-000001`
- SIM Card: `SIM-000001`
- Installation: `INS-000001`
- Support Ticket: `TKT-000001`
- AMC Contract: `AMC-000001`
- Invoice: `INV-000001`
- Purchase Order: `PO-000001`
- Sales Order: `SO-000001`
- Purchase Request: `PR-000001`
