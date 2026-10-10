<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'dashboard.view',
                'display_name' => 'View Dashboard',
                'description' => 'Access and view the main operational dashboard.',
                'module' => 'dashboard',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'users.view',
                'display_name' => 'View Users',
                'description' => 'Browse and inspect system user profiles.',
                'module' => 'users',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'users.create',
                'display_name' => 'Create Users',
                'description' => 'Provision new staff user accounts.',
                'module' => 'users',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'users.update',
                'display_name' => 'Update Users',
                'description' => 'Edit user profiles, assignments, and account status.',
                'module' => 'users',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'roles.view',
                'display_name' => 'View Roles',
                'description' => 'Inspect role definitions and assigned capabilities.',
                'module' => 'roles',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'roles.create',
                'display_name' => 'Create Roles',
                'description' => 'Define new enterprise roles.',
                'module' => 'roles',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'roles.update',
                'display_name' => 'Update Roles',
                'description' => 'Modify role definitions and granted permissions.',
                'module' => 'roles',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'permissions.view',
                'display_name' => 'View Permissions',
                'description' => 'Inspect the security permissions registry.',
                'module' => 'permissions',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'settings.view',
                'display_name' => 'View Settings',
                'description' => 'Inspect platform settings and numbering sequences.',
                'module' => 'settings',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'settings.update',
                'display_name' => 'Update Settings',
                'description' => 'Modify organization parameters and sequence prefixes.',
                'module' => 'settings',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'audit_logs.view',
                'display_name' => 'View Audit Logs',
                'description' => 'Access and review the tamper-evident security audit trail.',
                'module' => 'audit_logs',
                'action' => 'view',
                'is_system' => true,
            ],
            // Organization Foundation Permissions
            [
                'name' => 'companies.view',
                'display_name' => 'View Companies',
                'description' => 'Inspect company profiles and legal entities.',
                'module' => 'companies',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'companies.create',
                'display_name' => 'Create Companies',
                'description' => 'Register new company entities in the organization hierarchy.',
                'module' => 'companies',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'companies.update',
                'display_name' => 'Update Companies',
                'description' => 'Modify company entity details, addresses, and tax parameters.',
                'module' => 'companies',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'branches.view',
                'display_name' => 'View Branches',
                'description' => 'Inspect branch network, contact details, and managers.',
                'module' => 'branches',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'branches.create',
                'display_name' => 'Create Branches',
                'description' => 'Establish new operational branch stations.',
                'module' => 'branches',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'branches.update',
                'display_name' => 'Update Branches',
                'description' => 'Modify branch information, operational status, and managers.',
                'module' => 'branches',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'departments.view',
                'display_name' => 'View Departments',
                'description' => 'Inspect organizational departments and leadership.',
                'module' => 'departments',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'departments.create',
                'display_name' => 'Create Departments',
                'description' => 'Define new corporate or branch departments.',
                'module' => 'departments',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'departments.update',
                'display_name' => 'Update Departments',
                'description' => 'Modify department hierarchy, leadership, and operational status.',
                'module' => 'departments',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'warehouses.view',
                'display_name' => 'View Warehouses',
                'description' => 'Inspect warehouse locations and storage capacities.',
                'module' => 'warehouses',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'warehouses.create',
                'display_name' => 'Create Warehouses',
                'description' => 'Register new central or regional warehouse facilities.',
                'module' => 'warehouses',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'warehouses.update',
                'display_name' => 'Update Warehouses',
                'description' => 'Modify warehouse parameters, addresses, and managers.',
                'module' => 'warehouses',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'users.organization.update',
                'display_name' => 'Assign User Organization',
                'description' => 'Assign and re-assign user staff to company, branch, and department.',
                'module' => 'users',
                'action' => 'organization_update',
                'is_system' => true,
            ],
            // Customer Master Permissions (Phase 02 · Step 01)
            [
                'name' => 'customers.view',
                'display_name' => 'View Customers',
                'description' => 'Browse and inspect customer master records within permitted organization scope.',
                'module' => 'customers',
                'action' => 'view',
                'is_system' => true,
            ],
            [
                'name' => 'customers.create',
                'display_name' => 'Create Customers',
                'description' => 'Register new customer accounts and generate sequential customer numbers.',
                'module' => 'customers',
                'action' => 'create',
                'is_system' => true,
            ],
            [
                'name' => 'customers.update',
                'display_name' => 'Update Customers',
                'description' => 'Modify customer profile, commercial parameters, and lifecycle status.',
                'module' => 'customers',
                'action' => 'update',
                'is_system' => true,
            ],
            [
                'name' => 'customers.delete',
                'display_name' => 'Archive Customers',
                'description' => 'Soft delete or terminate customer master accounts.',
                'module' => 'customers',
                'action' => 'delete',
                'is_system' => true,
            ],
            [
                'name' => 'customers.export',
                'display_name' => 'Export Customers',
                'description' => 'Export customer registries to spreadsheet or reporting formats.',
                'module' => 'customers',
                'action' => 'export',
                'is_system' => true,
            ],
        ];

        foreach ($permissions as $permData) {
            Permission::updateOrCreate(
                ['name' => $permData['name']],
                $permData
            );
        }
    }
}
