# VALS Tracking Enterprise Platform — Development Setup

## 1. Dual-Stack Overview

The project supports two execution contexts:

| Mode | Technology Stack | Purpose |
|---|---|---|
| **Development Sandbox / Live Preview** | Node.js 22, Express, React 19, TypeScript | Instant development in browser sandboxes where PHP is unavailable. |
| **Production Target & Local Server** | PHP 8.5, Laravel 13, MySQL 8.4, Inertia.js | Production enterprise deployment on WAMP (`C:\wamp64\www\vals-tracking-enterprise`) or Linux. |

---

## 2. Running the Node.js / Express Prototype

```bash
# 1. Install Node dependencies
npm install

# 2. Run automated test suite (28 business tests)
npm test

# 3. Start development server on port 3000
npm run dev

# 4. Production build check
npm run build
```

---

## 3. Production Laravel Deployment on Windows / WAMP

### Prerequisites
- WAMP Server 3.3+ with PHP 8.5+ enabled
- MySQL 8.4 LTS running on port 3306
- Composer 2.7+
- Node.js 20+ and npm 10+

### Setup Commands
```cmd
cd C:\wamp64\www\vals-tracking-enterprise

:: 1. Install PHP dependencies
composer install

:: 2. Configure environment
copy .env.example .env
php artisan key:generate

:: 3. Create database in MySQL 8.4
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vals_tracking_enterprise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

:: 4. Run Laravel database migrations
php artisan migrate

:: 5. Execute Laravel test suite
php artisan test

:: 6. Install frontend packages and build assets
npm install
npm run build

:: 7. Start Laravel server
php artisan serve --port=8000
```
