<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Companies
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('legal_name', 191);
            $table->string('trade_name', 191);
            $table->string('ntn', 50)->unique();
            $table->string('strn', 50)->nullable();
            $table->string('incorporation_no', 50)->nullable();
            $table->text('head_office_address');
            $table->string('city', 100);
            $table->string('country', 100)->default('Pakistan');
            $table->string('primary_phone', 50);
            $table->string('emergency_noc_phone', 50);
            $table->string('email', 191);
            $table->string('website', 191)->nullable();
            $table->string('currency', 10)->default('PKR');
            $table->string('timezone', 50)->default('Asia/Karachi');
            $table->timestamps();
        });

        // 2. Branches
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 191);
            $table->string('city', 100);
            $table->string('province', 100);
            $table->text('address');
            $table->string('phone', 50);
            $table->string('manager_name', 191);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['city', 'is_active']);
        });

        // 3. Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name', 191);
            $table->string('head_of_department', 191);
            $table->unsignedInteger('employee_count')->default(0);
            $table->timestamps();
        });

        // 4. Warehouses
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('code', 50)->unique();
            $table->string('name', 191);
            $table->text('location');
            $table->string('capacity', 100)->nullable();
            $table->string('manager_name', 191);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['branch_id', 'is_active']);
        });

        // 5. Server-Side Auto-Numbering Sequences (Section 13)
        Schema::create('numbering_sequences', function (Blueprint $table) {
            $table->id();
            $table->string('prefix', 10)->unique(); // CUS, VEH, DEV, SIM, INS, TKT, INV, etc.
            $table->string('entity', 100);
            $table->unsignedBigInteger('current_number')->default(0);
            $table->unsignedInteger('step')->default(1);
            $table->unsignedInteger('padding')->default(6);
            $table->string('delimiter', 5)->default('-');
            $table->string('format', 50)->default('{PREFIX}-{NUMBER}');
            $table->timestamps();
        });

        // 6. Security Audit Logs (Section 40)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor_name', 191);
            $table->string('actor_role', 100);
            $table->string('action', 100);
            $table->string('entity_type', 100);
            $table->string('entity_id', 100);
            $table->text('details');
            $table->string('ip_address', 45)->default('127.0.0.1');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['action', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('numbering_sequences');
        Schema::dropIfExists('warehouses');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('branches');
        Schema::dropIfExists('companies');
    }
};
