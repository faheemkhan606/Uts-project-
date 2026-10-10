# VALS Tracking Enterprise Platform — Customer Domain Boundary Specification
## Phase 02 · Step 01 · Feature 01: Architecture Inspection & Domain Boundary

---

## 1. Executive Summary & Purpose

This document establishes the formal domain boundaries, entity lifecycle, taxonomy, and system interfaces for the **Customer Master & CRM Foundation** in the VALS Tracking Enterprise Platform.

The core objective is to prevent architectural entanglement between:
1. **Customer Master** (the authoritative enterprise record of an established contractual entity),
2. **Sales / CRM Pipeline** (transient leads, prospecting workflows, quotations, and opportunity qualification),
3. **Operational Telematics & Fleet Assets** (vehicles, hardware trackers, SIM cards, telemetry),
4. **Service & Support** (work orders, field installations, trouble tickets), and
5. **Commercial Billing** (invoicing, ledger accounting, receipts, tax certificates).

---

## 2. Customer Domain Scope & Core Responsibilities

The **Customer Master** domain is strictly responsible for managing customer identity, legal and organizational ownership, master contact channels, and authoritative documentation.

### Core Domain Responsibilities:
- **Authoritative Entity Identity:** Unique enterprise customer numbering (`CUS-XXXXXX`), legal corporate name, trade/doing-business-as (DBA) name, registration identifiers.
- **Classification & Taxonomy:** Distinguishing customer entity models (Individual, Corporate, Government, Fleet Logistics, Educational, Healthcare, Reseller/Dealer).
- **Organizational Tenancy & Ownership:** Scoping customers strictly to a parent enterprise **Company** and primary servicing **Branch**.
- **Customer Lifecycle Management:** Managing operational and compliance state transitions (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `CLOSED`).
- **Normalized Sub-Entities (Master Level):**
  - **Customer Contacts:** Key personnel, designation, phone, email, primary billing/operational flags.
  - **Customer Addresses:** Registered head office, billing address, operational depot, delivery/dispatch locations.
  - **Customer Compliance Documents:** Legal metadata for certificates, tax exemptions, company incorporation proofs, NTN/STRN/CNIC verifications.
  - **Customer Groups & Tiers:** Commercial or categorization tags (e.g., Enterprise Tier-1, SME, Key Account, Government Tender).
- **Master Audit Ledger:** Logging all identity, status, address, contact, and compliance document mutations via the enterprise `AuditLogService`.

---

## 3. Explicitly Out-of-Scope Domains

To maintain modularity and prevent monolithic coupling, the following functional areas are strictly **OUT-OF-SCOPE** for Customer Master and must never be co-located within Customer domain tables or controllers:

| Out-of-Scope Domain | Responsible Future Subsystem | Boundary Description & Prohibition |
|---|---|---|
| **Fleet Vehicles** | Phase 03 — Vehicle Management | Vehicles (`VEH-XXXXXX`), chassis numbers, engine numbers, license plates, and vehicle configurations belong to the Vehicle domain. The Customer domain only acts as a relational foreign key parent (`vehicles.customer_id`). |
| **GPS Tracking Hardware** | Phase 04 — Device & SIM Management | Telematics tracking devices (`DEV-XXXXXX`), IMEI numbers, protocols (GT06, Teltonika), firmware, and stock states belong strictly to Device inventory. |
| **Telematics SIM Cards** | Phase 04 — Device & SIM Management | Cellular SIMs (`SIM-XXXXXX`), IMSI, MSISDN, APN profiles, telco carriers (Jazz, Zong, Telenor, Ufone) belong to SIM inventory. |
| **Live Telematics & GPS Tracking** | Telematics / NOC Operations | Real-time GPS coordinates, speed, ignition, odometer, satellite lock, and packet decoding belong to the NOC telematics pipeline. |
| **Field Installation & FSM** | Field Service Management (FSM) | Installation work orders (`INS-XXXXXX`), technician dispatch, installation OTP verification, harness wiring reports, and QA inspection sheets belong to FSM. |
| **Customer Support & Ticketing** | Service Management | Trouble tickets (`TKT-XXXXXX`), complaints, SLAs, escalation matrices, and technician re-visits belong to Support & Ticketing. |
| **Invoicing, Billing & Finance** | Finance & Billing | Sales invoices (`INV-XXXXXX`), tax calculations, receivables, payment vouchers, ledger reconciliations, credit limit checking belong to Finance. |
| **Inventory & Warehouses** | Supply Chain Management | Physical stock balances, bins, central/regional warehouses, GRNs, transfers belong to Supply Chain & Inventory. |
| **Sales Pipeline & Opportunities** | CRM & Sales Operations | Leads, prospecting stages, conversion pipelines, sales activities, deal values belong to the CRM/Sales module. |
| **Service Packages & AMC** | Contract Management | Annual Maintenance Contracts (`AMC-XXXXXX`), recurring subscriptions, warranty renewals, SLA package tiers belong to Contract Management. |
| **Notifications & Alerts** | Notification Engine | SMS, WhatsApp, and email dispatch engines belong to the Notification Subsystem. |
| **GPS Telematics Alarms** | NOC Alarms Engine | Overspeed, geofence breaches, towing, battery disconnect, SOS panic alerts belong to the NOC Event Processor. |
| **Multi-Tenant SaaS Partitioning** | Platform Core Architecture | Premature multi-tenant SaaS virtualization schemes must not contaminate the single-tenant enterprise schema. |

---

## 4. Architectural Boundary: Customer Master vs CRM / Sales

A major architectural antipattern in enterprise systems is conflating **Leads** with **Customers**. VALS Tracking strictly decouples these two concepts:

```
[ CRM / Sales Subsystem ]                      [ Customer Master Subsystem ]
(Transient / Speculative)                      (Established Legal Entity)
┌─────────────────────────┐                    ┌─────────────────────────┐
│ • Sales Leads           │                    │ • Customer Master (CUS) │
│ • Prospects             │   Qualification    │ • Verified Contacts     │
│ • Opportunity Pipeline  │ ─────────────────> │ • Verified Addresses    │
│ • Quotations & RFQs     │   & Conversion     │ • Compliance Documents  │
│ • Sales Calls / Demos   │                    │ • Branch Scope          │
└─────────────────────────┘                    └─────────────────────────┘
```

### Architectural Principles:
1. **No "Lead" Status in Customer Master:**
   - The prototype incorrectly used `status: 'Lead' | 'Prospect' | 'Active' | ...` inside the single `Customer` type.
   - In the production architecture, a Lead is not a Customer. A Customer record is only provisioned upon formal commercial onboarding, contract signing, or successful lead conversion.
2. **Clean Foreign Key Reference:**
   - When a CRM lead is converted, the CRM subsystem writes a foreign reference (`leads.converted_customer_id = customers.id`), preserving historical pre-sales activities in CRM tables while seeding a pristine Customer Master profile.
3. **No Sales Funnel Pollution:**
   - Operational ERP modules (Dispatch, FSM, NOC, Fleet, Invoicing) query only `customers` where `status = 'ACTIVE'`. They must never be exposed to unconverted leads or speculative sales prospects.

---

## 5. Customer Types & Taxonomy

VALS operates across enterprise logistics, government fleets, corporate leases, educational transport, and retail tracking. The Customer Type architecture distinguishes entity characteristics without conflating entity type with permissions, billing tiers, or industry sectors.

### Taxonomy Matrix:

| Customer Type | Key Characteristics | Identity & Compliance Requirements |
|---|---|---|
| **Corporate** | Commercial enterprises, private logistics fleets, multinational distributors. | Mandatory NTN, legal company name, authorized representative CNIC, registered business address. |
| **Individual** | Private car/motorcycle owners, retail consumers. | Mandatory CNIC / National ID, primary personal mobile, residence address. |
| **Government** | Municipalities, public transit authorities, law enforcement, state utilities. | Department designation, official tender/work order reference, official postal address, exempt/non-exempt tax status. |
| **Dealer / Reseller** | Auto dealerships, tracking value-added resellers, white-label operators. | Business NTN, trade license, reseller agreement reference, tier classification. |
| **Logistics & Fleet Operator** | Third-party logistics (3PL), freight carriers, tanker fleets. | Transport license, carrier NTN, fleet operational manager contact, dispatch yard depot address. |
| **School / University** | Student transport buses, institutional vans. | Institution registration, transport administrator contact, campus addresses. |
| **Healthcare / Hospital** | Ambulances, mobile clinics, pharmaceutical cold chain fleets. | Healthcare registration, emergency dispatch contact. |
| **Other Organization** | NGOs, embassies, non-profit institutions. | Registration documentation, authorized officer contact. |

### Clear Anti-Conflation Rules:
- **Customer Type $\neq$ User Role:** A Customer Type defines the legal entity structure. A User Role (`CUSTOMER_USER`, `OPERATIONS_MANAGER`) defines platform RBAC authentication.
- **Customer Type $\neq$ Industry Sector:** Industry sector (e.g., Oil & Gas, FMCG, Agriculture) is an analytical classification tag, not the foundational legal type.
- **Customer Type $\neq$ Tenant Type:** Multi-tenant SaaS scopes belong to platform configuration, not individual customer account definitions.

---

## 6. Customer Lifecycle & State Machine

The Customer Master lifecycle must remain predictable and deterministic. It governs whether assets can be provisioned, devices tracked, or invoices generated.

```
       ┌────────────────────────┐
       │      [ CREATION ]      │
       └───────────┬────────────┘
                   │
                   ▼
         ┌───────────────────┐
         │      ACTIVE       │ ◄──────────┐
         └─────────┬─────────┘            │
                   │                      │
       ┌───────────┴───────────┐          │
       ▼                       ▼          │
┌──────────────┐       ┌──────────────┐   │
│   INACTIVE   │       │  SUSPENDED   │ ──┘ (Reactivation)
└──────┬───────┘       └──────┬───────┘
       │                      │
       └───────────┬──────────┘
                   │
                   ▼
         ┌───────────────────┐
         │      CLOSED       │  (Terminal Archival State)
         └───────────────────┘
```

### Lifecycle States:
1. **`ACTIVE`**:
   - Customer is fully compliant and operational.
   - Permitted to register vehicles, procure GPS devices, schedule field installations, access customer portals, and generate invoices.
2. **`INACTIVE`**:
   - Customer has zero active vehicle tracking subscriptions or has temporarily paused commercial engagements without compliance penalties.
   - Hardware remains dormant; no new work orders can be created.
3. **`SUSPENDED`**:
   - Restricted due to non-payment, compliance failure, or legal/regulatory holds.
   - Telematics monitoring may be locked down; NOC tracking features blocked; portal logins restricted.
   - Can transition back to `ACTIVE` upon settlement/clearance.
4. **`CLOSED`**:
   - Customer contract terminated, devices de-installed or decommissioned, account finalized.
   - Terminal status. Historical audit trail and ledger records are preserved via database soft-deletion.

---

## 7. Customer Identity Fields & Internationalization

VALS Tracking originates in Pakistan with nationwide coverage (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Multan, Quetta), but the architecture must support international deployments (Middle East, Africa, UK) without rigid schema alterations.

### Field Specification Matrix:

| Field | Data Type | Nullable | Required | Scope / Constraints | Notes / International Compatibility |
|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | No | Auto | Primary Key | Standard auto-incrementing surrogate key. |
| `customer_no` | `VARCHAR(20)` | No | Yes | `UNIQUE` per Company Scope | Generated via `NumberingSequence` (`CUS-XXXXXX`). |
| `company_id` | `BIGINT UNSIGNED` | No | Yes | `FOREIGN KEY (companies.id)` | Enforces enterprise multi-company tenancy. |
| `branch_id` | `BIGINT UNSIGNED` | No | Yes | `FOREIGN KEY (branches.id)` | Servicing branch for logistics and operations. |
| `customer_type` | `VARCHAR(30)` | No | Yes | Indexed enum / string | `corporate`, `individual`, `government`, `dealer`, etc. |
| `legal_name` | `VARCHAR(191)` | No | Yes | Indexed search field | Official registered name of entity/individual. |
| `trade_name` | `VARCHAR(191)` | Yes | No | Indexed search field | DBA / Operating Brand (e.g., "Shan Foods"). |
| `status` | `VARCHAR(20)` | No | Yes | Default: `active` | State machine: `active`, `inactive`, `suspended`, `closed`. |
| `national_id` | `VARCHAR(50)` | Yes | Optional | Masked in logs | Country-agnostic National ID (CNIC in PK, Civil ID in ME, NIN in UK). |
| `tax_number` | `VARCHAR(50)` | Yes | Optional | Indexed | Country-agnostic National Tax Number (NTN in PK, VAT ID, EIN). |
| `sales_tax_number`| `VARCHAR(50)` | Yes | Optional | Indexed | Country-agnostic Sales Tax / VAT Registration (STRN in PK). |
| `primary_phone` | `VARCHAR(30)` | No | Yes | E.164 format recommended | Primary communication line. |
| `secondary_phone`| `VARCHAR(30)` | Yes | No | E.164 format | Alternate dispatch or operational phone. |
| `email` | `VARCHAR(191)` | Yes | Optional | Validated email format | Master corporate or billing notification email. |
| `website` | `VARCHAR(191)` | Yes | No | Valid URL | Corporate website. |
| `credit_limit` | `DECIMAL(14,2)`| No | Yes | Default: `0.00` | Operational credit ceiling managed by Finance. |
| `payment_terms` | `VARCHAR(50)` | No | Yes | Default: `'Net 30 Days'` | Commercial billing term identifier. |
| `notes` | `TEXT` | Yes | No | - | Internal administrative notes. |
| `created_by` | `BIGINT UNSIGNED` | Yes | No | `FOREIGN KEY (users.id)` | Audit trail: Creator user ID. |
| `updated_by` | `BIGINT UNSIGNED` | Yes | No | `FOREIGN KEY (users.id)` | Audit trail: Last updater user ID. |
| `deleted_at` | `TIMESTAMP` | Yes | No | Soft Deletes | Non-destructive archival and audit preservation. |
| `created_at` | `TIMESTAMP` | No | System | Audit timestamp | System timestamp. |
| `updated_at` | `TIMESTAMP` | No | System | Audit timestamp | System timestamp. |

---

## 8. Customer Master Subdomains

To avoid creating wide, denormalized records, the Customer Master entity is decomposed into normalized relational subdomains:

```
                      ┌──────────────────────┐
                      │   Customer Master    │
                      │     (customers)      │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │ 1:N                   │ 1:N                   │ 1:N
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│Customer Contacts │    │Customer Addresses│    │Customer Documents│
│(customer_contacts│    │(customer_address)│    │(customer_document│
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

1. **Customer Contacts (`customer_contacts`):**
   - Supports multiple contact persons per customer (e.g., Fleet Manager, Accounts Officer, Director, 24/7 Dispatch Desk).
   - Attributes: `name`, `designation`, `department`, `phone`, `mobile`, `email`, `is_primary_contact`, `is_billing_contact`, `is_emergency_noc_contact`.
2. **Customer Addresses (`customer_addresses`):**
   - Supports multiple physical and administrative locations.
   - Address Types: `REGISTERED_HEAD_OFFICE`, `BILLING_ADDRESS`, `OPERATIONAL_DEPOT`, `WORKSHOP_GARAGE`, `DISPATCH_YARD`.
   - Attributes: `address_line1`, `address_line2`, `city`, `province_state`, `postal_code`, `country`, `latitude`, `longitude`.
3. **Customer Compliance Documents (`customer_documents`):**
   - Stores metadata and secured storage links for compliance artifacts.
   - Document Types: `CNIC_COPY`, `NTN_CERTIFICATE`, `STRN_CERTIFICATE`, `INCORPORATION_CERTIFICATE`, `COMMERCIAL_AGREEMENT`, `AUTHORIZATION_LETTER`, `TAX_EXEMPTION_LETTER`.
   - Attributes: `document_type`, `title`, `file_path`, `file_name`, `mime_type`, `file_size`, `expiry_date`, `verified_by`, `verified_at`.
4. **Customer Classifications & Groups (`customer_groups`, `customer_group_customer`):**
   - Allows flexible grouping without hardcoding business rules (e.g., "VIP Logistics", "Sindh Police Fleet", "Govt Tender 2026", "Key Accounts").

---

## 9. Future Relationship Map

```
========================================================================================
                  ORGANIZATION FOUNDATION (PHASE 01)
========================================================================================
                                Company
                                   │
                                   ▼
                                Branch
                                   │
===================================│====================================================
                  CUSTOMER MASTER DOMAIN (PHASE 02)
===================================│====================================================
                                   ▼
                              CUSTOMER
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
 Customer Contacts         Customer Addresses          Customer Documents
 (Fleet Mgr, Accounts)     (Depots, Head Office)       (Tax certs, agreements)
       │                           │                           │
       └───────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                              Customer 360
                         (Aggregated Master View)
                                   │
===================================│====================================================
                  FUTURE OPERATIONAL MODULES (PHASES 03 - 10)
===================================│====================================================
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
[Phase 03: Vehicles]     [Phase 04: Devices/SIM]     [Phase 05: FSM / Work Orders]
  • Reg Plates              • GPS IMEI                  • Installations
  • Chassis No              • Telematics SIM            • De-installations
  • Fleet Units             • Protocols                 • Technician OTP
       │                           │                           │
       ├───────────────────────────┼───────────────────────────┤
       ▼                           ▼                           ▼
[Phase 06: Tickets]      [Phase 07: Finance/Billing] [Phase 08: Contracts / AMC]
  • Complaints              • Invoices                  • SLA Subscriptions
  • Support SLAs            • Ledger                    • AMC Renewals
  • NOC Dispatch            • Receivables               • Package Tiers
========================================================================================
```

---

## 10. Summary & Sign-off

- Customer Master is an **authoritative foundational entity**, completely decoupled from raw telematics, hardware, and transient sales funnels.
- The domain boundaries established in this document are strictly frozen for Step 01 Feature 01.
- No production database tables, models, or CRUD endpoints shall be implemented until scheduled in subsequent features.
