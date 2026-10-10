# VALS Tracking Enterprise Platform — Phase 02 Customer Architecture Specification
## Phase 02 · Step 01 · Feature 01: Architecture Inspection & Domain Boundary

---

## 1. Executive Summary & Purpose

Phase 02 of the VALS Tracking Enterprise Platform establishes the **Customer & CRM Foundation**. 

Following the completion and code freeze of Phase 01 (Foundation, Authentication, RBAC, Organization, System Settings, Numbering, and Audit), Step 01 defines the master architectural blueprint and domain boundaries for customer management before any database migrations, Eloquent models, controllers, or user interfaces are created.

This document serves as the master architectural reference for Customer Master management, ensuring rigorous modularity, tenant isolation, and seamless reuse of all Phase 01 foundational services.

---

## 2. Phase 01 Dependency Audit & Reuse Strategy

Customer Management is built directly upon the frozen Phase 01 foundation. No parallel or duplicate foundational mechanisms shall be created.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PHASE 01 FOUNDATIONAL SUBSYSTEMS                     │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│ Authentication  │      RBAC       │   Organization   │   Auto-Number   │
│  (Session Guard)│ (Gates/Policies)│ (Company/Branch) │ (NumberSequence)│
├─────────────────┴─────────────────┼──────────────────┴─────────────────┤
│            Audit Trail            │          System Settings           │
│        (AuditLogService)          │       (SystemSettingsService)      │
└───────────────────────────────────┴────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│              PHASE 02: CUSTOMER & CRM FOUNDATION (STEP 01)             │
│   • Master Identity  • Contacts  • Addresses  • Documents  • Groups   │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Authentication Foundation (Step 03)
- **Component Reused:** Laravel `web` session guard, HttpOnly/SameSite session cookies, CSRF protection, and inactive account lockout (`User::isActive()`).
- **Integration Rule:** All Customer web endpoints and Inertia pages require active, authenticated user sessions. Unauthenticated or inactive users are rejected immediately.

### 2.2. RBAC Foundation (Step 04)
- **Component Reused:** Normalized roles (`SUPER_ADMIN`, `OPERATIONS_MANAGER`, `SALES_MANAGER`, `FINANCE_MANAGER`, etc.), dynamic permissions (`customers.view`, `customers.create`, `customers.update`, `customers.delete`, `customers.export`, `customers.documents.verify`), and `AppServiceProvider` Gate infrastructure.
- **Integration Rule:** Access to customer records is governed server-side via `CustomerPolicy` and Gate definitions. The frontend `useAuthorization` React hook is used strictly for conditional rendering and UI ergonomics; the server never trusts client-side authorization claims.

### 2.3. Organization Foundation (Step 05)
- **Component Reused:** `Company`, `Branch`, `Department`, and `OrganizationService`.
- **Integration Rule:** Every customer record must belong strictly to a valid `Company` and a valid servicing `Branch`.
- **Integrity Enforcement:** Customer creation and updates must invoke `OrganizationService::validateBranchBelongsToCompany($branchId, $companyId)`. Cross-company branch assignments are rejected at the service layer.

### 2.4. Numbering Foundation (Step 02)
- **Component Reused:** `NumberingSequence` model and database table (`numbering_sequences`).
- **Integration Rule:** Customer numbering must reuse the existing sequence architecture (`prefix = 'CUS'`). No separate sequence table, file counter, or random ID generator may be introduced.
- **Concurrency & Formatting:** Sequence generation is atomic via `SELECT ... FOR UPDATE` incrementing `current_number`, producing standardized identifiers (e.g. `CUS-000101`).

### 2.5. Audit Foundation (Step 02 & Step 07)
- **Component Reused:** `AuditLogService` and `audit_logs` table.
- **Integration Rule:** Every customer creation, update, status change, contact addition, address modification, document upload, and deletion must log an append-only event recording `actor_name`, `actor_role`, `action`, `entity_type = 'Customer'`, `entity_id`, and redacted `details`. No separate customer audit table will be created.

### 2.6. System Settings Foundation (Step 06 & Step 07)
- **Component Reused:** `SystemSettingsService` with multi-level scoping (`global`, `company`, `branch`, `user`).
- **Integration Rule:** Future customer-related defaults (e.g., default payment terms, default credit limits, mandatory document requirements) will be fetched through `SystemSettingsService::resolve()`, enabling company- or branch-level customization without schema changes.

---

## 3. Customer Domain Boundaries & Modular Decoupling

The Customer domain owns customer identity, master contact channels, and compliance documents. All other operational and commercial capabilities are strictly decoupled:

### 3.1. Customer Master vs CRM & Sales Funnel
- **Customer Master:** Represents an established, legally verified, and contracted business entity.
- **CRM / Sales (Future Phase):** Responsible for transient leads, prospecting pipelines, deal stages, quotations, follow-up calls, and conversion workflows.
- **Boundary Rule:** A Lead is **not** a Customer. Leads remain in CRM tables. Only upon formal commercial onboarding is a Customer Master record provisioned (`leads.converted_customer_id = customers.id`).

### 3.2. Out-of-Scope Domains (Strictly Prohibited in Step 01)
- **Fleet Vehicles (Phase 03):** Vehicle registrations, chassis, engine numbers, and vehicle configurations belong to the Vehicle domain. The Customer is solely a foreign key parent (`vehicles.customer_id`).
- **Hardware & SIM Inventory (Phase 04):** GPS devices (`DEV-XXXXXX`), IMEI, cellular SIMs (`SIM-XXXXXX`), IMSI, and protocol configurations belong strictly to Hardware/SIM inventory.
- **Telematics & NOC Monitoring:** Live GPS coordinates, telemetry streams, and alarms belong to Telematics/NOC processors.
- **Field Service & Installations (FSM):** Installation orders (`INS-XXXXXX`), technician schedules, and OTP verification belong to FSM.
- **Service Desk & Ticketing:** Support tickets (`TKT-XXXXXX`) and SLA escalation matrices belong to Service Management.
- **Invoicing & Finance:** Sales invoices (`INV-XXXXXX`), receivables, payment receipts, and taxation belong to Finance/Billing.
- **Inventory & Warehouses:** Stock balances, bin locations, and physical warehouse movements belong to Supply Chain.

---

## 4. Organization Scope & Multi-Tier Tenant Isolation

Customer records operate within the hierarchical organization framework:

$$\text{Company} \longrightarrow \text{Branch} \longrightarrow \text{Customer}$$

### 4.1. Tenancy Rules:
1. **Company Scope:** A customer is owned by a single enterprise `Company`. Users belonging to Company A can never view or modify customers of Company B.
2. **Branch Scope:** A customer is assigned to a primary servicing `Branch` (e.g. Karachi Branch, Lahore Branch). Branch managers and local dispatchers can only access customers belonging to their assigned branch.
3. **Corporate & Super Admin Scope:** Super Admins and corporate executive users without a specific branch assignment (`branch_id = null`) have company-wide or global operational visibility across all branches.
4. **Reseller / Dealer Scope (Future):** When Reseller/Dealer customer types access customer portals, their visibility will be restricted to their sub-accounts through dedicated scoping policies without modifying the core Customer Master table.

---

## 5. Insecure Direct Object Reference (IDOR) & Authorization Strategy

To prevent unauthorized direct ID access (e.g. a user altering URL `/customers/101` to `/customers/102` belonging to another company or unauthorized branch), authorization is enforced through a **defense-in-depth model**:

```
[ Incoming Request: GET /customers/{id} ]
                 │
                 ▼
1. Authentication Layer (auth:web, active user check)
                 │
                 ▼
2. RBAC Permission Gate (Gate::allows('customers.view'))
                 │
                 ▼
3. Eloquent Model Binding & Existence Check
                 │
                 ▼
4. Policy Authorization (CustomerPolicy::view($user, $customer))
   • Enforces $user->company_id === $customer->company_id
   • Enforces $user->branch_id === null || $user->branch_id === $customer->branch_id
                 │
                 ▼
5. Service-Layer Data Scoping (Controller / Query Scope)
                 │
                 ▼
[ Authorized Payload Returned to Controller / View ]
```

### Key Principles:
- **Zero Trust in Frontend:** React UI state or navigation guards are purely cosmetic; every single backend request executes the 5-layer check.
- **Immediate 403 / 404 Response:** Any cross-company IDOR attempt returns an immediate 403 Forbidden or 404 Not Found to prevent data exposure or record enumeration.

---

## 6. Future Customer Subdomains

The Customer entity is decomposed into normalized subdomains to ensure clean relational integrity:

1. **Customer Contacts (`customer_contacts`):**
   - Multiple contact persons per customer.
   - Distinct operational flags: `is_primary_contact`, `is_billing_contact`, `is_emergency_noc_contact`.
2. **Customer Addresses (`customer_addresses`):**
   - Multiple locations: Head Office, Billing Office, Depots, Dispatch Yards, Workshops.
   - Includes geographic coordinates (`latitude`, `longitude`) for future NOC geofencing integration.
3. **Customer Compliance Documents (`customer_documents`):**
   - Metadata and secure private storage paths for KYC documents (CNIC, NTN, STRN, incorporation deeds).
   - Includes audit attributes: `issue_date`, `expiry_date`, `is_verified`, `verified_by`.
4. **Customer Groups & Classifications (`customer_groups`, `customer_group_customer`):**
   - Extensible grouping (e.g. "VIP Logistics", "Sindh Police Fleet", "Govt Tender") without schema alteration.
5. **Customer 360 Aggregation (Future Read-Only View):**
   - An aggregated operational summary consolidating active vehicles, hardware units, recent service tickets, open billing invoices, and emergency contacts into a single composite cockpit for NOC and customer support agents.

---

## 7. Customer Numbering Architecture

- **Engine:** Reuses the Phase 01 `NumberingSequence` model and database table (`numbering_sequences`).
- **Prefix:** `'CUS'`.
- **Default Format:** `{PREFIX}-{NUMBER}` with 6-digit zero padding (e.g., `CUS-000101`).
- **Concurrency Protection:** Number allocation is wrapped in a database transaction with pessimistic row-level locking (`DB::table('numbering_sequences')->where('prefix', 'CUS')->lockForUpdate()->first()`).
- **Tenant Scope:** While the global prefix is `CUS`, sequence generation supports company-scoped sequences where multi-firm tenancy mandates independent series.

---

## 8. Search Architecture & Indexing Strategy

Customer search will support rapid query resolution across hundreds of thousands of records without full table scans:

### Indexed Fields:
- `customers.customer_no`: Exact match lookup via unique index.
- `customers.legal_name`, `customers.trade_name`: Prefix and text search via B-tree index.
- `customers.primary_phone`: Phone number lookup.
- `customers.tax_number`, `customers.national_id`: Composite index for rapid KYC and duplicate detection.
- `customers.status`: State filtering (active vs suspended).
- `customers.company_id`, `customers.branch_id`: Composite tenancy isolation index.

---

## 9. Security, Sensitive Data (PII) & Compliance

1. **Personally Identifiable Information (PII):**
   - National identifiers (CNIC, Civil ID) and tax numbers (NTN, STRN) are classified as sensitive PII.
   - PII must be masked in application logs and audit trail entries (`[REDACTED]`).
2. **Document File Storage:**
   - Compliance documents (CNIC scans, incorporation certs, tax exemptions) must **never** be stored in public web storage (`/public`).
   - Files must reside in protected private storage (`storage/app/private/customers/...`) served only through authenticated, policy-guarded streaming controllers.
3. **Non-Repudiation:**
   - Any modification to customer identity, tax attributes, or banking/billing terms must be immutably recorded in `audit_logs`.

---

## 10. Prototype Compatibility & Non-Destructive Migration Plan

### Current Prototype State:
- The Express prototype (`server.ts`, `src/server/db.ts`, `src/components/CustomersView.tsx`) provides an operational in-memory customer ledger with 28/28 automated regression tests passing (`tests/run-tests.ts`).
- Sample corporate customer `CUS-000101` is actively verified in Module 02 of the test suite.

### Non-Destructive Migration Roadmap:
1. **Preservation:** The prototype backend and UI remain 100% operational on Port 3000 throughout Phase 02 development.
2. **Shadow Implementation:** Production Laravel migrations, models, services, requests, and Inertia components are developed in clean, isolated paths (`database/migrations/2025_01_01_000005_...`, `app/Models/Customer.php`, `resources/js/Pages/Customers/...`).
3. **Data Parity:** The database seeder (`CustomerSeeder`) will seed baseline accounts including `CUS-000101` to maintain complete data consistency between the prototype and production environments.
4. **Zero Regressions:** Every development step executes the 28-test automated regression suite to ensure zero collateral damage to prototype functionality.

---

## 11. Answers to Mandatory Architecture Audit Questions

1. **What is the exact responsibility of Customer Management?**
   Authoritative management of customer legal identity, taxonomy, organizational branch assignment, operational lifecycle status, master contacts, physical addresses, and compliance KYC documents.
2. **What is explicitly outside Customer Management?**
   Vehicles, GPS tracking hardware, telematics SIMs, live GPS tracking, field installation orders, trouble tickets, billing/invoicing, physical stock inventory, sales leads/pipeline, and notifications.
3. **How does Customer relate to Company?**
   Direct parent-child foreign key relationship (`customers.company_id -> companies.id`). A customer belongs strictly to one company.
4. **How does Customer relate to Branch?**
   Direct foreign key relationship (`customers.branch_id -> branches.id`). A customer is serviced by a specific regional branch.
5. **How will user access be scoped?**
   Via `User::getOrganizationScope()`. Branch-level users can only query customers belonging to their assigned `branch_id`; company-level users can query all customers within their `company_id`.
6. **How will IDOR be prevented?**
   Through a 5-layer server-side authorization stack: Authentication -> Gate check -> Model binding -> `CustomerPolicy` company/branch matching -> Query scoping.
7. **How will Customer numbering reuse Phase 01?**
   By querying the existing `numbering_sequences` table with `prefix = 'CUS'` using atomic pessimistic row locking.
8. **How will Customer audit reuse Phase 01?**
   By invoking `AuditLogService::log()` on every customer mutation to write append-only records to `audit_logs`.
9. **How will Customer permissions integrate with existing RBAC?**
   Through permissions (`customers.view`, `customers.create`, `customers.update`, `customers.delete`, `customers.export`) mapped to existing roles in `RolePermissionSeeder`.
10. **How will Contacts relate to Customer?**
    Via a normalized 1:N relational table (`customer_contacts`) with foreign key `customer_id` and role flags (`is_primary_contact`, `is_emergency_noc_contact`).
11. **How will Addresses relate to Customer?**
    Via a normalized 1:N relational table (`customer_addresses`) supporting multiple locations and geocoordinates.
12. **How will Documents relate to Customer?**
    Via a normalized 1:N relational table (`customer_documents`) storing metadata and secure private storage links.
13. **How will Groups/Classifications relate to Customer?**
    Via a many-to-many relationship (`customer_groups` and `customer_group_customer`).
14. **What belongs to future CRM?**
    Sales leads, prospecting workflows, opportunity qualification, quotations, sales calls, and conversion pipelines.
15. **What belongs to future Vehicles/GPS?**
    Vehicle registration plates, chassis/engine numbers, GPS hardware trackers, cellular SIMs, and live telematics protocols.
16. **What belongs to future Finance?**
    Invoices, credit notes, payment vouchers, ledger accounting, and tax filing reconciliations.
17. **What belongs to future Service/Tickets?**
    Customer support complaints, trouble tickets, technician field visits, and warranty claims.
18. **Which database tables are actually required?**
    `customers`, `customer_contacts`, `customer_addresses`, `customer_documents`, `customer_groups`, `customer_group_customer`.
19. **What indexes will be required?**
    Unique compound `(company_id, customer_no)`, tenancy index `(company_id, branch_id)`, state index `(status)`, search indexes on `legal_name`, `trade_name`, `phone`, and tax identifiers.
20. **What security risks exist?**
    Cross-tenant IDOR, PII leakage in logs/APIs, and unauthorized access to private KYC compliance files.
21. **What prototype functionality exists?**
    In-memory customer store with `/api/customers` GET/POST endpoints, `CustomersView.tsx` React component, and verified account `CUS-000101`.
22. **What migration risks exist?**
    Accidental destruction of prototype APIs or mismatching sequence formats. Mitigated by zero modification of prototype files and automated test verification.
23. **What must NOT be implemented yet?**
    Customer Contacts, Addresses, Documents, Groups, Customer 360 UI, Leads, Opportunities, and Vehicle/GPS relationships.

---

## 12. Feature 02 Implementation Summary (Customer Master Foundation)

- **Database Migration:** `database/migrations/2025_01_01_000005_create_customers_table.php`
  - Enforces `company_id` and `branch_id` non-null foreign keys with `restrictOnDelete()`.
  - Composite uniqueness: `UNIQUE(company_id, customer_no)` ensuring cross-company multi-tenancy.
  - Performance composite indexes: `(company_id, branch_id, status)` and `(company_id, status)`.
  - Search indexes: `customer_type`, `legal_name`, `trade_name`, `phone`, `email`, and `(ntn, cnic)`.
- **Eloquent Domain Model:** `app/Models/Customer.php`
  - Casts `CustomerType` and `CustomerStatus` PHP backed enums.
  - Guarded mass assignment prevents client spoofing of `customer_no`, `company_id`, `branch_id`, `created_by`, `updated_by`.
  - Deterministic display name resolver (`trade_name` ?: `legal_name`).
  - PII masking helper (`getMaskedCnic()`).
- **Service Layer:** `app/Services/Customer/CustomerService.php`
  - Integrates with `SequenceService::getNextSequence('CUS')` using atomic pessimistic row locks.
  - Enforces organization integrity via `OrganizationService::validateBranchBelongsToCompany()`.
  - Enforces actor tenancy authorization preventing cross-company creation/update.
  - Dispatches append-only audit entries via `AuditLogService` with masked PII.
- **Authorization & Security:** `app/Policies/CustomerPolicy.php`
  - Multi-tier server-side IDOR defense enforcing `$user->company_id === $customer->company_id` and `$user->branch_id === $customer->branch_id`.
- **Form Requests:** `StoreCustomerRequest`, `UpdateCustomerRequest`.
- **Automated Feature Tests:** `tests/Feature/Customer/CustomerMasterTest.php` (10 assertions).
- **Status:** `FEATURE 02 — FINAL FREEZE`.
