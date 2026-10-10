<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;

class SystemSetting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'scope_type',
        'scope_id',
        'group',
        'key',
        'value',
        'type',
        'description',
        'is_public',
        'is_system',
        'is_encrypted',
    ];

    protected $casts = [
        'scope_id' => 'integer',
        'is_public' => 'boolean',
        'is_system' => 'boolean',
        'is_encrypted' => 'boolean',
    ];

    /**
     * Get the cast and decrypted typed value of the setting.
     */
    public function getTypedValueAttribute(): mixed
    {
        return self::castValueToType($this->value, $this->type, $this->is_encrypted);
    }

    /**
     * Format a value for database storage given its type and encryption setting.
     */
    public static function formatValueForStorage(mixed $value, string $type, bool $isEncrypted = false): ?string
    {
        if ($value === null) {
            return null;
        }

        $serialized = match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false',
            'json' => is_string($value) ? $value : json_encode($value),
            'integer', 'float' => (string) $value,
            default => (string) $value,
        };

        if ($isEncrypted) {
            return Crypt::encryptString($serialized);
        }

        return $serialized;
    }

    /**
     * Cast raw database storage string into appropriate PHP type.
     */
    public static function castValueToType(?string $raw, string $type, bool $isEncrypted = false): mixed
    {
        if ($raw === null) {
            return null;
        }

        $unencrypted = $raw;
        if ($isEncrypted) {
            try {
                $unencrypted = Crypt::decryptString($raw);
            } catch (\Exception $e) {
                Log::warning("Failed to decrypt setting: {$e->getMessage()}");
                return null;
            }
        }

        return match ($type) {
            'boolean' => filter_var($unencrypted, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $unencrypted,
            'float' => (float) $unencrypted,
            'json' => json_decode($unencrypted, true) ?? [],
            'encrypted' => $unencrypted,
            default => $unencrypted,
        };
    }

    /**
     * Scope for a specific setting group.
     */
    public function scopeGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }

    /**
     * Scope for global configuration entries.
     */
    public function scopeGlobal(Builder $query): Builder
    {
        return $query->where('scope_type', 'global')->where('scope_id', 0);
    }

    /**
     * Scope for a specific organizational or user scope.
     */
    public function scopeForScope(Builder $query, string $scopeType, int $scopeId = 0): Builder
    {
        return $query->where('scope_type', $scopeType)->where('scope_id', $scopeId);
    }

    /**
     * Scope for company-specific overrides.
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('scope_type', 'company')->where('scope_id', $companyId);
    }

    /**
     * Scope for branch-specific overrides.
     */
    public function scopeForBranch(Builder $query, int $branchId): Builder
    {
        return $query->where('scope_type', 'branch')->where('scope_id', $branchId);
    }

    /**
     * Scope for user-specific preferences.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('scope_type', 'user')->where('scope_id', $userId);
    }

    /**
     * Scope for publicly exposable settings.
     */
    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for system protected settings.
     */
    public function scopeSystem(Builder $query): Builder
    {
        return $query->where('is_system', true);
    }

    /**
     * Check if setting is publicly visible.
     */
    public function isPublic(): bool
    {
        return (bool) $this->is_public;
    }

    /**
     * Check if setting is core system protected.
     */
    public function isSystem(): bool
    {
        return (bool) $this->is_system;
    }

    /**
     * Check if setting value is encrypted at rest.
     */
    public function isEncrypted(): bool
    {
        return (bool) $this->is_encrypted;
    }
}
