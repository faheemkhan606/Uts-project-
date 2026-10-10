<?php

namespace Database\Seeders;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently for development and testing.
     * Seeds deterministic baseline accounts including CUS-000101 to maintain prototype parity.
     */
    public function run(): void
    {
        $company = Company::where('legal_name', 'VALS Tracking (Private) Limited')->first()
            ?? Company::first();

        if (!$company) {
            return;
        }

        $khiBranch = Branch::where('company_id', $company->id)->where('code', 'KHI')->first()
            ?? Branch::where('company_id', $company->id)->first();
        $lheBranch = Branch::where('company_id', $company->id)->where('code', 'LHE')->first()
            ?? $khiBranch;
        $adminUser = User::where('email', 'admin@valstracking.com')->first()
            ?? User::first();

        $seedCustomers = [
            [
                'customer_no' => 'CUS-000101',
                'company_id' => $company->id,
                'branch_id' => $khiBranch->id,
                'customer_type' => CustomerType::Corporate,
                'legal_name' => 'Engro Fertilizers Logistics Division',
                'trade_name' => 'Engro Logistics',
                'display_name' => 'Engro Fertilizers Logistics',
                'status' => CustomerStatus::Active,
                'phone' => '+92-21-111-211-211',
                'email' => 'logistics@engro.com',
                'cnic' => '42101-1234567-1',
                'ntn' => '0189421-3',
                'strn' => '3277876123499',
                'website' => 'https://www.engro.com',
                'credit_limit' => 500000.00,
                'payment_terms' => 'Net 30 Days',
                'notes' => 'Key Corporate Account. 24/7 dedicated dispatch monitoring protocol.',
                'created_by' => $adminUser?->id,
                'updated_by' => $adminUser?->id,
            ],
            [
                'customer_no' => 'CUS-000102',
                'company_id' => $company->id,
                'branch_id' => $lheBranch->id,
                'customer_type' => CustomerType::Logistics,
                'legal_name' => 'Daewoo Express Fleet Operations',
                'trade_name' => 'Daewoo Express',
                'display_name' => 'Daewoo Express Pakistan',
                'status' => CustomerStatus::Active,
                'phone' => '+92-42-111-007-008',
                'email' => 'fleet@daewoo.com.pk',
                'cnic' => null,
                'ntn' => '1428901-5',
                'strn' => '3277876123488',
                'website' => 'https://www.daewoo.com.pk',
                'credit_limit' => 750000.00,
                'payment_terms' => 'Net 30 Days',
                'notes' => 'Inter-city bus passenger transit fleet telematics monitoring.',
                'created_by' => $adminUser?->id,
                'updated_by' => $adminUser?->id,
            ],
            [
                'customer_no' => 'CUS-000103',
                'company_id' => $company->id,
                'branch_id' => $khiBranch->id,
                'customer_type' => CustomerType::Individual,
                'legal_name' => 'Muhammad Bilal Siddiqui',
                'trade_name' => null,
                'display_name' => 'Muhammad Bilal Siddiqui',
                'status' => CustomerStatus::Active,
                'phone' => '+92-300-9281726',
                'email' => 'bilal.siddiqui@gmail.com',
                'cnic' => '42201-9876543-1',
                'ntn' => null,
                'strn' => null,
                'website' => null,
                'credit_limit' => 50000.00,
                'payment_terms' => 'Immediate / Advance',
                'notes' => 'Private vehicle security tracking unit.',
                'created_by' => $adminUser?->id,
                'updated_by' => $adminUser?->id,
            ],
        ];

        foreach ($seedCustomers as $cData) {
            Customer::updateOrCreate(
                [
                    'company_id' => $cData['company_id'],
                    'customer_no' => $cData['customer_no'],
                ],
                $cData
            );
        }
    }
}
