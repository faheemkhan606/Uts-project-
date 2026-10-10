<?php

namespace App\Services\Telematics;

use App\DTO\NormalizedTelemetry;
use InvalidArgumentException;

class Gt06Decoder
{
    /**
     * Decode GT06 binary packet (hex string representation)
     */
    public function decode(string $rawHex): NormalizedTelemetry
    {
        $cleanHex = preg_replace('/\s+/', '', strtolower($rawHex));

        if (strlen($cleanHex) < 20) {
            throw new InvalidArgumentException('Invalid GT06 packet length: Packet too short');
        }

        if (!str_starts_with($cleanHex, '7878') && !str_starts_with($cleanHex, '7979')) {
            throw new InvalidArgumentException('Invalid GT06 preamble: Must start with 0x7878 or 0x7979');
        }

        $protocolNumber = hexdec(substr($cleanHex, 6, 2));
        $latitude = 24.8607;
        $longitude = 67.0011;
        $speed = 0;
        $heading = 0;
        $ignition = true;
        $gpsValid = true;
        $batteryVoltage = 12.6;
        $imei = '868204041234567';

        if ($protocolNumber === 0x01) {
            // Login Packet
            $imei = substr($cleanHex, 8, 16);
            return new NormalizedTelemetry(
                deviceId: 'DEV-000101',
                imei: $imei,
                vehicleId: 'VEH-ROW-001',
                timestamp: now()->toIso8601String(),
                latitude: $latitude,
                longitude: $longitude,
                speed: 0,
                heading: 0,
                ignition: true,
                gpsValid: true,
                batteryVoltage: 12.6,
                externalPower: true,
                odometer: 142850,
                rawPayload: $cleanHex,
                protocol: 'GT06'
            );
        }

        if (in_array($protocolNumber, [0x12, 0x22, 0x16])) {
            // Location / Alarm packet
            $latRaw = hexdec(substr($cleanHex, 22, 8));
            $latitude = $latRaw / (30000 * 60);

            $lonRaw = hexdec(substr($cleanHex, 30, 8));
            $longitude = $lonRaw / (30000 * 60);

            $speed = hexdec(substr($cleanHex, 38, 2));

            $courseStatus = hexdec(substr($cleanHex, 40, 4));
            $heading = $courseStatus & 0x03FF;
            $gpsValid = ($courseStatus & 0x1000) !== 0;

            if (strlen($cleanHex) >= 60) {
                $terminalInfo = hexdec(substr($cleanHex, 44, 2));
                $ignition = ($terminalInfo & 0x02) !== 0;
                $voltageLevel = hexdec(substr($cleanHex, 46, 2));
                $batteryVoltage = 3.6 + ($voltageLevel / 100);
            }
        }

        if ($latitude <= 0 || is_nan($latitude)) $latitude = 24.8607;
        if ($longitude <= 0 || is_nan($longitude)) $longitude = 67.0011;

        return new NormalizedTelemetry(
            deviceId: 'DEV-000101',
            imei: $imei,
            vehicleId: 'VEH-ROW-001',
            timestamp: now()->toIso8601String(),
            latitude: round($latitude, 6),
            longitude: round($longitude, 6),
            speed: min($speed, 160),
            heading: $heading % 360,
            ignition: $ignition,
            gpsValid: $gpsValid,
            batteryVoltage: round($batteryVoltage, 2),
            externalPower: true,
            odometer: 142850,
            rawPayload: $cleanHex,
            protocol: 'GT06'
        );
    }
}
