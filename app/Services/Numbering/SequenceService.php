<?php

namespace App\Services\Numbering;

use App\Models\NumberingSequence;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SequenceService
{
    /**
     * Generate next sequential identifier with row-level transaction lock (MySQL 8.4 safe).
     * Format: PREFIX-000001
     */
    public function getNextSequence(string $prefix): string
    {
        return DB::transaction(function () use ($prefix) {
            /** @var NumberingSequence|null $seq */
            $seq = NumberingSequence::where('prefix', strtoupper($prefix))
                ->lockForUpdate()
                ->first();

            if (!$seq) {
                // Initialize default sequence if not present
                $seq = NumberingSequence::create([
                    'prefix' => strtoupper($prefix),
                    'entity' => "Entity {$prefix}",
                    'current_number' => 0,
                    'step' => 1,
                    'padding' => 6,
                    'delimiter' => '-',
                    'format' => '{PREFIX}-{NUMBER}',
                ]);
            }

            $seq->current_number += $seq->step;
            $seq->save();

            $formattedNumber = str_pad((string) $seq->current_number, $seq->padding, '0', STR_PAD_LEFT);
            return "{$seq->prefix}{$seq->delimiter}{$formattedNumber}";
        });
    }

    /**
     * Preview without incrementing
     */
    public function previewNextSequence(string $prefix): string
    {
        $seq = NumberingSequence::where('prefix', strtoupper($prefix))->first();
        if (!$seq) {
            return strtoupper($prefix) . '-000001';
        }
        $next = $seq->current_number + $seq->step;
        $formatted = str_pad((string) $next, $seq->padding, '0', STR_PAD_LEFT);
        return "{$seq->prefix}{$seq->delimiter}{$formatted}";
    }
}
