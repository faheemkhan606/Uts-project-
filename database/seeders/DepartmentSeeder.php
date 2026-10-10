<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        $company = Company::where('legal_name', 'VALS Tracking (Private) Limited')->first()
            ?? Company::first();

        $khiBranch = Branch::where('code', 'KHI')->first();

        $departments = [
            [
                'code' => 'EXEC',
                'name' => 'Executive Management & Corporate Governance',
                'head_of_department' => 'Faheem Khan',
                'employee_count' => 6,
                'branch_id' => null, // Company-wide
                'is_active' => true,
            ],
            [
                'code' => 'NOC',
                'name' => 'National Operations Center & Telematics Monitoring',
                'head_of_department' => 'Zubair Ahmed',
                'employee_count' => 24,
                'branch_id' => $khiBranch?->id,
                'is_active' => true,
            ],
            [
                'code' => 'FSM',
                'name' => 'Field Services, Deployment & Technician Ops',
                'head_of_department' => 'Rashid Mehmood',
                'employee_count' => 18,
                'branch_id' => null, // Company-wide
                'is_active' => true,
            ],
            [
                'code' => 'INV',
                'name' => 'Supply Chain, Hardware Vault & Inventory Control',
                'head_of_department' => 'Bilal Hassan',
                'employee_count' => 8,
                'branch_id' => $khiBranch?->id,
                'is_active' => true,
            ],
            [
                'code' => 'FIN',
                'name' => 'Finance, Billing, Taxation & Accounts',
                'head_of_department' => 'Marium Siddiqui',
                'employee_count' => 10,
                'branch_id' => null, // Company-wide
                'is_active' => true,
            ],
            [
                'code' => 'CS',
                'name' => 'Customer Experience, Helpdesk & Support Services',
                'head_of_department' => 'Ayesha Noor',
                'employee_count' => 12,
                'branch_id' => null, // Company-wide
                'is_active' => true,
            ],
        ];

        foreach ($departments as $deptData) {
            Department::updateOrCreate(
                [
                    'code' => $deptData['code'],
                    'company_id' => $company?->id,
                ],
                array_merge($deptData, [
                    'company_id' => $company?->id,
                ])
            );
        }
    }
}
