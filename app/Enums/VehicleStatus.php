<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case Registered = 'Registered';
    case DeviceAssigned = 'Device Assigned';
    case InstallationPending = 'Installation Pending';
    case Installed = 'Installed';
    case Activated = 'Activated';
    case Monitoring = 'Monitoring';
    case Suspended = 'Suspended';
    case Maintenance = 'Maintenance';
    case Deactivated = 'Deactivated';
    case Archived = 'Archived';
}
