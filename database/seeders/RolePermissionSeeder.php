<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allPermissions = Permission::all();

        // 1. SUPER_ADMIN: Receives all permissions explicitly in pivot (in addition to Gate::before bypass)
        $superAdmin = Role::where('name', 'SUPER_ADMIN')->first();
        if ($superAdmin) {
            $superAdmin->permissions()->sync($allPermissions->pluck('id')->all());
        }

        // 2. OPERATIONS_MANAGER
        $opsManager = Role::where('name', 'OPERATIONS_MANAGER')->first();
        if ($opsManager) {
            $opsPermissions = Permission::whereIn('name', [
                'dashboard.view',
                'users.view',
                'settings.view',
                'audit_logs.view',
                'companies.view',
                'branches.view',
                'branches.create',
                'branches.update',
                'departments.view',
                'departments.create',
                'departments.update',
                'warehouses.view',
                'warehouses.create',
                'warehouses.update',
                'users.organization.update',
                'customers.view',
                'customers.create',
                'customers.update',
                'customers.delete',
                'customers.export',
            ])->pluck('id');
            $opsManager->permissions()->sync($opsPermissions);
        }

        // 2b. SALES_MANAGER
        $salesManager = Role::where('name', 'SALES_MANAGER')->first();
        if ($salesManager) {
            $salesPerms = Permission::whereIn('name', [
                'dashboard.view',
                'customers.view',
                'customers.create',
                'customers.update',
                'customers.export',
            ])->pluck('id');
            $salesManager->permissions()->sync($salesPerms);
        }

        // 2c. SALES_EXECUTIVE
        $salesExec = Role::where('name', 'SALES_EXECUTIVE')->first();
        if ($salesExec) {
            $salesExecPerms = Permission::whereIn('name', [
                'dashboard.view',
                'customers.view',
                'customers.create',
            ])->pluck('id');
            $salesExec->permissions()->sync($salesExecPerms);
        }

        // 2d. FINANCE_MANAGER
        $finManager = Role::where('name', 'FINANCE_MANAGER')->first();
        if ($finManager) {
            $finPerms = Permission::whereIn('name', [
                'dashboard.view',
                'customers.view',
                'customers.update',
                'customers.export',
            ])->pluck('id');
            $finManager->permissions()->sync($finPerms);
        }

        // 3. INVENTORY_MANAGER
        $invManager = Role::where('name', 'INVENTORY_MANAGER')->first();
        if ($invManager) {
            $invPermissions = Permission::whereIn('name', [
                'dashboard.view',
                'warehouses.view',
                'warehouses.update',
            ])->pluck('id');
            $invManager->permissions()->sync($invPermissions);
        }

        // 3. NOC_MANAGER
        $nocManager = Role::where('name', 'NOC_MANAGER')->first();
        if ($nocManager) {
            $nocPermissions = Permission::whereIn('name', [
                'dashboard.view',
                'audit_logs.view',
            ])->pluck('id');
            $nocManager->permissions()->sync($nocPermissions);
        }

        // 4. Default operational roles granted base dashboard view
        $baseRoles = Role::whereIn('name', [
            'NOC_OPERATOR',
            'SALES_MANAGER',
            'SALES_EXECUTIVE',
            'FINANCE_MANAGER',
            'FINANCE_OFFICER',
            'INVENTORY_MANAGER',
            'INSTALLATION_MANAGER',
            'FIELD_TECHNICIAN',
            'CUSTOMER_SERVICE',
            'RESELLER_MANAGER',
            'CUSTOMER_USER',
        ])->get();

        $dashboardViewPerm = Permission::where('name', 'dashboard.view')->first();
        if ($dashboardViewPerm) {
            foreach ($baseRoles as $role) {
                if (!$role->permissions()->where('permissions.id', $dashboardViewPerm->id)->exists()) {
                    $role->permissions()->attach($dashboardViewPerm->id);
                }
            }
        }
    }
}
