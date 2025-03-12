<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockTransaction;
use App\Models\Inventory;
use Carbon\Carbon;
use Faker\Factory as Faker;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get all inventory items
        $inventories = Inventory::all();
        
        // Get stock transactions to link movements to 
        // (for real-world consistency but no direct database relationship)
        $transactions = StockTransaction::all();
        
        // Create stock movements for inventory changes
        // Some directly linked to transactions, some standalone
        
        // First, create stock movements linked to transactions
        foreach ($transactions as $transaction) {
            // Number of products affected in each transaction (1-5)
            $affectedProducts = $faker->numberBetween(1, 5); 
            
            for ($i = 0; $i < $affectedProducts; $i++) {
                // Get random inventory item
                $inventory = $inventories->random();
                
                // Determine movement type based on transaction type
                $movement_type = 'in'; // Default
                
                switch ($transaction->transaction_type) {
                    case 'purchase':
                    case 'return':
                    case 'add':
                    case 'transfer': // For receiving end
                        $movement_type = 'in';
                        break;
                    case 'sale':
                    case 'remove':
                        $movement_type = 'out';
                        break;
                    case 'adjustment':
                        // Adjustment can be either in or out
                        $movement_type = $faker->randomElement(['in', 'out']);
                        break;
                }
                
                // Generate appropriate quantity based on movement type and item price
                $baseQuantity = $faker->numberBetween(1, 10);
                
                // Expensive items typically move in smaller quantities
                $productPrice = $inventory->product->price ?? 100;
                if ($productPrice > 200) {
                    $baseQuantity = $faker->numberBetween(1, 3);
                } elseif ($productPrice > 50) {
                    $baseQuantity = $faker->numberBetween(1, 5);
                }
                
                // Calculate final quantity (might be decimal for certain products)
                $quantity = $baseQuantity;
                
                // Create the stock movement
                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'quantity' => $quantity,
                    'movement_type' => $movement_type,
                    'created_at' => $transaction->transaction_date,
                    'updated_at' => $transaction->transaction_date,
                ]);
            }
        }
        
        // Add some additional standalone movements (e.g., inventory counts, adjustments)
        for ($i = 0; $i < 50; $i++) {
            $inventory = $inventories->random();
            $movement_type = $faker->randomElement(['in', 'out']);
            $quantity = $faker->randomFloat(2, 1, 10);
            
            // Create the standalone stock movement
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'quantity' => $quantity,
                'movement_type' => $movement_type,
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);
        }
    }
}
