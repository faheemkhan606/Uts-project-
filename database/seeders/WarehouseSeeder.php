<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class WarehouseSeeder extends Seeder
{
    /**
     * Run the database seeds idempotently.
     */
    public function run(): void
    {
        $khiBranch = Branch::where('code', 'KHI')->first();
        $lheBranch = Branch::where('code', 'LHE')->first();

        if ($khiBranch) {
            Warehouse::updateOrCreate(
                ['code' => 'WH-KHI-MAIN'],
                [
                    'branch_id' => $khiBranch->id,
                    'name' => 'Central Warehouse & Hardware Vault',
                    'location' => 'Plot 14-C Ground Floor, PECHS Block 6, Karachi',
                    'capacity' => '15000 Units',
                    'manager_name' => 'Bilal Hassan',
                    'is_active' => true,
                ]
            );
        }

        if ($lheBranch) {
            Warehouse::updateOrCreate(
                ['code' => 'WH-LHE-REG'],
                [
                    'branch_id' => $lheBranch->id,
                    'name' => 'Regional Warehouse & Rapid Dispatch Depot',
                    'location' => 'Gulberg III Logistics Center, Lahore',
                    'capacity' => '5000 Units',
                    'manager_name' => 'Shahid Imran',
                    'is_active' => true,
                ]
            );
        }
    }
}
