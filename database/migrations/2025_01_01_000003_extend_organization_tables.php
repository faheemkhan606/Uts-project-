<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Safely forward-migrates foundation tables to establish normalized
     * Company -> Branch -> Department / Warehouse hierarchy and User organization assignments.
     */
    public function up(): void
    {
        // 1. Extend Companies with active flag
        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (!Schema::hasColumn('companies', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('timezone');
                    $table->index('is_active');
                }
            });
        }

        // 2. Extend Branches with Company relationship and compound uniqueness
        if (Schema::hasTable('branches')) {
            Schema::table('branches', function (Blueprint $table) {
                if (!Schema::hasColumn('branches', 'company_id')) {
                    $table->foreignId('company_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('companies')
                        ->cascadeOnDelete();
                    $table->index(['company_id', 'is_active']);
                }
            });
        }

        // 3. Extend Departments with Company and Branch relationships
        if (Schema::hasTable('departments')) {
            Schema::table('departments', function (Blueprint $table) {
                if (!Schema::hasColumn('departments', 'company_id')) {
                    $table->foreignId('company_id')
                        ->nullable()
                        ->after('id')
                        ->constrained('companies')
                        ->cascadeOnDelete();
                }

                if (!Schema::hasColumn('departments', 'branch_id')) {
                    $table->foreignId('branch_id')
                        ->nullable()
                        ->after('company_id')
                        ->constrained('branches')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('departments', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('employee_count');
                    $table->index(['company_id', 'is_active']);
                }
            });
        }

        // 4. Extend Users with Organization Hierarchy assignments
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'company_id')) {
                    $table->foreignId('company_id')
                        ->nullable()
                        ->after('password')
                        ->constrained('companies')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('users', 'branch_id')) {
                    $table->foreignId('branch_id')
                        ->nullable()
                        ->after('company_id')
                        ->constrained('branches')
                        ->nullOnDelete();
                }

                if (!Schema::hasColumn('users', 'department_id')) {
                    $table->foreignId('department_id')
                        ->nullable()
                        ->after('branch_id')
                        ->constrained('departments')
                        ->nullOnDelete();

                    $table->index(['company_id', 'branch_id', 'department_id'], 'idx_user_org');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'department_id')) {
                    $table->dropForeign(['department_id']);
                    $table->dropColumn('department_id');
                }
                if (Schema::hasColumn('users', 'branch_id')) {
                    $table->dropForeign(['branch_id']);
                    $table->dropColumn('branch_id');
                }
                if (Schema::hasColumn('users', 'company_id')) {
                    $table->dropForeign(['company_id']);
                    $table->dropColumn('company_id');
                }
            });
        }

        if (Schema::hasTable('departments')) {
            Schema::table('departments', function (Blueprint $table) {
                if (Schema::hasColumn('departments', 'branch_id')) {
                    $table->dropForeign(['branch_id']);
                    $table->dropColumn('branch_id');
                }
                if (Schema::hasColumn('departments', 'company_id')) {
                    $table->dropForeign(['company_id']);
                    $table->dropColumn('company_id');
                }
                if (Schema::hasColumn('departments', 'is_active')) {
                    $table->dropColumn('is_active');
                }
            });
        }

        if (Schema::hasTable('branches')) {
            Schema::table('branches', function (Blueprint $table) {
                if (Schema::hasColumn('branches', 'company_id')) {
                    $table->dropForeign(['company_id']);
                    $table->dropColumn('company_id');
                }
            });
        }

        if (Schema::hasTable('companies')) {
            Schema::table('companies', function (Blueprint $table) {
                if (Schema::hasColumn('companies', 'is_active')) {
                    $table->dropColumn('is_active');
                }
            });
        }
    }
};
