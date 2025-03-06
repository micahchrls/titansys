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
            $table->foreign('product_brand_id', 'products_brand_id_foreign')
                ->references('id')
                ->on('product_brands')
                ->onDelete('cascade');

            $table->foreign('product_category_id', 'products_category_id_foreign')
                ->references('id')
                ->on('product_categories')
                ->onDelete('cascade');

            $table->foreign('supplier_id', 'products_supplier_id_foreign')
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
            $table->dropForeign('products_brand_id_foreign');
            $table->dropForeign('products_category_id_foreign');
            $table->dropForeign('products_supplier_id_foreign');
        });
    }
};
