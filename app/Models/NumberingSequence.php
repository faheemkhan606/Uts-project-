<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NumberingSequence extends Model
{
    protected $fillable = [
        'prefix',
        'entity',
        'current_number',
        'step',
        'padding',
        'delimiter',
        'format',
    ];

    protected $casts = [
        'current_number' => 'integer',
        'step' => 'integer',
        'padding' => 'integer',
    ];
}
