<?php

namespace App\Services\Customer;

use App\Enums\CustomerStatus;
use App\Enums\CustomerType;
use App\Models\Customer;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Foundation\OrganizationService;
use App\Services\Numbering\SequenceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CustomerService
{
    public function __construct(
        protected SequenceService $sequenceService,
        protected OrganizationService $organizationService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Create a new Customer Master account with verified organizational hierarchy and atomic sequence generation.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public function createCustomer(array $data, User $actor): Customer
    {
        $companyId = (int) ($data['company_id'] ?? $actor->company_id);
        $branchId = (int) ($data['branch_id'] ?? $actor->branch_id);

        // 1. Authorize actor's organization scope
        $this->validateActorOrganizationScope($actor, $companyId, $branchId);

        // 2. Validate strict organization integrity (branch must belong to company)
        if (!$this->organizationService->validateBranchBelongsToCompany($branchId, $companyId)) {
            throw ValidationException::withMessages([
                'branch_id' => ['The selected branch does not belong to the specified enterprise company.'],
            ]);
        }

        return DB::transaction(function () use ($data, $companyId, $branchId, $actor) {
            // 3. Atomically allocate next sequential customer number (e.g. CUS-000101)
            $customerNo = $this->sequenceService->getNextSequence('CUS');

            // 4. Resolve deterministic display name
            $legalName = trim($data['legal_name']);
            $tradeName = !empty($data['trade_name']) ? trim($data['trade_name']) : null;
            $displayName = !empty($data['display_name']) ? trim($data['display_name']) : ($tradeName ?: $legalName);

            // 5. Instantiate and persist Customer record
            $customer = new Customer();
            $customer->company_id = $companyId;
            $customer->branch_id = $branchId;
            $customer->customer_no = $customerNo;
            $customer->customer_type = $data['customer_type'] instanceof CustomerType
                ? $data['customer_type']
                : CustomerType::from($data['customer_type'] ?? 'corporate');
            $customer->legal_name = $legalName;
            $customer->trade_name = $tradeName;
            $customer->display_name = $displayName;
            $customer->status = $data['status'] instanceof CustomerStatus
                ? $data['status']
                : CustomerStatus::from($data['status'] ?? 'active');
            $customer->phone = $data['phone'] ?? null;
            $customer->email = $data['email'] ?? null;
            $customer->cnic = $data['cnic'] ?? null;
            $customer->ntn = $data['ntn'] ?? null;
            $customer->strn = $data['strn'] ?? null;
            $customer->website = $data['website'] ?? null;
            $customer->credit_limit = $data['credit_limit'] ?? 0.00;
            $customer->payment_terms = $data['payment_terms'] ?? 'Net 30 Days';
            $customer->notes = $data['notes'] ?? null;
            $customer->created_by = $actor->id;
            $customer->updated_by = $actor->id;
            $customer->save();

            // 6. Record immutable security audit log (redacting sensitive PII)
            $actorRole = $actor->roles->first()?->name ?? 'SYSTEM_USER';
            $maskedCnic = $customer->getMaskedCnic() ?? 'N/A';
            $auditDetails = "Created customer account [{$customerNo}] '{$legalName}' (Type: {$customer->customer_type->value}, Branch: {$branchId}, CNIC: {$maskedCnic})";

            $this->auditLogService->log(
                actorName: $actor->name,
                actorRole: $actorRole,
                action: 'CUSTOMER_CREATED',
                entityType: 'Customer',
                entityId: (string) $customer->id,
                details: $auditDetails
            );

            return $customer;
        });
    }

    /**
     * Update an existing Customer Master account with organizational authorization protection.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public function updateCustomer(Customer $customer, array $data, User $actor): Customer
    {
        // 1. Authorize actor against customer's existing organization
        $this->validateActorOrganizationScope($actor, $customer->company_id, $customer->branch_id);

        // 2. If branch is being updated, validate against customer's company
        if (isset($data['branch_id']) && (int) $data['branch_id'] !== $customer->branch_id) {
            $newBranchId = (int) $data['branch_id'];
            if (!$this->organizationService->validateBranchBelongsToCompany($newBranchId, $customer->company_id)) {
                throw ValidationException::withMessages([
                    'branch_id' => ['The selected branch does not belong to the customer\'s company.'],
                ]);
            }
            $customer->branch_id = $newBranchId;
        }

        return DB::transaction(function () use ($customer, $data, $actor) {
            if (isset($data['customer_type'])) {
                $customer->customer_type = $data['customer_type'] instanceof CustomerType
                    ? $data['customer_type']
                    : CustomerType::from($data['customer_type']);
            }

            if (isset($data['legal_name'])) {
                $customer->legal_name = trim($data['legal_name']);
            }

            if (array_key_exists('trade_name', $data)) {
                $customer->trade_name = !empty($data['trade_name']) ? trim($data['trade_name']) : null;
            }

            // Update display name if supplied or recalculate
            if (!empty($data['display_name'])) {
                $customer->display_name = trim($data['display_name']);
            } elseif (isset($data['legal_name']) || array_key_exists('trade_name', $data)) {
                $customer->display_name = $customer->trade_name ?: $customer->legal_name;
            }

            if (isset($data['status'])) {
                $customer->status = $data['status'] instanceof CustomerStatus
                    ? $data['status']
                    : CustomerStatus::from($data['status']);
            }

            if (array_key_exists('phone', $data)) $customer->phone = $data['phone'];
            if (array_key_exists('email', $data)) $customer->email = $data['email'];
            if (array_key_exists('cnic', $data)) $customer->cnic = $data['cnic'];
            if (array_key_exists('ntn', $data)) $customer->ntn = $data['ntn'];
            if (array_key_exists('strn', $data)) $customer->strn = $data['strn'];
            if (array_key_exists('website', $data)) $customer->website = $data['website'];
            if (array_key_exists('credit_limit', $data)) $customer->credit_limit = $data['credit_limit'];
            if (array_key_exists('payment_terms', $data)) $customer->payment_terms = $data['payment_terms'];
            if (array_key_exists('notes', $data)) $customer->notes = $data['notes'];

            $customer->updated_by = $actor->id;
            $customer->save();

            // Record audit log
            $actorRole = $actor->roles->first()?->name ?? 'SYSTEM_USER';
            $auditDetails = "Updated customer account [{$customer->customer_no}] '{$customer->legal_name}' (Status: {$customer->status->value})";

            $this->auditLogService->log(
                actorName: $actor->name,
                actorRole: $actorRole,
                action: 'CUSTOMER_UPDATED',
                entityType: 'Customer',
                entityId: (string) $customer->id,
                details: $auditDetails
            );

            return $customer;
        });
    }

    /**
     * Change lifecycle status with audit recording.
     */
    public function changeStatus(Customer $customer, CustomerStatus $status, ?string $reason, User $actor): Customer
    {
        $this->validateActorOrganizationScope($actor, $customer->company_id, $customer->branch_id);

        $oldStatus = $customer->status->value;
        $customer->status = $status;
        $customer->updated_by = $actor->id;
        $customer->save();

        $actorRole = $actor->roles->first()?->name ?? 'SYSTEM_USER';
        $auditDetails = "Customer [{$customer->customer_no}] status transitioned from {$oldStatus} to {$status->value}. Reason: " . ($reason ?: 'Administrative update');

        $this->auditLogService->log(
            actorName: $actor->name,
            actorRole: $actorRole,
            action: 'CUSTOMER_STATUS_CHANGED',
            entityType: 'Customer',
            entityId: (string) $customer->id,
            details: $auditDetails
        );

        return $customer;
    }

    /**
     * Verify that an actor is authorized to interact with the target company and branch.
     *
     * @throws ValidationException
     */
    protected function validateActorOrganizationScope(User $actor, int $companyId, int $branchId): void
    {
        if ($actor->isSuperAdmin()) {
            return;
        }

        // Must match company
        if (!is_null($actor->company_id) && $actor->company_id !== $companyId) {
            throw ValidationException::withMessages([
                'company_id' => ['You are not authorized to create or modify customers for another enterprise company.'],
            ]);
        }

        // Must match branch if user is branch-scoped
        if (!is_null($actor->branch_id) && $actor->branch_id !== $branchId) {
            throw ValidationException::withMessages([
                'branch_id' => ['You are not authorized to create or modify customers for another branch.'],
            ]);
        }
    }
}
