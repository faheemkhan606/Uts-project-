<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Populates production baseline system settings for VALS Tracking Enterprise.
     */
    public function run(): void
    {
        $settings = [
            // 1. General Configuration
            [
                'group' => 'general',
                'key' => 'general.app_name',
                'value' => 'VALS Tracking Enterprise',
                'type' => 'string',
                'description' => 'Global enterprise application branding title.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'general',
                'key' => 'general.company_trade_name',
                'value' => 'VALS Tracking (Pvt) Ltd',
                'type' => 'string',
                'description' => 'Operating business trade name.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'general',
                'key' => 'general.support_email',
                'value' => 'support@valstracking.com',
                'type' => 'string',
                'description' => 'Primary customer support inquiry email address.',
                'is_public' => true,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'general',
                'key' => 'general.emergency_noc_hotline',
                'value' => '+92-21-34567890',
                'type' => 'string',
                'description' => '24/7 emergency vehicle recovery and NOC hotline number.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'general',
                'key' => 'general.maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Application maintenance status indicator.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],

            // 2. Localization Configuration
            [
                'group' => 'localization',
                'key' => 'localization.default_country',
                'value' => 'Pakistan',
                'type' => 'string',
                'description' => 'Default country for tax and geographic operations.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'localization',
                'key' => 'localization.default_currency',
                'value' => 'PKR',
                'type' => 'string',
                'description' => 'System currency code for billing and accounting.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'localization',
                'key' => 'localization.currency_symbol',
                'value' => 'Rs.',
                'type' => 'string',
                'description' => 'Currency display prefix symbol.',
                'is_public' => true,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'localization',
                'key' => 'localization.default_timezone',
                'value' => 'Asia/Karachi',
                'type' => 'string',
                'description' => 'Standard timezone for telematics and operational logs.',
                'is_public' => true,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'localization',
                'key' => 'localization.date_format',
                'value' => 'd/m/Y',
                'type' => 'string',
                'description' => 'Display format for system dates.',
                'is_public' => true,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'localization',
                'key' => 'localization.time_format',
                'value' => 'H:i:s',
                'type' => 'string',
                'description' => 'Display format for timestamps.',
                'is_public' => true,
                'is_system' => false,
                'is_encrypted' => false,
            ],

            // 3. Security & Access Control
            [
                'group' => 'security',
                'key' => 'security.session_lifetime_minutes',
                'value' => '120',
                'type' => 'integer',
                'description' => 'Inactivity period in minutes before user session invalidates.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'security',
                'key' => 'security.max_login_attempts',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Maximum consecutive failed logins allowed before rate-limiting lockout.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'security',
                'key' => 'security.lockout_decay_minutes',
                'value' => '1',
                'type' => 'integer',
                'description' => 'Duration in minutes user IP is throttled following failed attempts.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'security',
                'key' => 'security.enforce_strong_passwords',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Require minimum 8 characters with mixed case and numeric symbols.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'security',
                'key' => 'security.allow_concurrent_sessions',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Allow single user credentials across multiple concurrent client devices.',
                'is_public' => false,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'security',
                'key' => 'security.api_webhook_secret',
                'value' => 'vals_sec_live_default_secret_token_2025',
                'type' => 'encrypted',
                'description' => 'Encrypted master HMAC signing secret for telematics ingestion webhooks.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => true,
            ],

            // 4. Telematics & NOC Engine Parameters
            [
                'group' => 'telematics',
                'key' => 'telematics.high_speed_threshold_kph',
                'value' => '90',
                'type' => 'integer',
                'description' => 'Fleet overspeed alert trigger threshold in km/h.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
            [
                'group' => 'telematics',
                'key' => 'telematics.idle_alarm_minutes',
                'value' => '15',
                'type' => 'integer',
                'description' => 'Engine ignition-on stationary period in minutes before triggering idle alarm.',
                'is_public' => false,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'telematics',
                'key' => 'telematics.gps_heartbeat_interval_sec',
                'value' => '30',
                'type' => 'integer',
                'description' => 'Expected packet heartbeat transmission frequency from GPS trackers.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],

            // 5. Notifications
            [
                'group' => 'notifications',
                'key' => 'notifications.enable_sms_alerts',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Transmit SMS alerts for critical SOS and battery cut alarms.',
                'is_public' => false,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'notifications',
                'key' => 'notifications.enable_email_alerts',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Transmit daily activity and geofence breach email digests.',
                'is_public' => false,
                'is_system' => false,
                'is_encrypted' => false,
            ],
            [
                'group' => 'notifications',
                'key' => 'notifications.enable_in_app_alerts',
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Broadcast live UI audio and banner notifications to NOC operators.',
                'is_public' => true,
                'is_system' => false,
                'is_encrypted' => false,
            ],

            // 6. Security Audit & Retention
            [
                'group' => 'audit',
                'key' => 'audit.log_retention_days',
                'value' => '365',
                'type' => 'integer',
                'description' => 'Statutory audit trail retention archive threshold in days.',
                'is_public' => false,
                'is_system' => true,
                'is_encrypted' => false,
            ],
        ];

        foreach ($settings as $setting) {
            $valueToStore = SystemSetting::formatValueForStorage(
                $setting['value'],
                $setting['type'],
                $setting['is_encrypted']
            );

            SystemSetting::updateOrCreate(
                [
                    'scope_type' => 'global',
                    'scope_id' => 0,
                    'key' => $setting['key'],
                ],
                [
                    'group' => $setting['group'],
                    'value' => $valueToStore,
                    'type' => $setting['type'],
                    'description' => $setting['description'],
                    'is_public' => $setting['is_public'],
                    'is_system' => $setting['is_system'],
                    'is_encrypted' => $setting['is_encrypted'],
                ]
            );
        }
    }
}
