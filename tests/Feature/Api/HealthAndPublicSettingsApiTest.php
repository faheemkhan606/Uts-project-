<?php

namespace Tests\Feature\Api;

use App\Models\SystemSetting;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HealthAndPublicSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    /**
     * Test health check endpoint is operational and leaks no sensitive environment variables.
     */
    public function test_health_check_endpoint_is_operational_and_safe(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'application',
            'version',
            'environment',
            'database_status',
            'timezone',
            'timestamp',
        ]);

        $data = $response->json();
        $this->assertEquals('operational', $data['status']);

        // Explicitly assert zero leakage of credentials, passwords, or paths
        $jsonString = $response->getContent();
        $this->assertStringNotContainsString('password', strtolower($jsonString));
        $this->assertStringNotContainsString('secret', strtolower($jsonString));
        $this->assertStringNotContainsString('key', strtolower($jsonString));
        $this->assertStringNotContainsString('/var/www', $jsonString);
    }

    /**
     * Test public settings endpoint is accessible to unauthenticated guests and strictly safe.
     */
    public function test_public_settings_endpoint_accessible_unauthenticated(): void
    {
        $response = $this->getJson('/api/settings/public');

        $response->assertStatus(200);
        $data = $response->json('settings');

        // Verify standard public configuration is present
        $this->assertArrayHasKey('general.app_name', $data);
        $this->assertArrayHasKey('localization.default_country', $data);
        $this->assertArrayHasKey('localization.default_currency', $data);

        // Verify sensitive parameters are not exposed
        $this->assertArrayNotHasKey('security.session_lifetime_minutes', $data);
        $this->assertArrayNotHasKey('security.api_webhook_secret', $data);
        $this->assertArrayNotHasKey('telematics.high_speed_threshold_kph', $data);
    }
}
