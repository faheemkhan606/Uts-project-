<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'company_id',
        'branch_id',
        'department_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'company_id' => 'integer',
            'branch_id' => 'integer',
            'department_id' => 'integer',
        ];
    }

    /**
     * Roles assigned to this user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Company this user belongs to.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Branch this user belongs to.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Department this user belongs to.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Assign one or more roles to this user.
     */
    public function assignRole(Role|string ...$roles): static
    {
        foreach ($roles as $role) {
            $roleModel = is_string($role)
                ? Role::firstOrCreate(['name' => $role], [
                    'display_name' => ucwords(str_replace('_', ' ', $role)),
                    'is_system' => true,
                    'is_active' => true,
                ])
                : $role;

            if (!$this->roles()->where('roles.id', $roleModel->id)->exists()) {
                $this->roles()->attach($roleModel->id);
            }
        }

        $this->unsetRelation('roles');
        return $this;
    }

    /**
     * Remove a role from this user.
     */
    public function removeRole(Role|string $role): static
    {
        $id = is_string($role)
            ? Role::where('name', $role)->value('id')
            : $role->id;

        if ($id) {
            $this->roles()->detach($id);
            $this->unsetRelation('roles');
        }

        return $this;
    }

    /**
     * Determine if the user has a given role.
     */
    public function hasRole(string|array $role): bool
    {
        if (is_array($role)) {
            return $this->roles->whereIn('name', $role)->isNotEmpty();
        }

        return $this->roles->contains('name', $role);
    }

    /**
     * Determine if user is super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('SUPER_ADMIN');
    }

    /**
     * Check if account is active.
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }

    /**
     * Get all unique permissions granted to this user across all their active roles.
     */
    public function getAllPermissions(): \Illuminate\Support\Collection
    {
        return $this->roles()
            ->where('roles.is_active', true)
            ->with('permissions')
            ->get()
            ->flatMap(fn (Role $r) => $r->permissions)
            ->unique('name');
    }

    /**
     * Check if user has a specific permission via assigned roles.
     */
    public function hasPermission(string $permission): bool
    {
        // Inactive users have zero permissions
        if (!$this->isActive()) {
            return false;
        }

        // Active Super Admin has all application permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        return $this->getAllPermissions()->contains('name', $permission);
    }

    /**
     * Assign user to organization entities with integrity protection.
     */
    public function assignOrganization(?int $companyId, ?int $branchId = null, ?int $departmentId = null): static
    {
        $this->update([
            'company_id' => $companyId,
            'branch_id' => $branchId,
            'department_id' => $departmentId,
        ]);

        return $this;
    }

    /**
     * Check if user has any organization assignment.
     */
    public function hasOrganization(): bool
    {
        return !is_null($this->company_id);
    }

    /**
     * Calculate user's effective organizational authorization scope.
     *
     * @return 'global'|'company'|'branch'|'department'
     */
    public function getOrganizationScope(): string
    {
        if ($this->isSuperAdmin() || is_null($this->company_id)) {
            return 'global';
        }

        if (!is_null($this->department_id)) {
            return 'department';
        }

        if (!is_null($this->branch_id)) {
            return 'branch';
        }

        return 'company';
    }
}
