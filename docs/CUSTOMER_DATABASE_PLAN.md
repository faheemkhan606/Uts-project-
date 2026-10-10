# VALS Tracking Enterprise Platform — Customer Database Architecture Plan
## Phase 02 · Step 01 · Feature 01: Database Foundation & Schema Blueprint

---

## 1. Executive Summary

This plan outlines the relational database architecture for the **Customer & CRM Foundation** in the VALS Tracking Enterprise Platform.

The architecture strictly follows:
- **Relational Integrity:** Foreign keys, cascades, and null-on-delete constraints enforced at the database level.
- **Scope Isolation:** Multi-company and multi-branch tenancy enforced via foreign keys and composite unique indexes.
- **Auditability:** User attribution (`created_by`, `updated_by`) and soft deletion (`deleted_at`) for non-destructive lifecycle tracking.
- **Search Optimization:** Targeted composite and B-tree indexes for fast queries across legal names, contact numbers, national identifiers, and operational statuses.
- **Anti-Pattern Prevention:** Avoidance of un-indexed JSON blobs for relational data, avoidance of opaque polymorphic relations where strict referential integrity is required, and avoidance of premature denormalization.

---

## 2. Table Architecture Overview

The Customer Master subsystem is partitioned into four primary tables and two classification/tagging tables:

```
┌─────────────────────────────────┐
│           companies             │
└───────────────┬─────────────────┘
                │ 1:N
                ▼
┌─────────────────────────────────┐
│            branches             │
└───────────────┬─────────────────┘
                │ 1:N
                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       customers                                        │
│  PK: id                                                                                │
│  UK: (company_id, customer_no)                                                         │
│  FK: company_id -> companies(id), branch_id -> branches(id)                            │
└───────────────┬──────────────────────┬───────────────────────┬─────────────────────────┘
                │ 1:N                  │ 1:N                   │ 1:N
                ▼                      ▼                       ▼
┌─────────────────────────┐  ┌────────────────────┐  ┌──────────────────────────────────┐
│    customer_contacts    │  │ customer_addresses │  │        customer_documents        │
│ FK: customer_id         │  │ FK: customer_id    │  │ FK: customer_id                  │
│ Index: is_primary       │  │ Index: address_type│  │ FK: verified_by -> users(id)     │
└─────────────────────────┘  └────────────────────┘  └──────────────────────────────────┘
                │
                ▼ M:N
┌─────────────────────────────────┐
│    customer_group_customer      │
└───────────────┬─────────────────┘
                │ M:N
                ▼
┌─────────────────────────────────┐
│         customer_groups         │
│ UK: (company_id, code)          │
└─────────────────────────────────┘
```

---

## 3. Detailed Table Specifications

### 3.1. `customers` (Master Entity)

Stores the core legal and organizational identity of the customer.

| Column Name | Type | Modifiers / Attributes | Description & Justification |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Auto Increment, Primary Key | Surrogate primary key. |
| `company_id` | `BIGINT UNSIGNED` | Not Null, Foreign Key | Refers to `companies.id`. Ensures enterprise multi-company isolation. |
| `branch_id` | `BIGINT UNSIGNED` | Not Null, Foreign Key | Refers to `branches.id`. The servicing/owning branch. |
| `customer_no` | `VARCHAR(20)` | Not Null | Formatted sequence identifier (e.g. `CUS-000101`). Unique per company. |
| `customer_type` | `VARCHAR(30)` | Not Null, Default `'corporate'` | Enum/string: `corporate`, `individual`, `government`, `dealer`, `logistics`, `other`. |
| `legal_name` | `VARCHAR(191)` | Not Null | Official legal/incorporated entity name. |
| `trade_name` | `VARCHAR(191)` | Nullable | DBA / Operating brand name. |
| `status` | `VARCHAR(20)` | Not Null, Default `'active'` | Operational status: `active`, `inactive`, `suspended`, `closed`. |
| `national_id` | `VARCHAR(50)` | Nullable | CNIC / Civil ID / National Identity Number. |
| `tax_number` | `VARCHAR(50)` | Nullable | NTN / Corporate Tax Identifier / VAT Number. |
| `sales_tax_number` | `VARCHAR(50)` | Nullable | STRN / Regional Sales Tax Registration Number. |
| `primary_phone` | `VARCHAR(30)` | Not Null | Primary business contact telephone. |
| `secondary_phone` | `VARCHAR(30)` | Nullable | Secondary / NOC emergency contact telephone. |
| `email` | `VARCHAR(191)` | Nullable | Official correspondence email. |
| `website` | `VARCHAR(191)` | Nullable | Corporate web URL. |
| `credit_limit` | `DECIMAL(14,2)` | Not Null, Default `0.00` | Operational financial credit limit ceiling. |
| `payment_terms` | `VARCHAR(50)` | Not Null, Default `'Net 30 Days'` | Invoicing payment terms identifier. |
| `notes` | `TEXT` | Nullable | Internal administrative notes. |
| `created_by` | `BIGINT UNSIGNED` | Nullable, Foreign Key | Refers to `users.id` (`onDelete('set null')`). |
| `updated_by` | `BIGINT UNSIGNED` | Nullable, Foreign Key | Refers to `users.id` (`onDelete('set null')`). |
| `deleted_at` | `TIMESTAMP` | Nullable | Soft deletes for non-destructive lifecycle management. |
| `created_at` | `TIMESTAMP` | System | Standard audit timestamps. |
| `updated_at` | `TIMESTAMP` | System | Standard audit timestamps. |

#### Foreign Key & Integrity Constraints:
- `fk_customers_company`: `FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT` (Prevent deleting active company with customers).
- `fk_customers_branch`: `FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE RESTRICT` (Prevent deleting active branch with customers).
- `fk_customers_created_by`: `FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL`.
- `fk_customers_updated_by`: `FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL`.

#### Indexes:
- `UNIQUE INDEX uq_customers_company_no (company_id, customer_no)`: Guarantees unique customer sequence within the enterprise company scope.
- `INDEX idx_customers_company_branch (company_id, branch_id)`: Accelerates branch-level data isolation and multi-company filtering.
- `INDEX idx_customers_status (status)`: Fast filtering for active vs suspended/inactive accounts.
- `INDEX idx_customers_type (customer_type)`: Fast segmentation by corporate vs individual.
- `INDEX idx_customers_legal_name (legal_name)`: Fast prefix matching and lookup.
- `INDEX idx_customers_trade_name (trade_name)`: Fast DBA lookups.
- `INDEX idx_customers_tax_id (tax_number, national_id)`: Accelerated verification and duplicate prevention lookup.

---

### 3.2. `customer_contacts` (Normalized Entity)

Supports multiple representatives per customer account (Fleet Managers, Accounts Officers, Executives).

| Column Name | Type | Modifiers / Attributes | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Auto Increment, Primary Key | Surrogate primary key. |
| `customer_id` | `BIGINT UNSIGNED` | Not Null, Foreign Key | Refers to `customers.id`. |
| `name` | `VARCHAR(191)` | Not Null | Contact person full name. |
| `designation` | `VARCHAR(100)` | Nullable | Job title (e.g. "Head of Fleet Operations"). |
| `department` | `VARCHAR(100)` | Nullable | Internal department (e.g. "Logistics & Transport"). |
| `phone` | `VARCHAR(30)` | Not Null | Primary direct telephone number. |
| `mobile` | `VARCHAR(30)` | Nullable | Mobile number for SMS/WhatsApp operational dispatches. |
| `email` | `VARCHAR(191)` | Nullable | Direct email address. |
| `is_primary_contact` | `BOOLEAN` | Not Null, Default `false` | Primary administrative contact for account. |
| `is_billing_contact` | `BOOLEAN` | Not Null, Default `false` | Receives invoices and payment statements. |
| `is_emergency_noc_contact` | `BOOLEAN` | Not Null, Default `false` | 24/7 point of contact for high-speed/theft NOC alarms. |
| `notes` | `TEXT` | Nullable | Contact-specific instructions or availability hours. |
| `created_at` | `TIMESTAMP` | System | Standard audit timestamps. |
| `updated_at` | `TIMESTAMP` | System | Standard audit timestamps. |

#### Foreign Keys & Constraints:
- `fk_cust_contacts_customer`: `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`.

#### Indexes:
- `INDEX idx_cust_contacts_cust_primary (customer_id, is_primary_contact)`
- `INDEX idx_cust_contacts_emergency (customer_id, is_emergency_noc_contact)`
- `INDEX idx_cust_contacts_phone (phone, mobile)`

---

### 3.3. `customer_addresses` (Normalized Entity)

Supports multiple operational and legal locations per customer (Head Office, Billing Office, Depots, Regional Yards).

| Column Name | Type | Modifiers / Attributes | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Auto Increment, Primary Key | Surrogate primary key. |
| `customer_id` | `BIGINT UNSIGNED` | Not Null, Foreign Key | Refers to `customers.id`. |
| `address_type` | `VARCHAR(50)` | Not Null, Default `'head_office'` | `head_office`, `billing`, `depot_yard`, `workshop`, `shipping`. |
| `label` | `VARCHAR(100)` | Nullable | Friendly identifier (e.g., "Port Qasim Dispatch Yard"). |
| `address_line1` | `VARCHAR(255)` | Not Null | Street address line 1. |
| `address_line2` | `VARCHAR(255)` | Nullable | Building / Suite / Unit / Sector. |
| `city` | `VARCHAR(100)` | Not Null | City (e.g. Karachi, Lahore). |
| `province_state`| `VARCHAR(100)` | Not Null | Province/State (e.g. Sindh, Punjab). |
| `postal_code` | `VARCHAR(20)` | Nullable | Postal / ZIP code. |
| `country` | `VARCHAR(100)` | Not Null, Default `'Pakistan'` | Country identifier. |
| `latitude` | `DECIMAL(10,7)`| Nullable | Geographic latitude coordinate for geofence/dispatch mapping. |
| `longitude` | `DECIMAL(10,7)`| Nullable | Geographic longitude coordinate for geofence/dispatch mapping. |
| `is_primary` | `BOOLEAN` | Not Null, Default `false` | Default operational address flag. |
| `is_billing` | `BOOLEAN` | Not Null, Default `false` | Official tax/invoice billing destination. |
| `created_at` | `TIMESTAMP` | System | Standard audit timestamps. |
| `updated_at` | `TIMESTAMP` | System | Standard audit timestamps. |

#### Foreign Keys & Constraints:
- `fk_cust_addresses_customer`: `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`.

#### Indexes:
- `INDEX idx_cust_addr_customer_type (customer_id, address_type)`
- `INDEX idx_cust_addr_city_province (city, province_state)`

---

### 3.4. `customer_documents` (Compliance & KYC Entity)

Stores verified legal metadata and storage path references for compliance audits.

| Column Name | Type | Modifiers / Attributes | Description |
|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | Auto Increment, Primary Key | Surrogate primary key. |
| `customer_id` | `BIGINT UNSIGNED` | Not Null, Foreign Key | Refers to `customers.id`. |
| `document_type` | `VARCHAR(50)` | Not Null | `cnic_copy`, `ntn_cert`, `strn_cert`, `incorporation_cert`, `contract`, `exemption_letter`. |
| `title` | `VARCHAR(191)` | Not Null | Descriptive document title. |
| `document_number`| `VARCHAR(100)` | Nullable | Official registration or license reference number. |
| `file_path` | `VARCHAR(255)` | Not Null | Secured private storage path (never public URL). |
| `file_name` | `VARCHAR(191)` | Not Null | Original sanitized file name. |
| `mime_type` | `VARCHAR(100)` | Not Null | `application/pdf`, `image/jpeg`, `image/png`. |
| `file_size_bytes`| `BIGINT UNSIGNED`| Not Null | Binary size in bytes. |
| `issue_date` | `DATE` | Nullable | Issue or execution date. |
| `expiry_date` | `DATE` | Nullable | Expiration / renewal date (triggers automated alerts). |
| `is_verified` | `BOOLEAN` | Not Null, Default `false` | Official compliance verification flag. |
| `verified_by` | `BIGINT UNSIGNED` | Nullable, Foreign Key | Refers to `users.id` (Compliance officer). |
| `verified_at` | `TIMESTAMP` | Nullable | Verification timestamp. |
| `notes` | `TEXT` | Nullable | Compliance review notes. |
| `created_at` | `TIMESTAMP` | System | Standard audit timestamps. |
| `updated_at` | `TIMESTAMP` | System | Standard audit timestamps. |

#### Foreign Keys & Constraints:
- `fk_cust_docs_customer`: `FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE`.
- `fk_cust_docs_verified_by`: `FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL`.

#### Indexes:
- `INDEX idx_cust_docs_customer_type (customer_id, document_type)`
- `INDEX idx_cust_docs_expiry (expiry_date, is_verified)`

---

### 3.5. `customer_groups` & `customer_group_customer` (Classification Engine)

Provides extensible categorization without rigid schema alterations.

#### `customer_groups` Table:
- `id` (`BIGINT UNSIGNED`, PK)
- `company_id` (`BIGINT UNSIGNED`, FK -> `companies.id`)
- `name` (`VARCHAR(100)`, Not Null)
- `code` (`VARCHAR(50)`, Not Null)
- `description` (`TEXT`, Nullable)
- `color_code` (`VARCHAR(10)`, Default `'#3B82F6'`)
- `created_at`, `updated_at`
- **Unique Constraint:** `UNIQUE INDEX uq_cust_groups_comp_code (company_id, code)`

#### `customer_group_customer` Pivot Table:
- `customer_id` (`BIGINT UNSIGNED`, FK -> `customers.id`, `ON DELETE CASCADE`)
- `customer_group_id` (`BIGINT UNSIGNED`, FK -> `customer_groups.id`, `ON DELETE CASCADE`)
- `assigned_at` (`TIMESTAMP`, Default `now()`)
- **Primary Key:** `PRIMARY KEY (customer_id, customer_group_id)`

---

## 4. Architectural Justification & Anti-Pattern Analysis

1. **Why Normalized Contacts and Addresses Instead of JSON Columns?**
   - In fleet telematics, emergency alerts (high-speed, theft, geofence breaches) must rapidly resolve the **emergency NOC telephone** of the vehicle's customer contact. Querying a relational table with `is_emergency_noc_contact = 1` indexed by `customer_id` takes microseconds; deserializing and searching JSON objects in MySQL across 100,000+ fleet units introduces major performance bottlenecks and prevents database-level referential integrity.
2. **Why Separate Tables for Documents Instead of Media Attachment Polimorphism?**
   - Customer KYC documents carry sensitive PII (tax identifiers, legal identities) with regulatory audit requirements (`verified_by`, `expiry_date`, `is_verified`). A dedicated `customer_documents` table enforces explicit foreign keys and compliance constraints that polymorphic relations cannot enforce.
3. **Why Compound Uniqueness `(company_id, customer_no)`?**
   - The platform supports multi-company operations. While customer numbers are unique within a company, tying customer uniqueness to the company scope allows independent numbering series or multi-firm partitioning without collisions.

---

## 5. Prototype to Production Data Transition Plan

| Prototype Field (`src/types/vals.ts`) | Target Database Field | Transition Transformation & Rules |
|---|---|---|
| `customerId` (`'CUS-000101'`) | `customers.customer_no` | Directly mapped. |
| `customerType` (`'Company' \| 'Individual'`) | `customers.customer_type` | Lowercased: `'corporate'`, `'individual'`. |
| `name` | `customers.legal_name` | Directly mapped to official legal name. |
| `companyName` | `customers.trade_name` | Mapped to trade / DBA name. |
| `contactPerson` | `customer_contacts.name` | Migrated as primary contact entry (`is_primary_contact = 1`). |
| `nationalIdOrReg` | `customers.national_id` or `tax_number` | If prefix `'REG-'` or 7+ digits -> `tax_number`; if 13-digit CNIC -> `national_id`. |
| `phone`, `whatsapp` | `customer_contacts.phone`, `mobile` | Mapped to primary contact phone and mobile numbers. |
| `billingAddress`, `city`, `province` | `customer_addresses.*` | Normalized into a primary billing address row (`is_billing = 1`). |
| `status` (`'Active' \| 'Suspended' ...`) | `customers.status` | Lowercased: `'active'`, `'suspended'`, `'inactive'`, `'closed'`. (Note: `'Lead'` and `'Prospect'` are filtered out and reserved for CRM). |
| `creditLimit` | `customers.credit_limit` | Directly mapped to decimal. |
| `paymentTerms` | `customers.payment_terms` | Directly mapped. |
| `packageId` | Relational subscription link | Reserved for future Contract/Package module (Phase 08). |

---

## 6. Implementation Status (Feature 02 - Customer Master)

- **Migration Created:** `database/migrations/2025_01_01_000005_create_customers_table.php`
- **Domain Model:** `app/Models/Customer.php` (Soft deletes, guarded organizational columns, display name resolver, PII masking).
- **Enums:** `App\Enums\CustomerType` (10 supported types), `App\Enums\CustomerStatus` (`active`, `inactive`, `suspended`, `closed`).
- **Service Layer:** `App\Services\Customer\CustomerService` (Atomic `SequenceService` generation, cross-company validation, audit logging).
- **Authorization & Security:** `App\Policies\CustomerPolicy` (Multi-tier server-side IDOR defense, company and branch scoping).
- **Validation:** `StoreCustomerRequest`, `UpdateCustomerRequest`.
- **Testing:** `tests/Feature/Customer/CustomerMasterTest.php` (10 feature test assertions).
- **Status:** `FEATURE 02 — FINAL FREEZE`. Sub-entities (`customer_contacts`, `customer_addresses`, `customer_documents`, `customer_groups`) will be implemented in subsequent scheduled features.
