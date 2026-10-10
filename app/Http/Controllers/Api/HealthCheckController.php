<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Throwable;

class HealthCheckController extends Controller
{
    /**
     * Production-safe health check endpoint.
     * Exposes operational readiness without leaking secrets or credentials.
     */
    public function __invoke(): JsonResponse
    {
        $dbStatus = 'unverified';
        try {
            if (DB::connection()->getPdo()) {
                $dbStatus = 'connected';
            }
        } catch (Throwable) {
            $dbStatus = 'standby';
        }

        return response()->json([
            'status' => 'operational',
            'application' => config('app.name', 'VALS Tracking Enterprise'),
            'version' => '1.0.0-PROD-FOUNDATION',
            'environment' => config('app.env', 'production'),
            'database_status' => $dbStatus,
            'timezone' => config('app.timezone', 'Asia/Karachi'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
