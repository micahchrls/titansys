<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inventory;
use App\Models\Product\Product;
use Carbon\Carbon;
use Faker\Factory as Faker;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get all products to create inventory records for
        $products = Product::all();
        
        foreach ($products as $product) {
            // Create inventory records for all products
            // Generate different inventory profiles based on product price range
            if ($product->price < 50) {
                // Low cost items often have higher stock
                $quantity = $faker->numberBetween(20, 100);
                $reorderLevel = $faker->numberBetween(10, 25);
            } elseif ($product->price < 200) {
                // Medium priced items
                $quantity = $faker->numberBetween(10, 40);
                $reorderLevel = $faker->numberBetween(5, 15);
            } else {
                // Expensive items typically have lower stock
                $quantity = $faker->numberBetween(2, 15);
                $reorderLevel = $faker->numberBetween(1, 5);
            }
            
            // Some products might be low or out of stock
            if ($faker->boolean(15)) { // 15% chance of low stock
                $quantity = $faker->numberBetween(0, $reorderLevel - 1);
            }
            
            // Create inventory record
            Inventory::create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'reorder_level' => $reorderLevel,
                'last_restocked' => $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d H:i:s'),
            ]);
        }
    }
}
