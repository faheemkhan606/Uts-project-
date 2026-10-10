<?php

namespace App\Http\Controllers\Foundation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSystemSettingsRequest;
use App\Models\SystemSetting;
use App\Services\Settings\SystemSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function __construct(
        protected SystemSettingsService $settingsService
    ) {}

    /**
     * Display centralized enterprise system settings.
     */
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()?->can('settings.view'),
            403,
            'Unauthorized access to System Settings.'
        );

        $settings = SystemSetting::all()->map(function (SystemSetting $item) {
            return [
                'id' => $item->id,
                'group' => $item->group,
                'key' => $item->key,
                'value' => $item->is_encrypted ? '********' : $item->typed_value,
                'type' => $item->type,
                'description' => $item->description,
                'is_public' => $item->is_public,
                'is_system' => $item->is_system,
                'is_encrypted' => $item->is_encrypted,
            ];
        })->groupBy('group');

        return Inertia::render('Settings/Index', [
            'settingsGrouped' => $settings,
            'canUpdate' => (bool) $request->user()?->can('settings.update'),
        ]);
    }

    /**
     * Update submitted settings batch with audit logging and cache purge.
     */
    public function update(UpdateSystemSettingsRequest $request): RedirectResponse
    {
        $submitted = $request->input('settings', []);

        $actorRole = $request->user()?->roles()->first()?->name ?? 'SUPER_ADMIN';

        $this->settingsService->updateMany(
            settingsKeyValuePairs: $submitted,
            actorName: $request->user()?->name ?? 'SYSTEM',
            actorRole: $actorRole,
            ipAddress: $request->ip()
        );

        return back()->with('success', 'System settings saved successfully.');
    }

    /**
     * Retrieve public client configuration dictionary.
     */
    public function publicIndex(): JsonResponse
    {
        return response()->json([
            'settings' => $this->settingsService->getPublicSettings(),
        ]);
    }
}
