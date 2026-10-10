<?php

namespace Tests\Feature\Foundation;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\Foundation\OrganizationService;
use Database\Seeders\BranchSeeder;
use Database\Seeders\CompanySeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\WarehouseSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test 1: Company can exist.
     */
    public function test_company_can_exist(): void
    {
        $company = Company::where('legal_name', 'VALS Tracking (Private) Limited')->first();

        $this->assertNotNull($company);
        $this->assertTrue($company->isActive());
        $this->assertEquals('PKR', $company->currency);
    }

    /**
     * Test 2: Branch belongs to company.
     */
    public function test_branch_belongs_to_company(): void
    {
        $company = Company::firstOrFail();
        $branch = Branch::where('code', 'KHI')->firstOrFail();

        $this->assertNotNull($branch->company);
        $this->assertEquals($company->id, $branch->company->id);
        $this->assertTrue($company->branches->contains('id', $branch->id));
    }

    /**
     * Test 3: Department belongs to company.
     */
    public function test_department_belongs_to_company(): void
    {
        $company = Company::firstOrFail();
        $department = Department::where('code', 'EXEC')->firstOrFail();

        $this->assertNotNull($department->company);
        $this->assertEquals($company->id, $department->company->id);
        $this->assertTrue($company->departments->contains('id', $department->id));
    }

    /**
     * Test 4: Department can belong to branch.
     */
    public function test_department_can_belong_to_branch(): void
    {
        $branch = Branch::where('code', 'KHI')->firstOrFail();
        $nocDept = Department::where('code', 'NOC')->firstOrFail();

        $this->assertNotNull($nocDept->branch);
        $this->assertEquals($branch->id, $nocDept->branch->id);
        $this->assertTrue($branch->departments->contains('id', $nocDept->id));
    }

    /**
     * Test 5: Warehouse belongs to branch.
     */
    public function test_warehouse_belongs_to_branch(): void
    {
        $branch = Branch::where('code', 'KHI')->firstOrFail();
        $warehouse = Warehouse::where('code', 'WH-KHI-MAIN')->firstOrFail();

        $this->assertNotNull($warehouse->branch);
        $this->assertEquals($branch->id, $warehouse->branch->id);
        $this->assertTrue($branch->warehouses->contains('id', $warehouse->id));
    }

    /**
     * Test 6: User can belong to company.
     */
    public function test_user_can_belong_to_company(): void
    {
        $company = Company::firstOrFail();
        $user = User::factory()->create([
            'company_id' => $company->id,
        ]);

        $this->assertNotNull($user->company);
        $this->assertEquals($company->id, $user->company->id);
        $this->assertTrue($user->hasOrganization());
    }

    /**
     * Test 7: User can belong to branch.
     */
    public function test_user_can_belong_to_branch(): void
    {
        $company = Company::firstOrFail();
        $branch = Branch::where('code', 'KHI')->firstOrFail();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $this->assertNotNull($user->branch);
        $this->assertEquals($branch->id, $user->branch->id);
        $this->assertEquals('branch', $user->getOrganizationScope());
    }

    /**
     * Test 8: User can belong to department.
     */
    public function test_user_can_belong_to_department(): void
    {
        $company = Company::firstOrFail();
        $branch = Branch::where('code', 'KHI')->firstOrFail();
        $dept = Department::where('code', 'NOC')->firstOrFail();

        $user = User::factory()->create([
            'company_id' => $company->id,
            'branch_id' => $branch->id,
            'department_id' => $dept->id,
        ]);

        $this->assertNotNull($user->department);
        $this->assertEquals($dept->id, $user->department->id);
        $this->assertEquals('department', $user->getOrganizationScope());
    }

    /**
     * Test 9: Invalid cross-company branch assignment is rejected.
     */
    public function test_invalid_cross_company_branch_assignment_is_rejected(): void
    {
        $companyA = Company::firstOrFail();
        $companyB = Company::factory()->create(['legal_name' => 'Foreign Corp B']);
        $branchOfB = Branch::factory()->create(['company_id' => $companyB->id, 'code' => 'FRB']);

        $service = app(OrganizationService::class);

        $this->expectException(ValidationException::class);
        $service->validateHierarchy($companyA->id, $branchOfB->id, null);
    }

    /**
     * Test 10: Invalid cross-company department assignment is rejected.
     */
    public function test_invalid_cross_company_department_assignment_is_rejected(): void
    {
        $companyA = Company::firstOrFail();
        $companyB = Company::factory()->create(['legal_name' => 'Foreign Corp C']);
        $deptOfB = Department::factory()->create(['company_id' => $companyB->id, 'code' => 'FRD']);

        $service = app(OrganizationService::class);

        $this->expectException(ValidationException::class);
        $service->validateHierarchy($companyA->id, null, $deptOfB->id);
    }

    /**
     * Test 11: Invalid branch/department hierarchy is rejected.
     */
    public function test_invalid_branch_department_hierarchy_is_rejected(): void
    {
        $company = Company::firstOrFail();
        $branchKHI = Branch::where('code', 'KHI')->firstOrFail();
        $branchLHE = Branch::where('code', 'LHE')->firstOrFail();

        // Department specifically tied to KHI branch
        $deptKHI = Department::where('code', 'NOC')->firstOrFail();

        $service = app(OrganizationService::class);

        // Attempting to assign user to LHE branch with KHI-specific department must fail
        $this->expectException(ValidationException::class);
        $service->validateHierarchy($company->id, $branchLHE->id, $deptKHI->id);
    }

    /**
     * Test 12: Duplicate branch code within same company is rejected by unique constraint.
     */
    public function test_duplicate_branch_code_within_same_company_is_rejected(): void
    {
        $company = Company::firstOrFail();

        $this->expectException(QueryException::class);
        Branch::create([
            'company_id' => $company->id,
            'code' => 'KHI', // Existing code in seed
            'name' => 'Duplicate Karachi Branch',
            'city' => 'Karachi',
            'province' => 'Sindh',
            'address' => 'Test Address',
            'phone' => '+92-21-000000',
            'manager_name' => 'Test Manager',
        ]);
    }

    /**
     * Test 13: Duplicate warehouse code is rejected by unique constraint.
     */
    public function test_duplicate_warehouse_code_is_rejected(): void
    {
        $branch = Branch::where('code', 'KHI')->firstOrFail();

        $this->expectException(QueryException::class);
        Warehouse::create([
            'branch_id' => $branch->id,
            'code' => 'WH-KHI-MAIN', // Existing code
            'name' => 'Duplicate Warehouse',
            'location' => 'Test Location',
            'manager_name' => 'Test Manager',
        ]);
    }

    /**
     * Test 14: Inactive user cannot perform protected organization mutation.
     */
    public function test_inactive_user_cannot_perform_organization_mutation(): void
    {
        $inactiveSuperAdmin = User::factory()->create([
            'is_active' => false,
        ]);
        $inactiveSuperAdmin->assignRole('SUPER_ADMIN');

        $targetUser = User::factory()->create();

        $response = $this->actingAs($inactiveSuperAdmin)->postJson("/admin/users/{$targetUser->id}/organization", [
            'company_id' => Company::firstOrFail()->id,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test 15: User without organization permission receives 403.
     */
    public function test_user_without_organization_permission_receives_403(): void
    {
        $operator = User::factory()->create();
        $operator->assignRole('NOC_OPERATOR'); // Has no users.organization.update

        $targetUser = User::factory()->create();

        $response = $this->actingAs($operator)->postJson("/admin/users/{$targetUser->id}/organization", [
            'company_id' => Company::firstOrFail()->id,
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test 16: Authorized user can perform allowed organization action.
     */
    public function test_authorized_user_can_perform_allowed_organization_action(): void
    {
        $opsManager = User::factory()->create();
        $opsManager->assignRole('OPERATIONS_MANAGER'); // Has users.organization.update and companies.view

        $targetUser = User::factory()->create();
        $company = Company::firstOrFail();
        $branch = Branch::where('code', 'KHI')->firstOrFail();

        $response = $this->actingAs($opsManager)->postJson("/admin/users/{$targetUser->id}/organization", [
            'company_id' => $company->id,
            'branch_id' => $branch->id,
        ]);

        $response->assertStatus(200);
        $this->assertEquals($company->id, $targetUser->fresh()->company_id);
        $this->assertEquals($branch->id, $targetUser->fresh()->branch_id);
    }

    /**
     * Test 17: Seeders are idempotent.
     */
    public function test_seeders_are_idempotent(): void
    {
        $initialCompanies = Company::count();
        $initialBranches = Branch::count();
        $initialDepts = Department::count();
        $initialWarehouses = Warehouse::count();

        // Run seeders again
        $this->seed(CompanySeeder::class);
        $this->seed(BranchSeeder::class);
        $this->seed(DepartmentSeeder::class);
        $this->seed(WarehouseSeeder::class);

        $this->assertEquals($initialCompanies, Company::count());
        $this->assertEquals($initialBranches, Branch::count());
        $this->assertEquals($initialDepts, Department::count());
        $this->assertEquals($initialWarehouses, Warehouse::count());
    }

    /**
     * Test 18: Existing authentication remains functional.
     */
    public function test_existing_authentication_remains_functional(): void
    {
        $user = User::factory()->create([
            'email' => 'auth-verify@valstracking.com',
            'password' => Hash::make('VerifyAuth123!'),
        ]);

        $response = $this->post('/login', [
            'email' => 'auth-verify@valstracking.com',
            'password' => 'VerifyAuth123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test 19: Existing RBAC tests and gate functionality remain operational.
     */
    public function test_existing_rbac_remains_operational_with_organization(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('SUPER_ADMIN');

        $this->assertTrue($superAdmin->can('dashboard.view'));
        $this->assertTrue($superAdmin->can('companies.view'));
        $this->assertTrue($superAdmin->can('branches.create'));
        $this->assertEquals('global', $superAdmin->getOrganizationScope());
    }
}
