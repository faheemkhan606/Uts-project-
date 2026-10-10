<?php

namespace Tests\Feature\Auth;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed foundational roles and permissions
        $this->seed();
    }

    /**
     * Test 1: User can have a role.
     */
    public function test_user_can_have_a_role(): void
    {
        $user = User::factory()->create();
        $user->assignRole('NOC_OPERATOR');

        $this->assertTrue($user->hasRole('NOC_OPERATOR'));
        $this->assertCount(1, $user->roles);
    }

    /**
     * Test 2: Role can have permissions.
     */
    public function test_role_can_have_permissions(): void
    {
        $role = Role::where('name', 'NOC_MANAGER')->firstOrFail();

        $this->assertTrue($role->hasPermission('dashboard.view'));
        $this->assertTrue($role->hasPermission('audit_logs.view'));
    }

    /**
     * Test 3: Permission can belong to multiple roles.
     */
    public function test_permission_can_belong_to_multiple_roles(): void
    {
        $permission = Permission::where('name', 'dashboard.view')->firstOrFail();

        $this->assertGreaterThan(1, $permission->roles()->count());
    }

    /**
     * Test 4: Duplicate user-role assignment is prevented by database unique constraint.
     */
    public function test_duplicate_user_role_assignment_is_prevented(): void
    {
        $user = User::factory()->create();
        $role = Role::where('name', 'NOC_OPERATOR')->firstOrFail();

        // First assignment succeeds
        $user->roles()->attach($role->id);

        // Direct second attachment attempt triggers database unique constraint violation
        $this->expectException(QueryException::class);
        $user->roles()->attach($role->id);
    }

    /**
     * Test 5: Duplicate role-permission assignment is prevented by database unique constraint.
     */
    public function test_duplicate_role_permission_assignment_is_prevented(): void
    {
        $role = Role::create([
            'name' => 'CUSTOM_TEST_ROLE',
            'display_name' => 'Custom Role',
        ]);
        $permission = Permission::where('name', 'dashboard.view')->firstOrFail();

        // First attachment
        $role->permissions()->attach($permission->id);

        // Direct duplicate attachment triggers database unique constraint violation
        $this->expectException(QueryException::class);
        $role->permissions()->attach($permission->id);
    }

    /**
     * Test 6: User can be checked for permission.
     */
    public function test_user_can_be_checked_for_permission(): void
    {
        $user = User::factory()->create();
        $user->assignRole('NOC_OPERATOR');

        $this->assertTrue($user->hasPermission('dashboard.view'));
    }

    /**
     * Test 7: User without permission is denied by Gate.
     */
    public function test_user_without_permission_is_denied(): void
    {
        $user = User::factory()->create();
        $user->assignRole('NOC_OPERATOR');

        // NOC Operator does not have settings.update
        $this->assertFalse($user->can('settings.update'));
    }

    /**
     * Test 8: User with permission is authorized by Gate.
     */
    public function test_user_with_permission_is_authorized(): void
    {
        $user = User::factory()->create();
        $user->assignRole('OPERATIONS_MANAGER');

        // Operations manager has audit_logs.view
        $this->assertTrue($user->can('audit_logs.view'));
    }

    /**
     * Test 9: Super Admin authorization bypass works for application abilities.
     */
    public function test_super_admin_has_unrestricted_permission_access(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('SUPER_ADMIN');

        $this->assertTrue($superAdmin->can('dashboard.view'));
        $this->assertTrue($superAdmin->can('users.create'));
        $this->assertTrue($superAdmin->can('settings.update'));
        $this->assertTrue($superAdmin->can('nonexistent.permission.future.feature'));
    }

    /**
     * Test 10: Inactive user cannot bypass authorization even if holding Super Admin role.
     */
    public function test_inactive_user_cannot_bypass_authorization(): void
    {
        $suspendedAdmin = User::factory()->create([
            'is_active' => false,
        ]);
        $suspendedAdmin->assignRole('SUPER_ADMIN');

        $this->assertFalse($suspendedAdmin->isActive());
        $this->assertFalse($suspendedAdmin->can('dashboard.view'));
        $this->assertFalse($suspendedAdmin->can('settings.update'));
    }

    /**
     * Test 11: Frontend Inertia auth state receives only safe metadata.
     */
    public function test_frontend_permission_state_contains_only_safe_values(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('Secret12345!'),
        ]);
        $user->assignRole('NOC_MANAGER');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);

        // Check Inertia shared props
        $pageProps = $response->viewData('page')['props'];
        $auth = $pageProps['auth'];

        $this->assertArrayHasKey('user', $auth);
        $this->assertArrayHasKey('roles', $auth);
        $this->assertArrayHasKey('permissions', $auth);

        // Ensure sensitive fields are absent
        $this->assertArrayNotHasKey('password', $auth['user']);
        $this->assertArrayNotHasKey('remember_token', $auth['user']);

        // Check roles and permissions format
        $this->assertContains('NOC_MANAGER', $auth['roles']);
        $this->assertContains('dashboard.view', $auth['permissions']);
    }

    /**
     * Test 12: Unauthorized server request returns HTTP 403 Forbidden.
     */
    public function test_unauthorized_server_request_returns_http_403(): void
    {
        $operator = User::factory()->create();
        $operator->assignRole('NOC_OPERATOR');

        // Operator does not have roles.view permission
        $response = $this->actingAs($operator)->get('/admin/roles');

        $response->assertStatus(403);
    }

    /**
     * Test 13: Authentication still works seamlessly with RBAC integrated.
     */
    public function test_authentication_still_works_after_rbac_integration(): void
    {
        $user = User::factory()->create([
            'email' => 'operator@valstracking.com',
            'password' => Hash::make('SecurePassword123!'),
        ]);
        $user->assignRole('NOC_OPERATOR');

        $response = $this->post('/login', [
            'email' => 'operator@valstracking.com',
            'password' => 'SecurePassword123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/dashboard');
    }

    /**
     * Test 14: Existing authenticated dashboard remains accessible according to authorization rules.
     */
    public function test_authorized_user_can_access_dashboard(): void
    {
        $user = User::factory()->create();
        $user->assignRole('NOC_OPERATOR');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }
}
