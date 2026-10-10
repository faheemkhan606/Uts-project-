<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce MySQL 8.4 utf8mb4 default string length
        Schema::defaultStringLength(191);

        // Register domain policies
        Gate::policy(\App\Models\Customer::class, \App\Policies\CustomerPolicy::class);

        // RBAC Gate Infrastructure

        // 1. Super Admin bypass & Inactive user blockage
        Gate::before(function (User $user, string $ability) {
            // Block all authorizations for suspended/inactive accounts
            if (! $user->isActive()) {
                return false;
            }

            // Super Admin has unrestricted permissions across application
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // 2. Dynamic permission resolver for module.action patterns
        Gate::after(function (User $user, string $ability, ?bool $result) {
            if ($result !== null) {
                return $result;
            }

            if (! $user->isActive()) {
                return false;
            }

            return $user->hasPermission($ability);
        });
    }
}
