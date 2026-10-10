<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        protected ?AuditLogService $auditLogService = null
    ) {}

    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();
        if ($user && ! $user->isActive()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => 'This account has been deactivated. Please contact your system administrator.',
            ]);
        }

        $request->session()->regenerate();

        // Record successful login audit event without logging passwords
        try {
            $user = Auth::user();
            if ($user && $this->auditLogService) {
                $this->auditLogService->log(
                    actorName: $user->name,
                    actorRole: 'Authenticated User',
                    action: 'AUTH_LOGIN_SUCCESS',
                    entityType: 'User',
                    entityId: (string) $user->id,
                    details: 'User authenticated via web session.',
                    ipAddress: $request->ip()
                );
            }
        } catch (Throwable) {
            // Non-fatal if database audit log table is not yet migrated
        }

        return redirect()->intended('/dashboard');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $userName = Auth::user()?->name ?? 'User';
        $userId = (string) (Auth::user()?->id ?? '0');

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        try {
            if ($this->auditLogService) {
                $this->auditLogService->log(
                    actorName: $userName,
                    actorRole: 'User',
                    action: 'AUTH_LOGOUT',
                    entityType: 'User',
                    entityId: $userId,
                    details: 'User session terminated via POST logout.',
                    ipAddress: $request->ip()
                );
            }
        } catch (Throwable) {
            // Non-fatal
        }

        return redirect('/login');
    }
}
