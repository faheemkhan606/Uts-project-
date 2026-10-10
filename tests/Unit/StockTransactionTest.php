<?php

namespace Tests\Unit;

use App\Services\Inventory\StockTransactionService;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class StockTransactionTest extends TestCase
{
    public function test_valid_stock_issue_decrements_balance(): void
    {
        $service = new StockTransactionService();
        $newBalance = $service->validateStockMovement(
            currentStock: 100,
            transactionType: 'Issue',
            quantity: 5
        );

        $this->assertEquals(95, $newBalance);
    }

    public function test_negative_stock_balance_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $service = new StockTransactionService();
        $service->validateStockMovement(
            currentStock: 10,
            transactionType: 'Issue',
            quantity: 9999
        );
    }
}
