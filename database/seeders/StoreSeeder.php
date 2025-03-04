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
                'location_address' => '123 Main St, Anytown, USA',
                'contact_number' => '555-123-4567',
                'email' => 'info@mainstreetauto.com',
            ],
            [
                'name' => 'Downtown Car Parts',
                'location_address' => '456 Oak Ave, Metropolis, USA',
                'contact_number' => '555-987-6543',
                'email' => 'sales@downtowncarparts.com',
            ],
            [
                'name' => 'Suburban Auto Supply',
                'location_address' => '789 Elm Rd, Smallville, USA',
                'contact_number' => '555-456-7890',
                'email' => 'support@suburbanauto.com',
            ],
        ];

        foreach ($stores as $store) {
            Store::create($store);
        }
    }
}
