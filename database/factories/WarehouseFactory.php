<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'code' => 'WH-' . strtoupper($this->faker->unique()->lexify('????')),
            'name' => $this->faker->city() . ' Storage Depot',
            'location' => $this->faker->address(),
            'capacity' => '5000 Units',
            'manager_name' => $this->faker->name(),
            'is_active' => true,
        ];
    }
}
