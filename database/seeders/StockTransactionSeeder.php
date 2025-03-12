<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stock\StockTransaction;
use App\Models\Store\Store;
use App\Models\User;
use Carbon\Carbon;
use Faker\Factory as Faker;

class StockTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get all stores and users for relationships
        $stores = Store::all();
        $users = User::where('role', 'admin')->orWhere('role', 'staff')->get();
        
        // Transaction types with weighted probabilities
        $transactionTypes = [
            'purchase' => 30,     // 30% chance of being a purchase
            'sale' => 40,         // 40% chance of being a sale
            'return' => 10,       // 10% chance of being a return
            'adjustment' => 5,    // 5% chance of being an adjustment
            'transfer' => 5,      // 5% chance of being a transfer
            'add' => 5,           // 5% chance of being an add
            'remove' => 5,        // 5% chance of being a remove
        ];
        
        // Create 100 random stock transactions
        for ($i = 0; $i < 100; $i++) {
            // Select a random store and user
            $store = $stores->random();
            $user = $users->random();
            
            // Select a transaction type based on weighted probabilities
            $transaction_type = $this->getRandomWeightedElement($transactionTypes);
            
            // Generate a transaction date within the last year
            $transaction_date = $faker->dateTimeBetween('-1 year', 'now');
            
            // Generate transaction amount based on transaction type
            $transaction_amount = 0;
            switch ($transaction_type) {
                case 'purchase':
                case 'sale':
                    // These typically have higher amounts
                    $transaction_amount = $faker->randomFloat(2, 50, 5000);
                    break;
                case 'return':
                    // Returns are usually smaller
                    $transaction_amount = $faker->randomFloat(2, 20, 1000);
                    break;
                case 'adjustment':
                case 'transfer':
                case 'add':
                case 'remove':
                    // These might have smaller or no monetary value
                    $transaction_amount = $faker->randomFloat(2, 0, 500);
                    break;
            }
            
            // Create the stock transaction
            StockTransaction::create([
                'store_id' => $store->id,
                'user_id' => $user->id,
                'transaction_type' => $transaction_type,
                'transaction_date' => $transaction_date,
                'transaction_amount' => $transaction_amount,
            ]);
        }
    }
    
    /**
     * Get a random element from an array with weighted probabilities.
     * The weights should sum to 100.
     *
     * @param array $weightedValues Array with elements as keys and weights as values
     * @return string The selected element
     */
    private function getRandomWeightedElement(array $weightedValues)
    {
        $rand = mt_rand(1, 100);
        $total = 0;
        
        foreach ($weightedValues as $key => $weight) {
            $total += $weight;
            if ($rand <= $total) {
                return $key;
            }
        }
        
        // Fallback to a random key (shouldn't reach here if weights sum to 100)
        return array_rand($weightedValues);
    }
}
