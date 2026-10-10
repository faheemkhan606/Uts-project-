<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'code',
        'name',
        'head_of_department',
        'employee_count',
        'is_active',
    ];

    protected $casts = [
        'employee_count' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Parent company.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Optional branch for branch-specific departments (null if company-wide).
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Staff assigned to this department.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Scope to active departments.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to company-wide departments (no specific branch).
     */
    public function scopeCompanyWide(Builder $query): Builder
    {
        return $query->whereNull('branch_id');
    }

    /**
     * Scope to departments for a specific company.
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope to departments for a specific branch.
     */
    public function scopeForBranch(Builder $query, int $branchId): Builder
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Check if department is company-wide.
     */
    public function isCompanyWide(): bool
    {
        return is_null($this->branch_id);
    }
}
