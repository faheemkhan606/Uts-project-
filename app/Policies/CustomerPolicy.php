<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    /**
     * Determine whether the user can view any customers.
     */
    public function viewAny(User $user): bool
    {
        return $user->isActive() && $user->hasPermission('customers.view');
    }

    /**
     * Determine whether the user can view the specific customer (IDOR Protection).
     */
    public function view(User $user, Customer $customer): bool
    {
        if (!$user->isActive() || !$user->hasPermission('customers.view')) {
            return false;
        }

        return $this->isInUserOrganizationScope($user, $customer);
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        return $user->isActive() && $user->hasPermission('customers.create');
    }

    /**
     * Determine whether the user can update the specific customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        if (!$user->isActive() || !$user->hasPermission('customers.update')) {
            return false;
        }

        return $this->isInUserOrganizationScope($user, $customer);
    }

    /**
     * Determine whether the user can delete (soft delete/archive) the customer.
     * Hard deletion is prohibited as Customer Master data must preserve audit integrity.
     */
    public function delete(User $user, Customer $customer): bool
    {
        if (!$user->isActive() || !$user->hasPermission('customers.delete')) {
            return false;
        }

        return $this->isInUserOrganizationScope($user, $customer);
    }

    /**
     * Determine whether the user can export customer records.
     */
    public function export(User $user): bool
    {
        return $user->isActive() && $user->hasPermission('customers.export');
    }

    /**
     * Server-side multi-tier organization scope validation preventing IDOR across companies and branches.
     */
    protected function isInUserOrganizationScope(User $user, Customer $customer): bool
    {
        // 1. Super Admin has unrestricted operational visibility
        if ($user->isSuperAdmin()) {
            return true;
        }

        // 2. Multi-company tenant isolation: cross-company access is strictly prohibited
        if (!is_null($user->company_id) && $user->company_id !== $customer->company_id) {
            return false;
        }

        // 3. Branch-level isolation: branch-scoped users can only access their own branch customers
        if (!is_null($user->branch_id) && $user->branch_id !== $customer->branch_id) {
            return false;
        }

        return true;
    }
}
