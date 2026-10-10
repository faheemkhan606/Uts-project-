<?php

namespace App\Services\Settings;

use App\Models\SystemSetting;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use Illuminate\Support\Facades\Cache;

class SystemSettingsService
{
    protected const CACHE_PREFIX = 'vals_system_setting:';
    protected const CACHE_PUBLIC_KEY = 'vals_system_settings:public';
    protected const CACHE_TTL_SECONDS = 86400; // 24 hours

    /**
     * Strict allowlist of public settings permitted to be exposed via API or client share.
     * Prevents any accidental leakage of private, infrastructure, or encrypted credentials.
     */
    public const SAFE_PUBLIC_KEYS = [
        'general.app_name',
        'general.company_trade_name',
        'general.support_email',
        'general.emergency_noc_hotline',
        'general.maintenance_mode',
        'localization.default_country',
        'localization.default_currency',
        'localization.currency_symbol',
        'localization.default_timezone',
        'localization.date_format',
        'localization.time_format',
        'notifications.enable_in_app_alerts',
    ];

    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Retrieve a setting value by key and scope with optional fallback.
     */
    public function get(string $key, mixed $default = null, string $scopeType = 'global', int $scopeId = 0): mixed
    {
        $cacheKey = self::CACHE_PREFIX . "{$scopeType}:{$scopeId}:{$key}";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($key, $default, $scopeType, $scopeId) {
            $setting = SystemSetting::where('scope_type', $scopeType)
                ->where('scope_id', $scopeId)
                ->where('key', $key)
                ->first();

            if (! $setting) {
                return $default;
            }

            return $setting->typed_value;
        });
    }

    /**
     * Resolve hierarchical setting: User -> Branch -> Company -> Global -> Default.
     */
    public function resolve(
        string $key,
        mixed $default = null,
        ?User $user = null,
        ?int $branchId = null,
        ?int $companyId = null
    ): mixed {
        // 1. User specific preference
        if ($user) {
            $userVal = $this->get($key, null, 'user', $user->id);
            if ($userVal !== null) {
                return $userVal;
            }
        }

        // 2. Branch specific override
        $effectiveBranchId = $branchId ?? $user?->branch_id;
        if ($effectiveBranchId) {
            $branchVal = $this->get($key, null, 'branch', $effectiveBranchId);
            if ($branchVal !== null) {
                return $branchVal;
            }
        }

        // 3. Company specific override
        $effectiveCompanyId = $companyId ?? $user?->company_id;
        if ($effectiveCompanyId) {
            $companyVal = $this->get($key, null, 'company', $effectiveCompanyId);
            if ($companyVal !== null) {
                return $companyVal;
            }
        }

        // 4. Global standard setting
        return $this->get($key, $default, 'global', 0);
    }

    /**
     * Strongly typed getter: String.
     */
    public function getString(string $key, string $default = '', string $scopeType = 'global', int $scopeId = 0): string
    {
        $val = $this->get($key, $default, $scopeType, $scopeId);
        return is_string($val) ? $val : (string) $val;
    }

    /**
     * Strongly typed getter: Integer.
     */
    public function getInt(string $key, int $default = 0, string $scopeType = 'global', int $scopeId = 0): int
    {
        $val = $this->get($key, $default, $scopeType, $scopeId);
        return is_numeric($val) ? (int) $val : $default;
    }

    /**
     * Strongly typed getter: Float.
     */
    public function getFloat(string $key, float $default = 0.0, string $scopeType = 'global', int $scopeId = 0): float
    {
        $val = $this->get($key, $default, $scopeType, $scopeId);
        return is_numeric($val) ? (float) $val : $default;
    }

    /**
     * Strongly typed getter: Boolean.
     */
    public function getBool(string $key, bool $default = false, string $scopeType = 'global', int $scopeId = 0): bool
    {
        $val = $this->get($key, $default, $scopeType, $scopeId);
        if ($val === null) {
            return $default;
        }
        return filter_var($val, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Strongly typed getter: JSON / Array.
     */
    public function getJson(string $key, array $default = [], string $scopeType = 'global', int $scopeId = 0): array
    {
        $val = $this->get($key, $default, $scopeType, $scopeId);
        return is_array($val) ? $val : $default;
    }

    /**
     * Determine if a setting exists in the database.
     */
    public function has(string $key, string $scopeType = 'global', int $scopeId = 0): bool
    {
        return SystemSetting::where('scope_type', $scopeType)
            ->where('scope_id', $scopeId)
            ->where('key', $key)
            ->exists();
    }

    /**
     * Set or update a single system setting value for a given scope.
     */
    public function set(
        string $key,
        mixed $value,
        ?string $type = null,
        ?string $group = null,
        ?string $description = null,
        ?bool $isPublic = null,
        ?bool $isEncrypted = null,
        ?string $actorName = null,
        ?string $actorRole = null,
        string $scopeType = 'global',
        int $scopeId = 0
    ): SystemSetting {
        $existing = SystemSetting::where('scope_type', $scopeType)
            ->where('scope_id', $scopeId)
            ->where('key', $key)
            ->first();

        $resolvedType = $type ?? $existing?->type ?? 'string';
        $resolvedEncrypted = $isEncrypted ?? $existing?->is_encrypted ?? false;
        $resolvedGroup = $group ?? $existing?->group ?? explode('.', $key)[0];
        $formattedValue = SystemSetting::formatValueForStorage($value, $resolvedType, $resolvedEncrypted);

        $oldValue = $existing ? ($existing->is_encrypted ? '[ENCRYPTED]' : $existing->value) : null;

        $setting = SystemSetting::updateOrCreate(
            [
                'scope_type' => $scopeType,
                'scope_id' => $scopeId,
                'key' => $key,
            ],
            array_filter([
                'group' => $resolvedGroup,
                'value' => $formattedValue,
                'type' => $resolvedType,
                'description' => $description ?? $existing?->description,
                'is_public' => $isPublic ?? $existing?->is_public ?? false,
                'is_encrypted' => $resolvedEncrypted,
            ], fn ($v) => $v !== null)
        );

        // Invalidate caches
        $this->forgetCache($key, $scopeType, $scopeId);

        // Audit log if actor provided or value changed
        if ($actorName || $oldValue !== ($resolvedEncrypted ? '[ENCRYPTED]' : $formattedValue)) {
            $this->auditLogService->log(
                actorName: $actorName ?? 'SYSTEM',
                actorRole: $actorRole ?? 'SYSTEM',
                action: 'SETTING_UPDATED',
                entityType: 'SystemSetting',
                entityId: (string) $setting->id,
                details: json_encode([
                    'scope' => "{$scopeType}:{$scopeId}",
                    'key' => $key,
                    'group' => $setting->group,
                    'old_value' => $oldValue,
                    'new_value' => $resolvedEncrypted ? '[ENCRYPTED]' : $formattedValue,
                ], JSON_UNESCAPED_SLASHES)
            );
        }

        return $setting;
    }

    /**
     * Batch update multiple settings with validation and single cache purge.
     */
    public function updateMany(
        array $settingsKeyValuePairs,
        ?string $actorName = null,
        ?string $actorRole = null,
        ?string $ipAddress = null,
        string $scopeType = 'global',
        int $scopeId = 0
    ): array {
        $updated = [];

        foreach ($settingsKeyValuePairs as $key => $value) {
            $existing = SystemSetting::where('scope_type', $scopeType)
                ->where('scope_id', $scopeId)
                ->where('key', $key)
                ->first();

            if (! $existing) {
                // If it exists in global, we can create an override or update
                $existing = SystemSetting::where('key', $key)->first();
                if (! $existing) {
                    continue;
                }
            }

            $oldRaw = $existing->is_encrypted ? '[ENCRYPTED]' : $existing->value;
            $newRaw = SystemSetting::formatValueForStorage($value, $existing->type, $existing->is_encrypted);

            $existing->value = $newRaw;
            $existing->save();

            $this->forgetCache($key, $existing->scope_type, $existing->scope_id);

            $this->auditLogService->log(
                actorName: $actorName ?? 'SUPER_ADMIN',
                actorRole: $actorRole ?? 'SUPER_ADMIN',
                action: 'SETTING_BATCH_UPDATED',
                entityType: 'SystemSetting',
                entityId: (string) $existing->id,
                details: json_encode([
                    'scope' => "{$existing->scope_type}:{$existing->scope_id}",
                    'key' => $key,
                    'group' => $existing->group,
                    'old_value' => $oldRaw,
                    'new_value' => $existing->is_encrypted ? '[ENCRYPTED]' : $newRaw,
                ], JSON_UNESCAPED_SLASHES),
                ipAddress: $ipAddress
            );

            $updated[$key] = $existing->typed_value;
        }

        Cache::forget(self::CACHE_PUBLIC_KEY);

        return $updated;
    }

    /**
     * Retrieve all settings, optionally filtered by group.
     */
    public function all(?string $group = null, string $scopeType = 'global', int $scopeId = 0): array
    {
        $query = SystemSetting::where('scope_type', $scopeType)
            ->where('scope_id', $scopeId);

        if ($group) {
            $query->where('group', $group);
        }

        return $query->get()->mapWithKeys(function (SystemSetting $setting) {
            return [$setting->key => [
                'id' => $setting->id,
                'scope_type' => $setting->scope_type,
                'scope_id' => $setting->scope_id,
                'group' => $setting->group,
                'key' => $setting->key,
                'value' => $setting->is_encrypted ? '********' : $setting->typed_value,
                'type' => $setting->type,
                'description' => $setting->description,
                'is_public' => $setting->is_public,
                'is_system' => $setting->is_system,
                'is_encrypted' => $setting->is_encrypted,
            ]];
        })->all();
    }

    /**
     * Retrieve a flat dictionary of only safe, public settings for frontend consumption.
     * Strictly restricted to explicit SAFE_PUBLIC_KEYS to guarantee zero leakage of secrets.
     */
    public function getPublicSettings(): array
    {
        return Cache::remember(self::CACHE_PUBLIC_KEY, self::CACHE_TTL_SECONDS, function () {
            return SystemSetting::where('scope_type', 'global')
                ->where('scope_id', 0)
                ->where('is_public', true)
                ->where('is_encrypted', false)
                ->whereIn('key', self::SAFE_PUBLIC_KEYS)
                ->get()
                ->mapWithKeys(function (SystemSetting $setting) {
                    return [$setting->key => $setting->typed_value];
                })
                ->all();
        });
    }

    /**
     * Invalidate caches for a given key and scope.
     */
    public function forgetCache(string $key, string $scopeType = 'global', int $scopeId = 0): void
    {
        Cache::forget(self::CACHE_PREFIX . "{$scopeType}:{$scopeId}:{$key}");
        Cache::forget(self::CACHE_PREFIX . $key);
        Cache::forget(self::CACHE_PUBLIC_KEY);
    }
}
