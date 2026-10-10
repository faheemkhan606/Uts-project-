<?php

namespace App\DTO;

class NormalizedTelemetry
{
    public function __construct(
        public readonly string $deviceId,
        public readonly string $imei,
        public readonly string $vehicleId,
        public readonly string $timestamp,
        public readonly float $latitude,
        public readonly float $longitude,
        public readonly int $speed,
        public readonly int $heading,
        public readonly bool $ignition,
        public readonly bool $gpsValid,
        public readonly float $batteryVoltage,
        public readonly bool $externalPower,
        public readonly int $odometer,
        public readonly ?float $fuelLevel = null,
        public readonly ?int $engineHours = null,
        public readonly ?string $rawPayload = null,
        public readonly string $protocol = 'Generic'
    ) {}

    public function toArray(): array
    {
        return [
            'deviceId' => $this->deviceId,
            'imei' => $this->imei,
            'vehicleId' => $this->vehicleId,
            'timestamp' => $this->timestamp,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'speed' => $this->speed,
            'heading' => $this->heading,
            'ignition' => $this->ignition,
            'gpsValid' => $this->gpsValid,
            'batteryVoltage' => $this->batteryVoltage,
            'externalPower' => $this->externalPower,
            'odometer' => $this->odometer,
            'fuelLevel' => $this->fuelLevel,
            'engineHours' => $this->engineHours,
            'rawPayload' => $this->rawPayload,
            'protocol' => $this->protocol,
        ];
    }
}
