<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the authoritative Customer Master table for VALS Tracking Enterprise Platform.
     * Enforces enterprise multi-company tenancy, servicing branch scoping, and non-destructive soft deletes.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            // Organizational Tenancy & Ownership (Restrict deletion of parent company/branch with active customers)
            $table->foreignId('company_id')->constrained('companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->restrictOnDelete();

            // Business Identifier & Entity Classification
            $table->string('customer_no', 20);
            $table->string('customer_type', 30)->default('corporate');

            // Legal & Operating Identity
            $table->string('legal_name', 191);
            $table->string('trade_name', 191)->nullable();
            $table->string('display_name', 191);

            // Lifecycle Operational Status
            $table->string('status', 20)->default('active');

            // Communication Channels
            $table->string('phone', 30)->nullable();
            $table->string('email', 191)->nullable();

            // Compliance & Tax Identifiers (National/International)
            $table->string('cnic', 50)->nullable();
            $table->string('ntn', 50)->nullable();
            $table->string('strn', 50)->nullable();
            $table->string('website', 191)->nullable();

            // Commercial Credit & Invoicing Baseline
            $table->decimal('credit_limit', 14, 2)->default(0.00);
            $table->string('payment_terms', 50)->default('Net 30 Days');
            $table->text('notes')->nullable();

            // Attribution & Non-destructive Archival
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            // Integrity Constraints & Composite Performance Indexes
            $table->unique(['company_id', 'customer_no'], 'uq_customers_comp_no');
            $table->index(['company_id', 'branch_id', 'status'], 'idx_customers_comp_branch_status');
            $table->index(['company_id', 'status'], 'idx_customers_comp_status');
            $table->index('customer_type', 'idx_customers_type');
            $table->index('legal_name', 'idx_customers_legal_name');
            $table->index('trade_name', 'idx_customers_trade_name');
            $table->index('phone', 'idx_customers_phone');
            $table->index('email', 'idx_customers_email');
            $table->index(['ntn', 'cnic'], 'idx_customers_tax_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
