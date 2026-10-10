<?php

namespace App\Enums;

enum CustomerType: string
{
    case Individual = 'individual';
    case Corporate = 'corporate';
    case Government = 'government';
    case Dealer = 'dealer';
    case Distributor = 'distributor';
    case Reseller = 'reseller';
    case School = 'school';
    case Hospital = 'hospital';
    case Logistics = 'logistics';
    case Other = 'other';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::Individual => 'Individual',
            self::Corporate => 'Corporate',
            self::Government => 'Government',
            self::Dealer => 'Dealer',
            self::Distributor => 'Distributor',
            self::Reseller => 'Reseller',
            self::School => 'School / University',
            self::Hospital => 'Hospital / Healthcare',
            self::Logistics => 'Fleet & Logistics Operator',
            self::Other => 'Other Organization',
        };
    }

    /**
     * List all string values
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
