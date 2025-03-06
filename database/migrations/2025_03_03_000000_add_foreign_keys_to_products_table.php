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
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('product_brand_id')
                ->references('id')
                ->on('product_brands')
                ->onDelete('cascade');

            $table->foreign('product_category_id')
                ->references('id')
                ->on('product_categories')
                ->onDelete('cascade');

            $table->foreign('supplier_id')
                ->references('id')
                ->on('suppliers')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_brand_id']);
            $table->dropForeign(['product_category_id']);
            $table->dropForeign(['supplier_id']);
        });
    }
};
