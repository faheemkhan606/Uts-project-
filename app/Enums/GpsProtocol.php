<?php

namespace App\Enums;

enum GpsProtocol: string
{
    case GT06 = 'GT06';
    case Teltonika = 'Teltonika';
    case Concox = 'Concox';
    case Queclink = 'Queclink';
    case SinoTrack = 'SinoTrack';
    case TKStar = 'TKStar';
    case GenericHTTP = 'GenericHTTP';
}
