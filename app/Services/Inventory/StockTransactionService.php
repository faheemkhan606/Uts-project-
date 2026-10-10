<?php

namespace App\Services\Inventory;

use InvalidArgumentException;

class StockTransactionService
{
    /**
     * Verify and calculate stock movement invariant:
     * Current Stock = Opening + Receipts - Issues + Returns - Damage +/- Adjustments
     */
    public function validateStockMovement(
        int $currentStock,
        string $transactionType,
        int $quantity
    ): int {
        if ($quantity <= 0) {
            throw new InvalidArgumentException('Stock transaction quantity must be greater than zero.');
        }

        $type = ucfirst(strtolower($transactionType));

        if (in_array($type, ['Issue', 'Damage'])) {
            if ($currentStock < $quantity) {
                throw new InvalidArgumentException(
                    "Insufficient stock balance. Current: {$currentStock}, Attempted: {$quantity}"
                );
            }
            return $currentStock - $quantity;
        }

        if (in_array($type, ['Receipt', 'Return'])) {
            return $currentStock + $quantity;
        }

        if ($type === 'Adjustment') {
            return max(0, $currentStock + $quantity);
        }

        throw new InvalidArgumentException("Unknown stock transaction type: {$transactionType}");
    }
}
