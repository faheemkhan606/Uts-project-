<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_system',
        'is_active',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Users assigned to this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * Permissions granted to this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class)->withTimestamps();
    }

    /**
     * Check if this role has a specific permission.
     */
    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions->contains('name', $permissionName);
    }

    /**
     * Give permission(s) to this role.
     */
    public function givePermissionTo(Permission|string ...$permissions): static
    {
        foreach ($permissions as $permission) {
            $model = is_string($permission)
                ? Permission::firstOrCreate([
                    'name' => $permission,
                ], [
                    'display_name' => ucwords(str_replace(['.', '_'], ' ', $permission)),
                    'module' => explode('.', $permission)[0] ?? 'general',
                    'action' => explode('.', $permission)[1] ?? 'action',
                ])
                : $permission;

            if (!$this->permissions()->where('permissions.id', $model->id)->exists()) {
                $this->permissions()->attach($model->id);
            }
        }

        $this->unsetRelation('permissions');
        return $this;
    }

    /**
     * Revoke permission from this role.
     */
    public function revokePermissionTo(Permission|string $permission): static
    {
        $id = is_string($permission)
            ? Permission::where('name', $permission)->value('id')
            : $permission->id;

        if ($id) {
            $this->permissions()->detach($id);
            $this->unsetRelation('permissions');
        }

        return $this;
    }
}
