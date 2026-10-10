<?php

namespace App\Policies;

use App\Models\SystemSetting;
use App\Models\User;

class SystemSettingPolicy
{
    /**
     * Determine whether the user can view any settings.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('settings.view');
    }

    /**
     * Determine whether the user can view the specific setting.
     */
    public function view(User $user, SystemSetting $setting): bool
    {
        return $user->hasPermission('settings.view');
    }

    /**
     * Determine whether the user can update the setting.
     */
    public function update(User $user, ?SystemSetting $setting = null): bool
    {
        return $user->hasPermission('settings.update');
    }

    /**
     * System settings cannot be deleted. Non-system settings can be deleted with settings.update permission.
     */
    public function delete(User $user, SystemSetting $setting): bool
    {
        if ($setting->is_system) {
            return false;
        }

        return $user->hasPermission('settings.update');
    }
}
