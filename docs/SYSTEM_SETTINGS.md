# VALS Tracking Enterprise Platform — System Settings Foundation Architecture

## 1. Executive Summary

The **System Settings Foundation** (Phase 01 · Step 06) establishes the typed, encrypted, cached, and audited configuration layer for the VALS Tracking Enterprise Platform.

It provides centralized configuration storage across all core operational modules:
- **General**: Branding, trade name, emergency NOC hotline, support email, maintenance mode.
- **Localization**: Default country, default currency (PKR), currency symbol, timezone (Asia/Karachi), standard date and time formats.
- **Security & Access Control**: Session lifetimes, lockout decay, login throttling limits, password policy flags, webhook HMAC secrets.
- **Telematics & NOC Engine**: High-speed alarm thresholds, stationary idle alert durations, GPS packet heartbeat frequencies.
- **Notifications**: Multi-channel toggle flags for SMS, email digests, and live operator audio/visual alerts.
- **Audit & Governance**: Retention thresholds for immutable audit trails.

---

## 2. Relational Schema Design

Table: `system_settings`
Migration: `database/migrations/2025_01_01_000004_create_system_settings_table.php`

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `group` | VARCHAR(50) | INDEX | Subsystem category (`general`, `localization`, `security`, `telematics`, `notifications`, `audit`) |
| `key` | VARCHAR(100) | UNIQUE | Dot-notated configuration key (e.g. `telematics.high_speed_threshold_kph`) |
| `value` | LONGTEXT | NULLABLE | Storage string (raw string, formatted number, JSON, or ciphertext) |
| `type` | VARCHAR(20) | DEFAULT 'string' | Primitive cast identifier (`string`, `integer`, `float`, `boolean`, `json`, `encrypted`) |
| `description` | TEXT | NULLABLE | Human-readable explanation of the setting |
| `is_public` | BOOLEAN | DEFAULT FALSE, INDEX | Safe to share with frontend client via Inertia |
| `is_system` | BOOLEAN | DEFAULT FALSE | Protected from deletion; fundamental system parameter |
| `is_encrypted` | BOOLEAN | DEFAULT FALSE | Stored in database as AES-256-CBC ciphertext via `Crypt::encryptString` |
| `created_at` | TIMESTAMP | NULLABLE | Record creation timestamp |
| `updated_at` | TIMESTAMP | NULLABLE | Record modification timestamp |

---

## 3. Security, Encryption & Integrity Rules

1. **Zero Secret Leakage**:
   - Only settings marked `is_public = true` and `is_encrypted = false` are exposed via `getPublicSettings()` or Inertia shared state.
   - Encrypted values (`is_encrypted = true`) are masked with `'********'` in standard UI responses.
2. **Encrypted at Rest**:
   - Cryptographic secrets (e.g. `security.api_webhook_secret`) are encrypted before database insertion using Laravel's `Crypt::encryptString` and decrypted on retrieval via `Crypt::decryptString`.
3. **Immutable Audit Logging**:
   - Every single mutation via `SystemSettingsService` automatically records an entry in `audit_logs` capturing:
     - `actor_name`
     - `actor_role`
     - `action` (`SETTING_UPDATED` or `SETTING_BATCH_UPDATED`)
     - `entity_type` (`SystemSetting`)
     - `entity_id`
     - Old and new values (encrypted values are masked to prevent audit trail secret leakage)
     - IP address and timestamp.
4. **Caching & Invalidation**:
   - Reads are served from memory cache (`vals_system_setting:{key}`).
   - Writing or batch updating immediately flushes both the specific key and the public dictionary cache.

---

## 4. UI & Authorization Bridge

- UI page: `resources/js/Pages/Settings/Index.tsx`
- TypeScript helpers: `resources/js/lib/settings.ts`
- Routes:
  - `GET /admin/settings` (Requires `settings.view` permission)
  - `POST /admin/settings` (Requires `settings.update` permission)
  - `GET /api/settings/public` (Public client configuration dictionary)
- Gates & Policies:
  - Super Admin has global bypass.
  - Operations Manager has viewing rights.
  - Staff without `settings.view` receive an immediate `403 Forbidden`.

---

## 5. Prototype Preservation & Regression Status

The Express baseline prototype (`server.ts`, `src/server/db.ts`, `tests/run-tests.ts`, `src/App.tsx`, `src/components/*`) remains 100% untouched and passes **28/28 automated baseline tests**.
