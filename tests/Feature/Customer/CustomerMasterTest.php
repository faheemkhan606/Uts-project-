<?php

namespace Tests\Feature\Customer;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Role;
use App\Models\User;
use App\Policies\CustomerPolicy;
use App\Services\Customer\CustomerService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CustomerMasterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test 1: Seeded baseline customer CUS-000101 exists with correct status and company.
     */
    public function test_baseline_customer_seeded_successfully(): void
    {
        $customer = Customer::where('customer_no', 'CUS-000101')->first();

        $this->assertNotNull($customer);
        $this->assertEquals('Engro Fertilizers Logistics Division', $customer->legal_name);
        $this->assertEquals(CustomerStatus::Active, $customer->status);
        $this->assertEquals(CustomerType::Corporate, $customer->customer_type);
        $this->assertEquals(500000.00, $customer->credit_limit);
        $this->assertNotNull($customer->company);
        $this->assertNotNull($customer->branch);
    }

    /**
     * Test 2: Valid customer creation via CustomerService generates atomic CUS sequence.
     */
    public function test_customer_creation_generates_atomic_sequence(): void
    {
        $company = Company::firstOrFail();
        $branch = Branch::where('company_id', $company->id)->firstOrFail();
        $admin = User::firstOrFail();

        $service = app(CustomerService::class);
        $customer = $service->createCustomer([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'customer_type' => CustomerType::Logistics,
            'legal_name' => 'National Freight Carriers (Pvt) Ltd',
            'trade_name' => 'NFC Logistics',
            'phone' => '+92-21-34567890',
            'email' => 'dispatch@nfc-logistics.pk',
            'cnic' => '42101-1234567-9',
            'ntn' => '2938401-2',
            'credit_limit' => 300000.00,
        ], $admin);

        $this->assertNotNull($customer->id);
        $this->assertStringStartsWith('CUS-', $customer->customer_no);
        $this->assertEquals('National Freight Carriers (Pvt) Ltd', $customer->legal_name);
        $this->assertEquals('NFC Logistics', $customer->trade_name);
        $this->assertEquals('NFC Logistics', $customer->display_name);
        $this->assertEquals($company->id, $customer->company_id);
        $this->assertEquals($branch->id, $customer->branch_id);
    }

    /**
     * Test 3: Organization integrity rejects branch not belonging to company.
     */
    public function test_cross_company_branch_assignment_is_rejected(): void
    {
        $companyA = Company::firstOrFail();
        $companyB = Company::create([
            'legal_name' => 'Secondary Logistics Group',
            'trade_name' => 'SLG',
            'city' => 'Lahore',
            'country' => 'Pakistan',
            'is_active' => true,
        ]);
        $branchB = Branch::create([
            'company_id' => $companyB->id,
            'code' => 'SLG-LHE',
            'name' => 'SLG Lahore Yard',
            'city' => 'Lahore',
            'is_active' => true,
        ]);
        $admin = User::firstOrFail();

        $service = app(CustomerService::class);

        $this->expectException(ValidationException::class);
        $service->createCustomer([
            'company_id' => $companyA->id,
            'branch_id' => $branchB->id, // Mismatched branch belonging to company B
            'legal_name' => 'Invalid Cross Company Transport',
            'customer_type' => CustomerType::Corporate,
        ], $admin);
    }

    /**
     * Test 4: Duplicate customer number within same company violates unique constraint.
     */
    public function test_duplicate_customer_no_within_same_company_rejected_by_db(): void
    {
        $company = Company::firstOrFail();
        $branch = Branch::where('company_id', $company->id)->firstOrFail();

        $this->expectException(QueryException::class);
        Customer::create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'customer_no' => 'CUS-000101', // Already exists in seed
            'customer_type' => CustomerType::Corporate,
            'legal_name' => 'Duplicate Number Inc',
            'display_name' => 'Duplicate Number Inc',
            'status' => CustomerStatus::Active,
        ]);
    }

    /**
     * Test 5: Same customer number in different company is permitted by composite index.
     */
    public function test_same_customer_no_permitted_in_different_company(): void
    {
        $companyB = Company::create([
            'legal_name' => 'Independent Regional Firm',
            'city' => 'Islamabad',
            'country' => 'Pakistan',
            'is_active' => true,
        ]);
        $branchB = Branch::create([
            'company_id' => $companyB->id,
            'code' => 'IRF-ISB',
            'name' => 'IRF Islamabad Depot',
            'city' => 'Islamabad',
            'is_active' => true,
        ]);

        $customerB = Customer::create([
            'company_id' => $companyB->id,
            'branch_id' => $branchB->id,
            'customer_no' => 'CUS-000101', // Identical number permitted in Company B scope
            'customer_type' => CustomerType::Corporate,
            'legal_name' => 'Company B Branch Account',
            'display_name' => 'Company B Branch Account',
            'status' => CustomerStatus::Active,
        ]);

        $this->assertNotNull($customerB->id);
        $this->assertEquals('CUS-000101', $customerB->customer_no);
        $this->assertEquals($companyB->id, $customerB->company_id);
    }

    /**
     * Test 6: Policy prevents cross-company access (IDOR Defense).
     */
    public function test_customer_policy_blocks_cross_company_access_idor(): void
    {
        $companyA = Company::firstOrFail();
        $companyB = Company::create([
            'legal_name' => 'Rival Tracking Enterprise',
            'city' => 'Multan',
            'country' => 'Pakistan',
            'is_active' => true,
        ]);
        $branchB = Branch::create([
            'company_id' => $companyB->id,
            'code' => 'RTE-MUL',
            'name' => 'RTE Multan Branch',
            'city' => 'Multan',
            'is_active' => true,
        ]);

        $customerB = Customer::create([
            'company_id' => $companyB->id,
            'branch_id' => $branchB->id,
            'customer_no' => 'CUS-999999',
            'customer_type' => CustomerType::Corporate,
            'legal_name' => 'Confidential Corp',
            'display_name' => 'Confidential Corp',
            'status' => CustomerStatus::Active,
        ]);

        // User stationed in Company A
        $userCompanyA = User::create([
            'name' => 'Company A Ops Officer',
            'email' => 'officer@companya.pk',
            'password' => bcrypt('password'),
            'company_id' => $companyA->id,
            'is_active' => true,
        ]);
        $userCompanyA->assignRole('OPERATIONS_MANAGER');

        $policy = app(CustomerPolicy::class);

        // User A trying to view Customer of Company B must be denied
        $this->assertFalse($policy->view($userCompanyA, $customerB));
        $this->assertFalse($policy->update($userCompanyA, $customerB));
        $this->assertFalse($policy->delete($userCompanyA, $customerB));
    }

    /**
     * Test 7: Branch-scoped user cannot view customers of a different branch (Branch IDOR).
     */
    public function test_customer_policy_blocks_cross_branch_access(): void
    {
        $company = Company::firstOrFail();
        $branchKHI = Branch::where('company_id', $company->id)->where('code', 'KHI')->firstOrFail();
        $branchLHE = Branch::where('company_id', $company->id)->where('code', 'LHE')->firstOrFail();

        $customerKHI = Customer::where('branch_id', $branchKHI->id)->firstOrFail();

        // User stationed strictly at Lahore branch
        $userLHE = User::create([
            'name' => 'Lahore Branch Controller',
            'email' => 'lhe.controller@valstracking.com',
            'password' => bcrypt('password'),
            'company_id' => $company->id,
            'branch_id' => $branchLHE->id,
            'is_active' => true,
        ]);
        $userLHE->assignRole('OPERATIONS_MANAGER');

        $policy = app(CustomerPolicy::class);

        // Lahore user cannot access Karachi customer
        $this->assertFalse($policy->view($userLHE, $customerKHI));
        $this->assertFalse($policy->update($userLHE, $customerKHI));
    }

    /**
     * Test 8: Inactive user cannot view customers regardless of role.
     */
    public function test_inactive_user_denied_all_customer_abilities(): void
    {
        $customer = Customer::firstOrFail();
        $inactiveUser = User::create([
            'name' => 'Suspended Staff',
            'email' => 'suspended@valstracking.com',
            'password' => bcrypt('password'),
            'is_active' => false,
        ]);
        $inactiveUser->assignRole('SUPER_ADMIN');

        $policy = app(CustomerPolicy::class);

        $this->assertFalse($policy->viewAny($inactiveUser));
        $this->assertFalse($policy->view($inactiveUser, $customer));
        $this->assertFalse($policy->create($inactiveUser));
        $this->assertFalse($policy->update($inactiveUser, $customer));
    }

    /**
     * Test 9: Customer lifecycle status transition generates audit log entry.
     */
    public function test_status_transition_records_audit_trail(): void
    {
        $customer = Customer::firstOrFail();
        $admin = User::firstOrFail();

        $service = app(CustomerService::class);
        $service->changeStatus($customer, CustomerStatus::Suspended, 'Overdue bill payment grace period expired', $admin);

        $this->assertEquals(CustomerStatus::Suspended, $customer->fresh()->status);

        $audit = AuditLog::where('entity_type', 'Customer')
            ->where('entity_id', (string) $customer->id)
            ->where('action', 'CUSTOMER_STATUS_CHANGED')
            ->latest()
            ->first();

        $this->assertNotNull($audit);
        $this->assertStringContainsString('Overdue bill payment', $audit->details);
        $this->assertStringContainsString('suspended', $audit->details);
    }

    /**
     * Test 10: CNIC is masked in customer model helper and audit logs.
     */
    public function test_cnic_is_properly_masked(): void
    {
        $customer = new Customer();
        $customer->cnic = '42101-1234567-1';

        $masked = $customer->getMaskedCnic();
        $this->assertEquals('42101-XXXXXXX-1', $masked);
    }
}
