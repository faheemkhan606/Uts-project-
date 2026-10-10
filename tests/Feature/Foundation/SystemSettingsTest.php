<?php

namespace Tests\Feature\Foundation;

use App\Models\AuditLog;
use App\Models\Role;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Settings\SystemSettingsService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SystemSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected SystemSettingsService $settingsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->settingsService = app(SystemSettingsService::class);
    }

    /**
     * Test 1: System settings are properly populated by seeder.
     */
    public function test_system_settings_seeded_successfully(): void
    {
        $this->assertDatabaseHas('system_settings', [
            'key' => 'general.app_name',
            'type' => 'string',
            'is_public' => true,
        ]);

        $this->assertDatabaseHas('system_settings', [
            'key' => 'security.session_lifetime_minutes',
            'type' => 'integer',
            'is_public' => false,
        ]);

        $this->assertDatabaseHas('system_settings', [
            'key' => 'security.api_webhook_secret',
            'type' => 'encrypted',
            'is_encrypted' => true,
        ]);
    }

    /**
     * Test 2: Typed getters return expected native PHP primitives.
     */
    public function test_typed_getters_return_correct_types(): void
    {
        $appName = $this->settingsService->getString('general.app_name');
        $this->assertIsString($appName);
        $this->assertEquals('VALS Tracking Enterprise', $appName);

        $sessionTimeout = $this->settingsService->getInt('security.session_lifetime_minutes');
        $this->assertIsInt($sessionTimeout);
        $this->assertEquals(120, $sessionTimeout);

        $maintenanceMode = $this->settingsService->getBool('general.maintenance_mode');
        $this->assertIsBool($maintenanceMode);
        $this->assertFalse($maintenanceMode);

        $smsAlerts = $this->settingsService->getBool('notifications.enable_sms_alerts');
        $this->assertIsBool($smsAlerts);
        $this->assertTrue($smsAlerts);
    }

    /**
     * Test 3: Encrypted values are encrypted at rest and never stored in plaintext.
     */
    public function test_encrypted_setting_stored_encrypted_at_rest(): void
    {
        $rawRow = DB::table('system_settings')->where('key', 'security.api_webhook_secret')->first();
        $this->assertNotNull($rawRow);

        // The raw string in DB must NOT match plaintext
        $plaintext = 'vals_sec_live_default_secret_token_2025';
        $this->assertNotEquals($plaintext, $rawRow->value);

        // Decryption using Crypt facade must succeed
        $decrypted = Crypt::decryptString($rawRow->value);
        $this->assertEquals($plaintext, $decrypted);

        // Service returns decrypted string
        $this->assertEquals($plaintext, $this->settingsService->get('security.api_webhook_secret'));
    }

    /**
     * Test 4: Cache stores retrieved setting and invalidates on update.
     */
    public function test_cache_invalidation_on_setting_mutation(): void
    {
        Cache::flush();

        // 1. Initial retrieval puts into cache
        $initial = $this->settingsService->getInt('telematics.high_speed_threshold_kph');
        $this->assertEquals(90, $initial);

        $cacheKey = 'vals_system_setting:telematics.high_speed_threshold_kph';
        $this->assertTrue(Cache::has($cacheKey));

        // 2. Mutate setting
        $this->settingsService->set(
            key: 'telematics.high_speed_threshold_kph',
            value: 105,
            actorName: 'NOC Manager',
            actorRole: 'NOC_MANAGER'
        );

        // 3. Cache was invalidated and new value returned
        $updated = $this->settingsService->getInt('telematics.high_speed_threshold_kph');
        $this->assertEquals(105, $updated);
    }

    /**
     * Test 5: Fallback default returned when key does not exist.
     */
    public function test_fallback_value_when_key_does_not_exist(): void
    {
        $missingString = $this->settingsService->getString('nonexistent.setting', 'DEFAULT_VAL');
        $this->assertEquals('DEFAULT_VAL', $missingString);

        $missingInt = $this->settingsService->getInt('nonexistent.count', 999);
        $this->assertEquals(999, $missingInt);

        $missingBool = $this->settingsService->getBool('nonexistent.flag', true);
        $this->assertTrue($missingBool);
    }

    /**
     * Test 6: Unauthenticated user cannot access system settings.
     */
    public function test_unauthenticated_user_cannot_access_settings(): void
    {
        $response = $this->get('/admin/settings');
        $response->assertRedirect('/login');
    }

    /**
     * Test 7: Unauthorized user without settings.view receives 403 Forbidden.
     */
    public function test_unauthorized_user_without_settings_view_cannot_access(): void
    {
        $user = User::factory()->create(['is_active' => true]);
        $customerRole = Role::where('name', 'CUSTOMER_USER')->firstOrFail();
        $user->roles()->attach($customerRole);

        $response = $this->actingAs($user)->get('/admin/settings');
        $response->assertStatus(403);
    }

    /**
     * Test 8: Super Admin can view settings.
     */
    public function test_authorized_user_can_view_settings(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $superAdminRole = Role::where('name', 'SUPER_ADMIN')->firstOrFail();
        $admin->roles()->attach($superAdminRole);

        $response = $this->actingAs($admin)->get('/admin/settings');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Settings/Index')
            ->has('settingsGrouped')
            ->where('canUpdate', true)
        );
    }

    /**
     * Test 9: Authorized user can update settings and audit log is created.
     */
    public function test_authorized_user_can_update_settings_and_audit_log_created(): void
    {
        $admin = User::factory()->create(['is_active' => true, 'name' => 'System Auditor']);
        $superAdminRole = Role::where('name', 'SUPER_ADMIN')->firstOrFail();
        $admin->roles()->attach($superAdminRole);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'settings' => [
                'security.session_lifetime_minutes' => 60,
                'telematics.high_speed_threshold_kph' => 100,
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(60, $this->settingsService->getInt('security.session_lifetime_minutes'));
        $this->assertEquals(100, $this->settingsService->getInt('telematics.high_speed_threshold_kph'));

        // Verify audit log entry
        $this->assertDatabaseHas('audit_logs', [
            'actor_name' => 'System Auditor',
            'action' => 'SETTING_BATCH_UPDATED',
            'entity_type' => 'SystemSetting',
        ]);
    }

    /**
     * Test 10: Validation rejects out-of-bounds parameter values.
     */
    public function test_update_validation_rejects_out_of_bounds_values(): void
    {
        $admin = User::factory()->create(['is_active' => true]);
        $superAdminRole = Role::where('name', 'SUPER_ADMIN')->firstOrFail();
        $admin->roles()->attach($superAdminRole);

        // Session lifetime below minimum of 5 minutes
        $response = $this->actingAs($admin)->postJson('/admin/settings', [
            'settings' => [
                'security.session_lifetime_minutes' => 2,
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['settings.security.session_lifetime_minutes']);
    }

    /**
     * Test 11: Public settings endpoint only exposes public non-encrypted values.
     */
    public function test_public_settings_endpoint_omits_sensitive_and_encrypted_settings(): void
    {
        $response = $this->getJson('/api/settings/public');
        $response->assertStatus(200);

        $data = $response->json('settings');

        // Must contain public settings
        $this->assertArrayHasKey('general.app_name', $data);
        $this->assertArrayHasKey('localization.default_currency', $data);

        // Must NOT contain sensitive security settings
        $this->assertArrayNotHasKey('security.session_lifetime_minutes', $data);
        $this->assertArrayNotHasKey('security.api_webhook_secret', $data);
        $this->assertArrayNotHasKey('telematics.high_speed_threshold_kph', $data);
    }

    /**
     * Test 12: Hierarchical settings resolution honors company override and falls back to global.
     */
    public function test_hierarchical_settings_resolution(): void
    {
        // Global setting is Asia/Karachi
        $this->assertEquals('Asia/Karachi', $this->settingsService->get('localization.default_timezone'));

        // Create company-specific override for company #2 to Europe/London
        $this->settingsService->set(
            key: 'localization.default_timezone',
            value: 'Europe/London',
            type: 'string',
            scopeType: 'company',
            scopeId: 2
        );

        // Resolution without company returns global
        $resolvedGlobal = $this->settingsService->resolve('localization.default_timezone', 'UTC');
        $this->assertEquals('Asia/Karachi', $resolvedGlobal);

        // Resolution for Company 2 returns overridden value
        $resolvedCompany = $this->settingsService->resolve('localization.default_timezone', 'UTC', null, null, 2);
        $this->assertEquals('Europe/London', $resolvedCompany);

        // Resolution for Company 3 (no override) falls back to global
        $resolvedCompany3 = $this->settingsService->resolve('localization.default_timezone', 'UTC', null, null, 3);
        $this->assertEquals('Asia/Karachi', $resolvedCompany3);
    }

    /**
     * Test 13: Non-allowlisted public settings are not leaked by public API.
     */
    public function test_public_settings_strictly_restricted_to_safe_allowlist(): void
    {
        // Create an arbitrary setting flagged is_public = true that is not in SAFE_PUBLIC_KEYS
        $this->settingsService->set(
            key: 'custom_internal.telemetry_flag',
            value: 'internal_secret_val',
            type: 'string',
            isPublic: true,
            scopeType: 'global',
            scopeId: 0
        );

        $response = $this->getJson('/api/settings/public');
        $response->assertStatus(200);

        $data = $response->json('settings');
        $this->assertArrayNotHasKey('custom_internal.telemetry_flag', $data);
    }
}
