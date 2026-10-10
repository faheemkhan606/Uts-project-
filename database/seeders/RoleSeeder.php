<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'SUPER_ADMIN',
                'display_name' => 'Super Admin',
                'description' => 'Unrestricted administrative access to the entire VALS enterprise platform.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'OPERATIONS_MANAGER',
                'display_name' => 'Operations Manager',
                'description' => 'Oversees national fleet operations, customer fulfillment, and NOC protocols.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'NOC_MANAGER',
                'display_name' => 'NOC Manager',
                'description' => 'Head of National Operations Center. Oversees 24/7 telematics monitoring and alarms.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'NOC_OPERATOR',
                'display_name' => 'NOC Operator',
                'description' => '24/7 monitoring controller handling real-time telemetry alerts, tracking, and dispatches.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'SALES_MANAGER',
                'display_name' => 'Sales Manager',
                'description' => 'Manages enterprise sales pipeline, lead conversion, and contract proposals.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'SALES_EXECUTIVE',
                'display_name' => 'Sales Executive',
                'description' => 'Customer acquisition and account prospecting representative.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'FINANCE_MANAGER',
                'display_name' => 'Finance Manager',
                'description' => 'Oversees billing schedules, tax compliance, receipts, and receivables.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'FINANCE_OFFICER',
                'display_name' => 'Finance Officer',
                'description' => 'Processes customer invoices, payments reconciliation, and revenue assurance.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'INVENTORY_MANAGER',
                'display_name' => 'Inventory Manager',
                'description' => 'Controls warehouse vaults, serialized GPS hardware, SIM cards, and stock receipts.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'INSTALLATION_MANAGER',
                'display_name' => 'Installation Manager',
                'description' => 'Supervises field engineer dispatching, scheduling, and installation QA checklists.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'FIELD_TECHNICIAN',
                'display_name' => 'Field Technician',
                'description' => 'Performs on-site vehicle installations, sensor calibrations, and customer OTP handshakes.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'CUSTOMER_SERVICE',
                'display_name' => 'Customer Service Agent',
                'description' => 'Handles customer complaints, SLA inquiry tickets, and service desk requests.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'RESELLER_MANAGER',
                'display_name' => 'Reseller Manager',
                'description' => 'Manages dealer partnerships, bulk hardware quotas, and external distributors.',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'CUSTOMER_USER',
                'display_name' => 'Customer Portal User',
                'description' => 'Authorized fleet manager or vehicle owner with read-only view of assigned fleet.',
                'is_system' => true,
                'is_active' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }
    }
}
