<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProductBrandSeeder::class,
            ProductCategorySeeder::class,
            StoreSeeder::class,
            SupplierSeeder::class,
            AdminUserSeeder::class,
            ProductSeeder::class,
            InventorySeeder::class,
            StockTransactionSeeder::class,
            StockMovementSeeder::class,
            SaleSeeder::class
        ]);

    }
}
