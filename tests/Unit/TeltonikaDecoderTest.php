<?php

namespace Tests\Unit;

use App\Services\Telematics\TeltonikaDecoder;
use PHPUnit\Framework\TestCase;

class TeltonikaDecoderTest extends TestCase
{
    public function test_decodes_teltonika_codec_8_packet(): void
    {
        $decoder = new TeltonikaDecoder();
        $sampleHex = '000000000000002b08010000018a1234567800028a1234017a12340000002d004108010000000000010000000100001234';

        $telemetry = $decoder->decode($sampleHex);

        $this->assertEquals('Teltonika', $telemetry->protocol);
        $this->assertGreaterThan(0, $telemetry->latitude);
        $this->assertGreaterThan(0, $telemetry->longitude);
        $this->assertIsInt($telemetry->speed);
    }
}
