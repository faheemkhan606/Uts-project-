# VALS Tracking Enterprise Platform — Organization Foundation Architecture

**Project Owner:** VALS Tracking (Private) Limited  
**Current Phase:** Phase 01  
**Current Step:** Step 05 (Organization Foundation)  
**Status:** CODE FOUNDATION FREEZE  

---

## 1. Architectural Philosophy: Multi-Tiered Organization Hierarchy

The organization layer establishes the operational structural hierarchy for the entire VALS Tracking enterprise suite. All downstream business domains—Fleet Operations, Telematics NOC, Inventory Vaults, Field Service Orders, Invoicing, and Customer Accounts—ground their relationships and authorization scopes in this organizational hierarchy.

```text
       ┌───────────────┐
       │    Company    │ (Legal Entity, Tax/NTN, Reporting Root)
       └───────┬───────┘
               │ 1:M
       ┌───────┴───────┐
       │    Branch     │ (City Hub, Regional Office, Operational Station)
       └───┬───────┬───┘
     1:M   │       │ 1:M
┌──────────┴──┐ ┌──┴───────────┐
│ Department  │ │  Warehouse   │ (Physical Hardware & SIM Vault)
└─────────────┘ └──────────────┘
       ▲
       │ M:1
┌─────────────┐
│    User     │ (Staff Personnel assigned to Company + Branch + Dept)
└─────────────┘
```

---

## 2. Core Entities & Schema Specifications

### A. Company (`companies` table)
- **Role:** Top-level legal and financial entity.
- **Fields:**
  - `id`: Primary key.
  - `legal_name`: Full registered company name (e.g., `VALS Tracking (Private) Limited`).
  - `trade_name`: Brand identifier (`VALS Tracking`).
  - `ntn`: National Tax Number (unique, validated).
  - `strn`: Sales Tax Registration Number.
  - `head_office_address`: Registered principal address.
  - `city`: Head office city (`Karachi`).
  - `country`: Default `Pakistan`.
  - `primary_phone`: Corporate PBX line.
  - `emergency_noc_phone`: 24/7 Operations escalation line.
  - `email`: Corporate inquiries and official correspondence.
  - `currency`: Default `PKR`.
  - `timezone`: Default `Asia/Karachi`.
  - `is_active`: Boolean flag indicating operational status.
  - Timestamps.

### B. Branch (`branches` table)
- **Role:** Physical operating station, regional sales office, or command hub.
- **Fields:**
  - `id`: Primary key.
  - `company_id`: Foreign key referencing parent `companies`.
  - `code`: Branch station code (`KHI`, `LHE`, `ISB`, `RWP`), unique per company via `UNIQUE(company_id, code)`.
  - `name`: Full station name.
  - `city`: Operating city.
  - `province`: Administrative province (`Sindh`, `Punjab`, `Federal Capital`).
  - `address`: Physical premises.
  - `phone`: Station phone line.
  - `manager_name`: Branch station manager.
  - `is_active`: Operational status.
  - Timestamps.

### C. Department (`departments` table)
- **Role:** Functional operational division.
- **Hierarchy Rules:**
  - May be **company-wide** (`branch_id = null`, e.g. Executive Management, Finance & Accounts).
  - Or **branch-specific** (`branch_id` set, e.g. Regional Field Technicians, Karachi NOC).
- **Fields:**
  - `id`: Primary key.
  - `company_id`: Foreign key referencing parent `companies`.
  - `branch_id`: Nullable foreign key referencing `branches`.
  - `code`: Department code (`EXEC`, `NOC`, `FSM`, `INV`, `FIN`, `CS`).
  - `name`: Formal title.
  - `head_of_department`: Department director or supervisor.
  - `employee_count`: Headcount tracking.
  - `is_active`: Status flag.
  - Timestamps.

### D. Warehouse (`warehouses` table)
- **Role:** Physical inventory and storage vault for GPS telematics units, sensors, and SIM cards.
- **Fields:**
  - `id`: Primary key.
  - `branch_id`: Foreign key referencing managing `branches`.
  - `code`: Unique warehouse facility code (`WH-KHI-MAIN`, `WH-LHE-REG`).
  - `name`: Facility title.
  - `location`: Specific address/floor.
  - `capacity`: Maximum storage unit capacity.
  - `manager_name`: Vault custodian.
  - `is_active`: Status flag.
  - Timestamps.

---

## 3. User Organization Assignment & Scope Model

Staff members (`users`) are directly associated with the organizational hierarchy:
- `user.company_id`: The employing company.
- `user.branch_id`: Assigned station (optional for cross-branch executive staff).
- `user.department_id`: Assigned operational division.

### Scope Model for Downstream Modules:

| Scope | Condition | Access Boundary |
|---|---|---|
| **Global (`global`)** | `SUPER_ADMIN` or `company_id = null` | Cross-company, platform-wide visibility and administrative authority. |
| **Company (`company`)** | `company_id` set, `branch_id = null` | All branches, departments, and assets belonging to their company. |
| **Branch (`branch`)** | `branch_id` set, `department_id = null` | Confined strictly to assets, tickets, and operations at their assigned branch. |
| **Department (`department`)** | `department_id` set | Confined to their specific functional domain within the company/branch. |

The helper method `user->getOrganizationScope()` calculates the active scope.

---

## 4. Organizational Integrity Rules (Anti-Corruption Engine)

To prevent orphaned or conflicting organizational structures, `App\Services\Foundation\OrganizationService` and associated Form Requests enforce server-side validation rules:

1. **Cross-Company Branch Protection:**
   A user or entity cannot be assigned to a branch that does not belong to the selected company:
   ```text
   branch.company_id == user.company_id
   ```

2. **Cross-Company Department Protection:**
   A user or entity cannot be assigned to a department belonging to a different company:
   ```text
   department.company_id == user.company_id
   ```

3. **Branch-Specific Department Consistency:**
   If a department is branch-specific (`department.branch_id IS NOT NULL`), assigning a user with a mismatched `branch_id` is rejected immediately with a validation error.

4. **Tamper-Evident Audit Logging:**
   All user organization mutations are recorded in `audit_logs` via `AuditLogService` with actor name, role, IP address, and old vs. new values.

---

## 5. RBAC Integration & Permissions

Organization operations require explicit server-side permissions:

| Permission Name | Module | Action | Description |
|---|---|---|---|
| `companies.view` | companies | view | View company profiles. |
| `companies.create` | companies | create | Register new company legal entities. |
| `companies.update` | companies | update | Edit legal info, NTN, and addresses. |
| `branches.view` | branches | view | Inspect branch station directory. |
| `branches.create` | branches | create | Add new operational stations. |
| `branches.update` | branches | update | Edit station details, managers, status. |
| `departments.view` | departments | view | View departments. |
| `departments.create` | departments | create | Define new corporate or branch divisions. |
| `departments.update` | departments | update | Modify department parameters. |
| `warehouses.view` | warehouses | view | View warehouse facilities. |
| `warehouses.create` | warehouses | create | Register new inventory vaults. |
| `warehouses.update` | warehouses | update | Edit warehouse parameters. |
| `users.organization.update`| users | org_update | Assign/reassign users to org units. |

- Active `SUPER_ADMIN` accounts bypass permission checks via `Gate::before`.
- Inactive accounts (`is_active = false`) are blocked from all actions regardless of role.

---

## 6. Seeders & Reference Data

Seeders are idempotent using `updateOrCreate`:
1. `CompanySeeder`: Seeds `VALS Tracking (Private) Limited`.
2. `BranchSeeder`: Seeds 4 operational hubs (`KHI`, `LHE`, `ISB`, `RWP`) linked to the company.
3. `DepartmentSeeder`: Seeds 6 functional departments (`EXEC`, `NOC`, `FSM`, `INV`, `FIN`, `CS`).
4. `WarehouseSeeder`: Seeds `WH-KHI-MAIN` (Central Vault, Karachi) and `WH-LHE-REG` (Regional Depot, Lahore).
5. `DatabaseSeeder`: Coordinates deterministic execution.

---

## 7. Future Multi-Tenant & SaaS Compatibility

While Phase 01 focuses on VALS Tracking's single-tenant enterprise setup, the schema uses clean entity foreign keys (`company_id`, `branch_id`) and relational scoping. Future tenant isolation can easily wrap database queries with global scopes (`where('company_id', current_tenant())`) without destructive schema refactoring.
