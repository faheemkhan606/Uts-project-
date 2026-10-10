<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    /**
     * Test that production health check returns valid JSON status.
     */
    public function test_health_check_returns_operational_status(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'application',
                'version',
                'environment',
                'database_status',
                'timezone',
                'timestamp',
            ])
            ->assertJson([
                'status' => 'operational',
                'application' => 'VALS Tracking Enterprise',
                'timezone' => 'Asia/Karachi',
            ]);

        // Verify no credentials or private secrets are leaked
        $content = $response->getContent();
        $this->assertStringNotContainsString('password', strtolower($content));
        $this->assertStringNotContainsString('db_password', strtolower($content));
        $this->assertStringNotContainsString('app_key', strtolower($content));
    }
}
