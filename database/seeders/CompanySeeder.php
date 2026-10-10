<?php

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        Company::updateOrCreate(
            ['legal_name' => 'VALS Tracking (Private) Limited'],
            [
                'trade_name' => 'VALS Tracking',
                'ntn' => '7194021-8',
                'strn' => '3277876123456',
                'incorporation_no' => '0142981',
                'head_office_address' => 'Plot 14-C, Main Shahrah-e-Faisal, Block 6, PECHS, Karachi',
                'city' => 'Karachi',
                'country' => 'Pakistan',
                'primary_phone' => '+92-21-34389901',
                'emergency_noc_phone' => '+92-300-8257662',
                'email' => 'operations@valstracking.com',
                'website' => 'https://valstracking.com',
                'currency' => 'PKR',
                'timezone' => 'Asia/Karachi',
                'is_active' => true,
            ]
        );
    }
}
