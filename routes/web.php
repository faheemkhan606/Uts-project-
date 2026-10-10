<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Models\Role;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| VALS Tracking Enterprise - Web Routes (Authentication & RBAC Protected)
|--------------------------------------------------------------------------
*/

// Root redirector
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
});

// Protected Authenticated Routes (Server-Side Authorization Enforced)
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        abort_unless(auth()->user()->can('dashboard.view'), 403, 'Unauthorized access to Operations Dashboard.');

        return Inertia::render('Dashboard', [
            'platform' => 'VALS Tracking Enterprise',
            'edition' => 'Production Laravel 13 + Inertia Foundation',
        ]);
    })->name('dashboard');

    // Foundation Security Route to demonstrate server-side 403 rejection
    Route::get('/admin/roles', function () {
        abort_unless(auth()->user()->can('roles.view'), 403, 'Unauthorized access to Security Roles.');

        return response()->json([
            'roles' => Role::with('permissions')->get(),
        ]);
    })->name('admin.roles');

    // Organization Foundation Routes
    Route::get('/admin/organization', [\App\Http\Controllers\Foundation\OrganizationController::class, 'index'])
        ->name('admin.organization');

    Route::post('/admin/users/{user}/organization', [\App\Http\Controllers\Foundation\OrganizationController::class, 'assignUser'])
        ->name('admin.users.organization.assign');

    // System Settings Foundation Routes
    Route::get('/admin/settings', [\App\Http\Controllers\Foundation\SystemSettingController::class, 'index'])
        ->name('admin.settings');

    Route::post('/admin/settings', [\App\Http\Controllers\Foundation\SystemSettingController::class, 'update'])
        ->name('admin.settings.update');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// Public Settings API (Strictly allowlisted safe parameters only)
Route::get('/api/settings/public', [\App\Http\Controllers\Foundation\SystemSettingController::class, 'publicIndex'])
    ->name('api.settings.public');
