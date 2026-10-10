<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'legal_name' => $this->faker->company() . ' (Private) Limited',
            'trade_name' => $this->faker->company(),
            'ntn' => (string) $this->faker->unique()->numberBetween(1000000, 9999999) . '-0',
            'strn' => (string) $this->faker->unique()->numberBetween(1000000000000, 9999999999999),
            'head_office_address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'country' => 'Pakistan',
            'primary_phone' => '+92-21-' . $this->faker->numberBetween(1000000, 9999999),
            'emergency_noc_phone' => '+92-300-' . $this->faker->numberBetween(1000000, 9999999),
            'email' => $this->faker->unique()->safeEmail(),
            'currency' => 'PKR',
            'timezone' => 'Asia/Karachi',
            'is_active' => true,
        ];
    }
}
