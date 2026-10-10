<?php

namespace App\Models;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     * Protected fields (customer_no, company_id, branch_id, created_by, updated_by)
     * are strictly controlled server-side to prevent privilege escalation and IDOR.
     *
     * @var list<string>
     */
    protected $fillable = [
        'legal_name',
        'trade_name',
        'display_name',
        'customer_type',
        'status',
        'phone',
        'email',
        'cnic',
        'ntn',
        'strn',
        'website',
        'credit_limit',
        'payment_terms',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'customer_type' => CustomerType::class,
            'status' => CustomerStatus::class,
            'credit_limit' => 'decimal:2',
            'company_id' => 'integer',
            'branch_id' => 'integer',
            'created_by' => 'integer',
            'updated_by' => 'integer',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Parent enterprise company owning this customer account.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Primary operational branch servicing this customer account.
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * System user who originally registered this customer.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * System user who last updated this customer profile.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope query to a specific enterprise company.
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Scope query to a specific servicing branch.
     */
    public function scopeForBranch(Builder $query, int $branchId): Builder
    {
        return $query->where('branch_id', $branchId);
    }

    /**
     * Scope query to active accounts only.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', CustomerStatus::Active->value);
    }

    /**
     * Deterministic display name accessor.
     * Fallback to trade name if available, otherwise legal name.
     */
    public function getResolvedDisplayName(): string
    {
        return !empty($this->display_name)
            ? $this->display_name
            : (!empty($this->trade_name) ? $this->trade_name : $this->legal_name);
    }

    /**
     * Masked CNIC for secure logging and display.
     */
    public function getMaskedCnic(): ?string
    {
        if (empty($this->cnic)) {
            return null;
        }

        $clean = preg_replace('/[^0-9]/', '', $this->cnic);
        if (strlen($clean) === 13) {
            return substr($clean, 0, 5) . '-XXXXXXX-' . substr($clean, -1);
        }

        return 'XXXXXXXXXXXXX';
    }
}
