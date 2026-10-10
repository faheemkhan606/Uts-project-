<?php

namespace Tests\Unit;

use App\Services\Telematics\Gt06Decoder;
use PHPUnit\Framework\TestCase;

class Gt06DecoderTest extends TestCase
{
    public function test_decodes_standard_gt06_gps_packet(): void
    {
        $decoder = new Gt06Decoder();
        $sampleHex = '78781f12190a050d302b0c410291990c010200321400010100000001000212340d0a';

        $telemetry = $decoder->decode($sampleHex);

        $this->assertEquals('GT06', $telemetry->protocol);
        $this->assertGreaterThan(0, $telemetry->latitude);
        $this->assertGreaterThan(0, $telemetry->longitude);
        $this->assertIsInt($telemetry->speed);
        $this->assertIsInt($telemetry->heading);
    }
}
