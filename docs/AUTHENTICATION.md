# VALS Tracking Enterprise Platform — Authentication Architecture

**Project Owner:** VALS Tracking (Private) Limited  
**Current Phase:** Phase 01  
**Current Step:** Step 03 (Authentication Foundation)  
**Status:** CODE FOUNDATION FREEZE  

---

## 1. Selected Authentication Approach & Rationale

### Decision: Native Laravel Session Authentication with Inertia.js
The web operations console employs Laravel's native session-based authentication stack (`Illuminate\Support\Facades\Auth`, `Authenticatable`, `LoginRequest`, and `AuthenticatedSessionController`) connected to React 19 via Inertia.js.

### Why This Approach Was Selected:
1. **Zero Unnecessary Dependencies:** Does not introduce redundant vendor layers when Laravel's built-in session guard (`auth:web`) already provides encrypted HTTP-only session cookies and CSRF protection.
2. **First-Party Security Model:** Browser-based enterprise ERPs operate most securely with stateful session cookies (`SameSite=Lax`, `HttpOnly=true`) rather than storing bearer tokens in `localStorage` (which is vulnerable to XSS token theft).
3. **No Premature Sanctum Overhead:** API and mobile token authentication are reserved for future phases. Introducing Sanctum as the primary browser authentication layer at this stage would add needless complexity.
4. **Decoupled from RBAC:** Strictly enforces identity verification ("Who are you?") without entangling role authorizations ("What can you do?"), maintaining architectural isolation for Step 04.

---

## 2. Authentication Lifecycle & Flows

### A. Login Flow
```text
[User Submits Credentials on /login]
               ↓
[LoginRequest Form Validation]
  ├── Validate email format and password presence
  └── Rate Limiter Check (email + IP throttle key)
               ↓
[Auth::attempt(['email' => $email, 'password' => $password], $remember)]
  ├── SUCCESS:
  │     ├── RateLimiter::clear()
  │     ├── $request->session()->regenerate() (Prevents session fixation)
  │     ├── AuditLogService::log('AUTH_LOGIN_SUCCESS')
  │     └── Redirect to intended URL or /dashboard
  └── FAILURE:
        ├── RateLimiter::hit(throttleKey, 60s)
        ├── Generic error returned ('auth.failed')
        └── Zero password leakage; no disclosure of whether email exists
```

### B. Logout Flow
```text
[POST Request to /logout (Protected by auth middleware & CSRF)]
               ↓
[Auth::guard('web')->logout()]
               ↓
[$request->session()->invalidate()]
               ↓
[$request->session()->regenerateToken()] (Rotates CSRF token)
               ↓
[AuditLogService::log('AUTH_LOGOUT')]
               ↓
[Redirect to /login]
```

---

## 3. Security Specifications

### Password Hashing Policy
- Passwords are encrypted exclusively using Laravel's native hashing mechanisms (`Hash::make()` with Bcrypt/Argon2id).
- The `User` model automatically casts `password => hashed`.
- The `User` model hides `password` and `remember_token` from JSON/array serialization (`$hidden` array), preventing accidental exposure in APIs or Inertia page props.
- Raw passwords are never logged, never stored in audit trails, and never passed through URL parameters.

### Rate Limiting & Brute-Force Defense
- Login requests are throttled using a compound key: `lowercase(email) | IP_address`.
- Maximum 5 consecutive failed attempts per 60-second window.
- Exceeding the threshold triggers an `Illuminate\Auth\Events\Lockout` event and returns an HTTP 422 with a countdown timer (`Too many login attempts. Please try again in X seconds.`).

### Session Security Settings
- **Cookie Name:** Dynamic slug based on application name.
- **HttpOnly:** `true` (enforced in `config/session.php`). JavaScript cannot read session tokens.
- **SameSite:** `lax` (prevents cross-site request forgery while permitting top-level navigation).
- **Secure Flag:** Controlled via `SESSION_SECURE_COOKIE`:
  - Local WAMP (`http://localhost:8000`): Set to `false` or `null` so sessions function over HTTP.
  - Production (`https://ops.valstracking.com`): Set to `true` to require HTTPS transmission.

### Inertia Auth State
Shared via `app/Http/Middleware/HandleInertiaRequests.php`:
```php
'auth' => [
    'user' => $user ? [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
    ] : null,
],
```
Only the authenticated user's ID, name, and email are exposed to the React frontend.

---

## 4. Protected Routes

| Route | Method | Middleware | Description |
|---|---|---|---|
| `/login` | `GET` | `guest` | Displays the login screen (Inertia `Auth/Login`). |
| `/login` | `POST` | `guest` | Authenticates credentials with rate limiting. |
| `/logout` | `POST` | `auth` | Invalidates session and regenerates CSRF token. |
| `/dashboard` | `GET` | `auth` | Protected operations console. Unauthenticated requests redirect to `/login`. |
| `/` | `GET` | — | Redirects to `/dashboard` (which routes to `/login` if guest). |

---

## 5. Target Testing & Execution Commands (WAMP)

```cmd
cd C:\wamp64\www\vals-tracking-enterprise

:: 1. Run migrations including users & sessions tables
php artisan migrate

:: 2. Execute Authentication test suite
php artisan test --filter=AuthenticationTest
```
