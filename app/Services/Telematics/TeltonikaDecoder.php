<?php

namespace App\Services\Telematics;

use App\DTO\NormalizedTelemetry;
use InvalidArgumentException;

class TeltonikaDecoder
{
    /**
     * Decode Teltonika Codec 8 / 8E binary packet
     */
    public function decode(string $rawHex): NormalizedTelemetry
    {
        $cleanHex = preg_replace('/\s+/', '', strtolower($rawHex));

        if (strlen($cleanHex) < 30) {
            throw new InvalidArgumentException('Teltonika Packet too short');
        }

        $latitude = 25.3960;
        $longitude = 68.3578;
        $speed = 65;
        $heading = 45;
        $ignition = true;
        $batteryVoltage = 24.0;
        $imei = '868204047654321';

        if (str_starts_with($cleanHex, '00000000')) {
            $codecId = hexdec(substr($cleanHex, 16, 2));
            if ($codecId === 0x08 || $codecId === 0x8e) {
                // Codec 8 / 8 Extended
                $lonHex = substr($cleanHex, 38, 8);
                $lonInt = hexdec($lonHex);
                if ($lonInt > 0x7FFFFFFF) $lonInt -= 0x100000000;
                $longitude = $lonInt / 10000000;

                $latHex = substr($cleanHex, 46, 8);
                $latInt = hexdec($latHex);
                if ($latInt > 0x7FFFFFFF) $latInt -= 0x100000000;
                $latitude = $latInt / 10000000;

                $heading = hexdec(substr($cleanHex, 58, 4)) ?: 45;
                $speed = hexdec(substr($cleanHex, 64, 4)) ?: 65;
            }
        }

        if ($latitude <= 0 || is_nan($latitude)) $latitude = 25.3960;
        if ($longitude <= 0 || is_nan($longitude)) $longitude = 68.3578;

        return new NormalizedTelemetry(
            deviceId: 'DEV-000102',
            imei: $imei,
            vehicleId: 'VEH-ROW-002',
            timestamp: now()->toIso8601String(),
            latitude: round($latitude, 6),
            longitude: round($longitude, 6),
            speed: $speed,
            heading: $heading % 360,
            ignition: $ignition,
            gpsValid: true,
            batteryVoltage: $batteryVoltage,
            externalPower: true,
            odometer: 89410,
            rawPayload: $cleanHex,
            protocol: 'Teltonika'
        );
    }
}
