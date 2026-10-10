<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record immutable audit log entry
     */
    public function log(
        string $actorName,
        string $actorRole,
        string $action,
        string $entityType,
        string $entityId,
        string $details,
        ?string $ipAddress = null
    ): AuditLog {
        return AuditLog::create([
            'actor_name' => $actorName,
            'actor_role' => $actorRole,
            'action' => strtoupper($action),
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'details' => $details,
            'ip_address' => $ipAddress ?? Request::ip() ?? '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
