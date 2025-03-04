<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Store\Store;

class StoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stores = [
            [
                'name' => 'Main Street Auto',
                'address' => '123 Main St, Anytown, USA',
                'phone' => '555-123-4567',
            ],
            [
                'name' => 'Downtown Car Parts',
                'address' => '456 Oak Ave, Metropolis, USA',
                'phone' => '555-987-6543',
            ],
            [
                'name' => 'Suburban Auto Supply',
                'address' => '789 Elm Rd, Smallville, USA',
                'phone' => '555-456-7890',
            ],
        ];

        foreach ($stores as $store) {
            Store::create($store);
        }
    }
}
