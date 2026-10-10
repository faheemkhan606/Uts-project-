<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class DepartmentFactory extends Factory
{
    protected $model = Department::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => null,
            'code' => strtoupper($this->faker->unique()->lexify('DEP?')),
            'name' => $this->faker->jobTitle() . ' Division',
            'head_of_department' => $this->faker->name(),
            'employee_count' => $this->faker->numberBetween(5, 50),
            'is_active' => true,
        ];
    }
}
