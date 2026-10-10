<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the centralized system_settings table to support typed,
     * encrypted, and cached enterprise configuration.
     */
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('scope_type', 20)->default('global'); // 'global', 'company', 'branch', 'user'
            $table->unsignedBigInteger('scope_id')->default(0); // 0 for global, or entity ID
            $table->string('group', 50)->index();
            $table->string('key', 100);
            $table->longText('value')->nullable();
            $table->string('type', 20)->default('string'); // string, integer, float, boolean, json, encrypted
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false)->index();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_encrypted')->default(false);
            $table->timestamps();

            $table->unique(['scope_type', 'scope_id', 'key'], 'system_settings_scope_key_unique');
            $table->index(['scope_type', 'scope_id']);
            $table->index(['group', 'key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
