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
        Schema::create('store_images', function (Blueprint $table) {
            $table->id();
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            $table->string('file_name', 191);
            $table->text('file_path');
            $table->string('file_extension', 191);
            $table->string('file_size', 191);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_images');
    }
};
