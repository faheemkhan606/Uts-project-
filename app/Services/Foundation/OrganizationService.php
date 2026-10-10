<?php

namespace App\Services\Foundation;

use App\Models\Branch;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use Illuminate\Validation\ValidationException;

class OrganizationService
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Validate that a branch belongs strictly to the specified company.
     */
    public function validateBranchBelongsToCompany(int $branchId, int $companyId): bool
    {
        return Branch::where('id', $branchId)
            ->where('company_id', $companyId)
            ->exists();
    }

    /**
     * Validate that a department belongs strictly to the specified company and (if provided) branch.
     */
    public function validateDepartmentBelongsToCompanyAndBranch(int $departmentId, int $companyId, ?int $branchId = null): bool
    {
        $query = Department::where('id', $departmentId)
            ->where('company_id', $companyId);

        if (!is_null($branchId)) {
            $query->where(function ($q) use ($branchId) {
                // Either department is explicitly assigned to this branch, or it is company-wide (branch_id is null)
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id');
            });
        }

        return $query->exists();
    }

    /**
     * Rigorously validate organizational integrity across Company, Branch, and Department.
     * Throws ValidationException if cross-company or conflicting branch relationships exist.
     *
     * @throws ValidationException
     */
    public function validateHierarchy(?int $companyId, ?int $branchId = null, ?int $departmentId = null): void
    {
        // 1. If branch is selected, company must be provided
        if (!is_null($branchId) && is_null($companyId)) {
            throw ValidationException::withMessages([
                'company_id' => ['A company must be selected when specifying a branch.'],
            ]);
        }

        // 2. If branch is selected, it must belong to the specified company
        if (!is_null($branchId) && !is_null($companyId)) {
            $branch = Branch::find($branchId);
            if (!$branch) {
                throw ValidationException::withMessages([
                    'branch_id' => ['The specified branch does not exist.'],
                ]);
            }

            if ($branch->company_id !== (int) $companyId) {
                throw ValidationException::withMessages([
                    'branch_id' => ['The selected branch does not belong to the selected company.'],
                ]);
            }
        }

        // 3. If department is selected, company must be provided
        if (!is_null($departmentId) && is_null($companyId)) {
            throw ValidationException::withMessages([
                'company_id' => ['A company must be selected when specifying a department.'],
            ]);
        }

        // 4. If department is selected, verify company and branch consistency
        if (!is_null($departmentId) && !is_null($companyId)) {
            $department = Department::find($departmentId);
            if (!$department) {
                throw ValidationException::withMessages([
                    'department_id' => ['The specified department does not exist.'],
                ]);
            }

            if ($department->company_id !== (int) $companyId) {
                throw ValidationException::withMessages([
                    'department_id' => ['The selected department does not belong to the selected company.'],
                ]);
            }

            // If department is tied to a specific branch, it cannot be assigned under a different branch
            if (!is_null($department->branch_id) && !is_null($branchId) && $department->branch_id !== (int) $branchId) {
                throw ValidationException::withMessages([
                    'department_id' => ['The selected department is branch-specific and does not match the selected branch.'],
                ]);
            }
        }
    }

    /**
     * Assign a user to an organizational unit with mandatory validation and immutable audit logging.
     *
     * @throws ValidationException
     */
    public function assignUserOrganization(
        User $user,
        ?int $companyId,
        ?int $branchId = null,
        ?int $departmentId = null,
        ?User $actor = null
    ): User {
        // Enforce hierarchy validation
        $this->validateHierarchy($companyId, $branchId, $departmentId);

        $oldCompany = $user->company_id;
        $oldBranch = $user->branch_id;
        $oldDept = $user->department_id;

        $user->assignOrganization($companyId, $branchId, $departmentId);

        // Record audit trail
        $actorName = $actor?->name ?? 'SYSTEM';
        $actorRole = $actor?->roles()->first()?->name ?? 'SUPER_ADMIN';

        $this->auditLogService->log(
            actorName: $actorName,
            actorRole: $actorRole,
            action: 'ORGANIZATION_ASSIGNMENT',
            entityType: 'USER',
            entityId: (string) $user->id,
            details: sprintf(
                'Updated organization for user #%d (%s): Company %s -> %s, Branch %s -> %s, Dept %s -> %s',
                $user->id,
                $user->email,
                $oldCompany ?? 'None',
                $companyId ?? 'None',
                $oldBranch ?? 'None',
                $branchId ?? 'None',
                $oldDept ?? 'None',
                $departmentId ?? 'None'
            )
        );

        return $user->fresh(['company', 'branch', 'department']);
    }
}
