<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        $company = Company::where('legal_name', 'VALS Tracking (Private) Limited')->first()
            ?? Company::first();

        $branches = [
            [
                'code' => 'KHI',
                'name' => 'Karachi Head Office & Operations Center',
                'city' => 'Karachi',
                'province' => 'Sindh',
                'address' => 'Plot 14-C, Shahrah-e-Faisal, Block 6, PECHS, Karachi',
                'phone' => '+92-21-34389901',
                'manager_name' => 'Tariq Mehmood',
                'is_active' => true,
            ],
            [
                'code' => 'LHE',
                'name' => 'Lahore Central Regional Hub',
                'city' => 'Lahore',
                'province' => 'Punjab',
                'address' => 'Office 402, Al-Hafeez Heights, Gulberg III, Lahore',
                'phone' => '+92-42-35789902',
                'manager_name' => 'Kamran Bashir',
                'is_active' => true,
            ],
            [
                'code' => 'ISB',
                'name' => 'Islamabad Capital Territory Station',
                'city' => 'Islamabad',
                'province' => 'Federal Capital',
                'address' => 'Plot 18, Blue Area, Sector F-6, Islamabad',
                'phone' => '+92-51-2899011',
                'manager_name' => 'Asadullah Khan',
                'is_active' => true,
            ],
            [
                'code' => 'RWP',
                'name' => 'Rawalpindi Field Service Center',
                'city' => 'Rawalpindi',
                'province' => 'Punjab',
                'address' => 'Shop 12-14, Auto Complex, Saddar, Rawalpindi',
                'phone' => '+92-51-5589920',
                'manager_name' => 'Rizwan Qureshi',
                'is_active' => true,
            ],
        ];

        foreach ($branches as $branchData) {
            Branch::updateOrCreate(
                [
                    'code' => $branchData['code'],
                    'company_id' => $company?->id,
                ],
                array_merge($branchData, [
                    'company_id' => $company?->id,
                ])
            );
        }
    }
}
