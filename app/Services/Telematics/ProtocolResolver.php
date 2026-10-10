<?php

namespace App\Services\Telematics;

use App\DTO\NormalizedTelemetry;
use InvalidArgumentException;

class ProtocolResolver
{
    public function __construct(
        protected Gt06Decoder $gt06Decoder,
        protected TeltonikaDecoder $teltonikaDecoder
    ) {}

    public function resolveAndDecode(string $rawHex, ?string $hintProtocol = null): NormalizedTelemetry
    {
        $clean = preg_replace('/\s+/', '', strtolower($rawHex));

        if ($hintProtocol === 'GT06' || str_starts_with($clean, '7878') || str_starts_with($clean, '7979')) {
            return $this->gt06Decoder->decode($clean);
        }

        if ($hintProtocol === 'Teltonika' || str_starts_with($clean, '00000000')) {
            return $this->teltonikaDecoder->decode($clean);
        }

        throw new InvalidArgumentException("Unable to resolve GPS telematics protocol for incoming packet: {$rawHex}");
    }
}
