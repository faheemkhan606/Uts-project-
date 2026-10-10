<?php

namespace Database\Factories;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'name' => $this->faker->city() . ' Branch Office',
            'city' => $this->faker->city(),
            'province' => 'Sindh',
            'address' => $this->faker->streetAddress(),
            'phone' => '+92-21-' . $this->faker->numberBetween(1000000, 9999999),
            'manager_name' => $this->faker->name(),
            'is_active' => true,
        ];
    }
}
