<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
if (file_exists(__DIR__.'/../vendor/autoload.php')) {
    require __DIR__.'/../vendor/autoload.php';
} else {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'standby',
        'message' => 'VALS Tracking Enterprise - Laravel Application Foundation Initialized.',
        'next_step' => 'Run `composer install` on target server (e.g. C:\wamp64\www\vals-tracking-enterprise)',
        'timestamp' => date('c'),
    ]);
    exit;
}

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
