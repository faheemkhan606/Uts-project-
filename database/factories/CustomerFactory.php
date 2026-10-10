<?php

namespace Database\Factories;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    protected static int $sequenceNumber = 100;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Resolve company first, then ensure branch strictly belongs to that company
        $company = Company::inRandomOrder()->first() ?? Company::factory()->create();
        $branch = Branch::where('company_id', $company->id)->inRandomOrder()->first()
            ?? Branch::factory()->create(['company_id' => $company->id]);

        $seq = ++static::$sequenceNumber;
        $customerNo = sprintf('CUS-%06d', $seq);

        $legalName = fake()->company();
        $tradeName = fake()->boolean(60) ? fake()->companySuffix() . ' Fleet' : null;
        $displayName = $tradeName ?: $legalName;

        return [
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'customer_no' => $customerNo,
            'customer_type' => fake()->randomElement(CustomerType::cases()),
            'legal_name' => $legalName,
            'trade_name' => $tradeName,
            'display_name' => $displayName,
            'status' => CustomerStatus::Active,
            'phone' => '+92 3' . fake()->numerify('## #######'),
            'email' => fake()->safeEmail(),
            'cnic' => '42' . fake()->numerify('###-#######-#'),
            'ntn' => fake()->numerify('#######-#'),
            'strn' => fake()->numerify('#############'),
            'website' => fake()->boolean(40) ? 'https://www.' . fake()->domainName() : null,
            'credit_limit' => fake()->randomElement([100000.00, 250000.00, 500000.00, 1000000.00]),
            'payment_terms' => 'Net 30 Days',
            'notes' => 'Synthetic test customer record for automated verification.',
            'created_by' => User::inRandomOrder()->value('id'),
            'updated_by' => User::inRandomOrder()->value('id'),
        ];
    }

    /**
     * Set state to corporate customer
     */
    public function corporate(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => CustomerType::Corporate,
        ]);
    }

    /**
     * Set state to individual customer
     */
    public function individual(): static
    {
        return $this->state(fn (array $attributes) => [
            'customer_type' => CustomerType::Individual,
            'trade_name' => null,
            'legal_name' => fake()->name(),
        ]);
    }

    /**
     * Set state to suspended customer
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CustomerStatus::Suspended,
        ]);
    }
}
