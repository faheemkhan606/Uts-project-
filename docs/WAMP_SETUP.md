# VALS Tracking Enterprise Platform — WAMP Server Setup Guide

**Target Environment:** Windows 10/11 / Windows Server 2022  
**Target Path:** `C:\wamp64\www\vals-tracking-enterprise`  
**Web Server:** Apache 2.4+  
**Database:** MySQL 8.4 LTS  
**PHP Version:** PHP 8.5 (or PHP 8.3/8.4 with required extensions)  

---

## 1. Verifying Tooling Prerequisites

Open PowerShell or Command Prompt as Administrator:

```cmd
:: 1. Verify PHP Version
php -v

:: 2. Verify Composer
composer --version

:: 3. Verify Node.js and NPM
node -v
npm -v

:: 4. Verify Git
git --version
```

Required PHP Extensions:
- `pdo_mysql`
- `mbstring`
- `openssl`
- `tokenizer`
- `xml`
- `ctype`
- `json`
- `bcmath`
- `curl`

---

## 2. Step-by-Step Repository Deployment

```cmd
:: Navigate to WAMP document root
cd C:\wamp64\www\vals-tracking-enterprise

:: 1. Install PHP Composer Dependencies
composer install

:: 2. Configure Environment File
copy .env.example .env

:: 3. Generate Secure Application Key
php artisan key:generate

:: 4. Create MySQL 8.4 Database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vals_tracking_enterprise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

:: 5. Execute Database Migrations
php artisan migrate

:: 6. Run Laravel Test Suite
php artisan test

:: 7. Install Frontend Packages & Compile Production Assets
npm install
npm run build

:: 8. Launch Local Development Server
php artisan serve --port=8000
```

---

## 3. Configuring Apache Virtual Host (Optional)

In `C:\wamp64\bin\apache\apacheX.X.X\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName vals-tracking.local
    DocumentRoot "C:/wamp64/www/vals-tracking-enterprise/public"
    <Directory "C:/wamp64/www/vals-tracking-enterprise/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Add to `C:\Windows\System32\drivers\etc\hosts`:
```text
127.0.0.1 vals-tracking.local
```
Restart WAMP Apache service.
