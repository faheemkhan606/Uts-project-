# VALS Tracking Enterprise Platform — Role-Based Access Control (RBAC) Architecture

**Project Owner:** VALS Tracking (Private) Limited  
**Current Phase:** Phase 01  
**Current Step:** Step 04 (RBAC Foundation)  
**Status:** CODE FOUNDATION FREEZE  

---

## 1. Architectural Philosophy: Normalized RBAC

VALS Tracking Enterprise uses a normalized, many-to-many Role-Based Access Control (RBAC) schema.

```text
[User] ──(M:N via role_user)──> [Role] ──(M:N via permission_role)──> [Permission]
```

### Invariants:
1. **No JSON Blobs:** Permissions are normalized in relational database tables (`roles`, `permissions`, `role_user`, `permission_role`), not stored as unstructured JSON arrays in the users table.
2. **Multi-Role Support:** A user may possess one or multiple roles.
3. **Compound Uniqueness:** Pivot tables enforce database-level composite unique keys:
   - `UNIQUE(user_id, role_id)` on `role_user`
   - `UNIQUE(role_id, permission_id)` on `permission_role`
4. **Server-Side Primacy:** All authorization decisions are strictly evaluated on the server via Laravel Gates and Policies. Frontend authorization helpers exist exclusively for UX rendering and are never treated as a security boundary.

---

## 2. Foundational System Roles

The system establishes 14 core operational roles:

| Role Name | Display Name | Scope / Responsibility |
|---|---|---|
| `SUPER_ADMIN` | Super Admin | Unrestricted administrative control across the entire platform. |
| `OPERATIONS_MANAGER` | Operations Manager | National fleet oversight, SLA escalations, cross-branch coordination. |
| `NOC_MANAGER` | NOC Manager | Head of National Operations Center (24/7 telematics, alerts, alarms). |
| `NOC_OPERATOR` | NOC Operator | Monitoring controller managing live tracking, speeding alerts, dispatches. |
| `SALES_MANAGER` | Sales Manager | Enterprise sales contracts, fleet onboarding proposals, customer quotas. |
| `SALES_EXECUTIVE` | Sales Executive | Field client acquisition and lead management. |
| `FINANCE_MANAGER` | Finance Manager | Revenue assurance, invoicing cycles, tax compliance, receivables. |
| `FINANCE_OFFICER` | Finance Officer | Invoice generation, payments reconciliation, ledger entries. |
| `INVENTORY_MANAGER` | Inventory Manager | Central and regional warehouse vaults, hardware IMEI and SIM tracking. |
| `INSTALLATION_MANAGER`| Installation Manager | Field technician queue, installation scheduling, QA standards. |
| `FIELD_TECHNICIAN` | Field Technician | On-site hardware mounting, sensor tie-in, customer OTP verification. |
| `CUSTOMER_SERVICE` | Customer Service Agent | Customer complaint tickets, helpdesk support, SLA inquiries. |
| `RESELLER_MANAGER` | Reseller Manager | Channel distributor quotas and wholesale hardware accounts. |
| `CUSTOMER_USER` | Customer Portal User | External fleet owner / client with read-only visibility into their assets. |

---

## 3. Foundational Permissions (`module.action` Pattern)

Initial permissions are partitioned into standardized domain modules:

| Permission Name | Module | Action | Description |
|---|---|---|---|
| `dashboard.view` | dashboard | view | Access and view the operations console dashboard. |
| `users.view` | users | view | Browse system user accounts. |
| `users.create` | users | create | Provision new staff accounts. |
| `users.update` | users | update | Modify user profiles and account statuses. |
| `roles.view` | roles | view | Inspect security roles and capabilities. |
| `roles.create` | roles | create | Define new roles. |
| `roles.update` | roles | update | Modify role definitions and permissions. |
| `permissions.view` | permissions | view | Browse the system permissions catalog. |
| `settings.view` | settings | view | View platform settings and sequence numbers. |
| `settings.update` | settings | update | Modify system parameters. |
| `audit_logs.view` | audit_logs | view | Review immutable security audit trail. |

*(Business module permissions for Customers, Vehicles, Devices, SIMs, Telematics, Inventory, and Finance will be added in their respective phases).*

---

## 4. Gates & Policies Implementation

### A. Super Admin Bypass & Inactive User Interceptor (`Gate::before`)
Configured in `App\Providers\AppServiceProvider`:
```php
Gate::before(function (User $user, string $ability) {
    // 1. Account status check: Inactive/suspended users are DENIED immediately
    if (! $user->isActive()) {
        return false;
    }

    // 2. Active Super Admin bypasses all application permission checks
    if ($user->isSuperAdmin()) {
        return true;
    }
});
```

### B. Dynamic Permission Evaluation (`Gate::after`)
```php
Gate::after(function (User $user, string $ability, ?bool $result) {
    if ($result !== null) {
        return $result;
    }

    if (! $user->isActive()) {
        return false;
    }

    return $user->hasPermission($ability);
});
```

### C. Foundational Policy: `RolePolicy`
Enforces permissions on role manipulation, explicitly forbidding deletion of protected system roles (`$role->is_system`).

---

## 5. Inertia Frontend Authorization Bridge

### Shared Props in `HandleInertiaRequests.php`
```php
'auth' => [
    'user' => $user ? [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'is_active' => (bool) $user->is_active,
    ] : null,
    'roles' => $user ? $user->roles()->where('roles.is_active', true)->pluck('name')->all() : [],
    'permissions' => $user ? (
        $user->isSuperAdmin()
            ? ['*']
            : $user->getAllPermissions()->pluck('name')->all()
    ) : [],
],
```

### React Hook: `useAuthorization()`
Location: `resources/js/lib/authorization.ts`
```tsx
import { useAuthorization } from '@/lib/authorization';

const { can, hasRole, isSuperAdmin } = useAuthorization();

if (can('audit_logs.view')) {
  // Render audit log navigation link
}
```

---

## 6. Seeders

Deterministic and idempotent seeders executed via:
```cmd
php artisan db:seed
```
- `RoleSeeder`: Seeds the 14 core system roles.
- `PermissionSeeder`: Seeds the 11 foundational permissions.
- `RolePermissionSeeder`: Maps baseline permissions to roles without duplicates.
- `DatabaseSeeder`: Orchestrates all seeders.

---

## 7. Automated Testing Suite

Location: `tests/Feature/Auth/RbacTest.php`  
Covers 14 exhaustive authorization assertions:
1. User assignment to role
2. Role granted permissions
3. Many-to-many relationship cardinality
4. Duplicate user-role assignment blocked by unique constraint
5. Duplicate role-permission assignment blocked by unique constraint
6. Explicit permission checking on User model
7. Gate denial for missing permissions
8. Gate authorization for granted permissions
9. Super Admin universal ability bypass
10. Inactive user denial despite Super Admin role
11. Inertia auth state cleanliness (no secrets leaked)
12. Server-side HTTP 403 Forbidden on unauthorized endpoint access
13. Authentication regression check with RBAC enabled
14. Authorized access to dashboard route
